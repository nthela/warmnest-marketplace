import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

// Resolve storage IDs to public URLs for a product's images
async function resolveImageUrls(ctx: QueryCtx, images: string[]): Promise<(string | null)[]> {
    return Promise.all(
        images.map(async (id) => {
            try {
                return await ctx.storage.getUrl(id as Id<"_storage">);
            } catch {
                // If it's already a URL or invalid, return as-is
                return id.startsWith("http") ? id : null;
            }
        })
    );
}

export const list = query({
    args: {
        category: v.optional(v.string()),
        search: v.optional(v.string()),
        vendorId: v.optional(v.id("vendors")),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        // If search query provided, use the search index
        if (args.search) {
            const searchResults = await ctx.db
                .query("products")
                .withSearchIndex("search_name", (q) => {
                    let sq = q.search("name", args.search!);
                    if (args.category) {
                        sq = sq.eq("category", args.category);
                    }
                    sq = sq.eq("isActive", true);
                    return sq;
                })
                .collect();

            // Filter out out-of-stock products
            const inStockResults = searchResults.filter(p => p.stock > 0);

            // Manual pagination for search results
            const cursor = args.paginationOpts.cursor;
            const numItems = args.paginationOpts.numItems;
            const startIndex = cursor ? parseInt(cursor) : 0;
            const page = inStockResults.slice(startIndex, startIndex + numItems);
            const nextCursor = startIndex + numItems < inStockResults.length
                ? String(startIndex + numItems)
                : null;

            const pageWithUrls = await Promise.all(
                page.map(async (product) => {
                    const imageUrls = await resolveImageUrls(ctx, product.images);
                    return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
                })
            );

            return {
                page: pageWithUrls,
                isDone: nextCursor === null,
                continueCursor: nextCursor ?? "",
            };
        }

        // Normal listing with index-based query
        let q = ctx.db.query("products").withIndex("by_category");

        if (args.category !== undefined) {
            q = ctx.db.query("products").withIndex("by_category", (q) => q.eq("category", args.category!));
        } else if (args.vendorId !== undefined) {
            q = ctx.db.query("products").withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId!));
        }

        const results = await q.filter(q => q.and(q.eq(q.field("isActive"), true), q.gt(q.field("stock"), 0))).paginate(args.paginationOpts);

        const pageWithUrls = await Promise.all(
            results.page.map(async (product) => {
                const imageUrls = await resolveImageUrls(ctx, product.images);
                return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
            })
        );

        return { ...results, page: pageWithUrls };
    },
});

export const featured = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products")
            .withIndex("by_category")
            .filter((q) => q.and(q.eq(q.field("isActive"), true), q.gt(q.field("stock"), 0)))
            .order("desc")
            .take(8);

        const withUrls = await Promise.all(
            products.map(async (product) => {
                const imageUrls = await resolveImageUrls(ctx, product.images);
                return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
            })
        );

        return withUrls;
    },
});

export const byCategories = query({
    args: {},
    handler: async (ctx) => {
        const catSetting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "categories"))
            .first();
        const categories: string[] = catSetting && catSetting.value
            ? JSON.parse(catSetting.value)
            : ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"];

        const result = [];

        for (const category of categories) {
            const products = await ctx.db
                .query("products")
                .withIndex("by_category", (q) => q.eq("category", category))
                .filter((q) => q.and(q.eq(q.field("isActive"), true), q.gt(q.field("stock"), 0)))
                .order("desc")
                .take(10);

            if (products.length === 0) continue;

            const withUrls = await Promise.all(
                products.map(async (product) => {
                    const imageUrls = await resolveImageUrls(ctx, product.images);
                    return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
                })
            );

            result.push({ category, products: withUrls });
        }

        return result;
    },
});

export const get = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id);
        if (!product) return null;

        const imageUrls = await resolveImageUrls(ctx, product.images);

        // Fetch vendor info
        const vendor = await ctx.db.get(product.vendorId);
        const vendorName = vendor?.storeName ?? "Unknown Seller";
        const commissionRate = vendor?.commissionRate ?? 0.12;

        return { ...product, imageUrls: imageUrls.filter(Boolean) as string[], vendorName, commissionRate };
    },
});

// Fetch specific products by IDs (for "Pick Up Where You Left Off")
export const getByIds = query({
    args: { ids: v.array(v.string()) },
    handler: async (ctx, args) => {
        const result = [];
        for (const id of args.ids) {
            try {
                const product = await ctx.db.get(id as Id<"products">);
                if (!product || !product.isActive || product.stock <= 0) continue;
                const imageUrls = await resolveImageUrls(ctx, product.images);
                result.push({ ...product, imageUrls: imageUrls.filter(Boolean) as string[] });
            } catch {
                // Invalid ID, skip
            }
        }
        return result;
    },
});

// Products on sale (for "MORE Deals For You")
export const deals = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db
            .query("products")
            .withIndex("by_category")
            .filter((q) =>
                q.and(
                    q.eq(q.field("isActive"), true),
                    q.gt(q.field("stock"), 0),
                    q.neq(q.field("salePrice"), undefined)
                )
            )
            .order("desc")
            .take(20);

        const withUrls = await Promise.all(
            all.map(async (product) => {
                const imageUrls = await resolveImageUrls(ctx, product.images);
                return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
            })
        );

        return withUrls;
    },
});

// Newest products overall (for "Discover What's Hot")
export const newest = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products")
            .order("desc")
            .filter((q) => q.and(q.eq(q.field("isActive"), true), q.gt(q.field("stock"), 0)))
            .take(12);

        const withUrls = await Promise.all(
            products.map(async (product) => {
                const imageUrls = await resolveImageUrls(ctx, product.images);
                return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
            })
        );

        return withUrls;
    },
});

// Products in a specific category (for "Popular in X" and "New In X")
export const byCategory = query({
    args: { category: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const products = await ctx.db
            .query("products")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .filter((q) => q.and(q.eq(q.field("isActive"), true), q.gt(q.field("stock"), 0)))
            .order("desc")
            .take(args.limit ?? 12);

        const withUrls = await Promise.all(
            products.map(async (product) => {
                const imageUrls = await resolveImageUrls(ctx, product.images);
                return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
            })
        );

        return withUrls;
    },
});
