import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByProduct = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_product", (q) => q.eq("productId", args.productId))
            .order("desc")
            .collect();

        const withUserNames = await Promise.all(
            reviews.map(async (review) => {
                const user = await ctx.db.get(review.userId);
                return {
                    ...review,
                    userName: user?.name ?? "Anonymous",
                };
            })
        );

        return withUserNames;
    },
});

export const getStats = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_product", (q) => q.eq("productId", args.productId))
            .collect();

        if (reviews.length === 0) {
            return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
        }

        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
        for (const r of reviews) {
            distribution[r.rating - 1]++;
        }

        return {
            average: Math.round((total / reviews.length) * 10) / 10,
            count: reviews.length,
            distribution,
        };
    },
});

export const userCanReview = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return { canReview: false, reason: "sign_in" as const, hasReviewed: false };

        // Check if user already reviewed this product
        const existing = await ctx.db
            .query("reviews")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", userId).eq("productId", args.productId)
            )
            .first();

        if (existing) return { canReview: false, reason: "already_reviewed" as const, hasReviewed: true };

        return { canReview: true, reason: null, hasReviewed: false };
    },
});

export const create = mutation({
    args: {
        productId: v.id("products"),
        rating: v.number(),
        title: v.string(),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("You must be signed in to leave a review.");

        if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
            throw new Error("Rating must be an integer between 1 and 5.");
        }

        const title = args.title.trim();
        const body = args.body.trim();
        if (!title || title.length > 200) {
            throw new Error("Review title is required and must be under 200 characters.");
        }
        if (!body || body.length > 2000) {
            throw new Error("Review body is required and must be under 2000 characters.");
        }

        // Check user hasn't already reviewed this product
        const existing = await ctx.db
            .query("reviews")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", userId).eq("productId", args.productId)
            )
            .first();

        if (existing) throw new Error("You have already reviewed this product.");

        // Check if user has purchased this product (for verified badge)
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("status"), "paid"),
                    q.eq(q.field("status"), "shipped"),
                    q.eq(q.field("status"), "delivered"),
                    q.eq(q.field("status"), "completed")
                )
            )
            .collect();

        let verifiedPurchase = false;
        for (const order of orders) {
            const items = await ctx.db
                .query("orderItems")
                .withIndex("by_order", (q) => q.eq("orderId", order._id))
                .collect();
            if (items.some((item) => item.productId === args.productId)) {
                verifiedPurchase = true;
                break;
            }
        }

        return await ctx.db.insert("reviews", {
            productId: args.productId,
            userId,
            rating: args.rating,
            title,
            body,
            verifiedPurchase,
            createdAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { reviewId: v.id("reviews") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const review = await ctx.db.get(args.reviewId);
        if (!review) throw new Error("Review not found");

        // Allow deletion by review author or admin
        const user = await ctx.db.get(userId);
        if (review.userId !== userId && user?.role !== "admin") {
            throw new Error("You can only delete your own reviews.");
        }

        await ctx.db.delete(args.reviewId);
    },
});
