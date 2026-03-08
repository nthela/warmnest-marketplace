import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const items = await ctx.db
            .query("wishlist")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        const withProducts = await Promise.all(
            items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                if (!product || !product.isActive) return null;

                let imageUrl: string | null = null;
                if (product.images?.[0]) {
                    try {
                        imageUrl = await ctx.storage.getUrl(product.images[0] as Id<"_storage">);
                    } catch {
                        imageUrl = product.images[0].startsWith("http") ? product.images[0] : null;
                    }
                }

                const vendor = await ctx.db.get(product.vendorId);

                return {
                    ...item,
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        salePrice: product.salePrice,
                        imageUrl,
                        category: product.category,
                        stock: product.stock,
                        vendorName: vendor?.storeName ?? "Unknown Seller",
                    },
                };
            })
        );

        return withProducts.filter(Boolean);
    },
});

export const isInWishlist = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", userId).eq("productId", args.productId)
            )
            .first();

        return !!existing;
    },
});

export const toggle = mutation({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("You must be signed in to use the wishlist.");

        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", userId).eq("productId", args.productId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { added: false };
        }

        await ctx.db.insert("wishlist", {
            userId,
            productId: args.productId,
            createdAt: Date.now(),
        });
        return { added: true };
    },
});

export const remove = mutation({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("You must be signed in.");

        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", userId).eq("productId", args.productId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
