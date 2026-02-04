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
        let q = ctx.db.query("products").withIndex("by_category");

        if (args.category !== undefined) {
            q = ctx.db.query("products").withIndex("by_category", (q) => q.eq("category", args.category!));
        } else if (args.vendorId !== undefined) {
            q = ctx.db.query("products").withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId!));
        }

        const results = await q.filter(q => q.eq(q.field("isActive"), true)).paginate(args.paginationOpts);

        // Resolve image storage IDs to URLs
        const pageWithUrls = await Promise.all(
            results.page.map(async (product) => {
                const imageUrls = await resolveImageUrls(ctx, product.images);
                return { ...product, imageUrls: imageUrls.filter(Boolean) as string[] };
            })
        );

        return { ...results, page: pageWithUrls };
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

        return { ...product, imageUrls: imageUrls.filter(Boolean) as string[], vendorName };
    },
});
