import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        try {
            const normalizeId = ctx.db.normalizeId("orders", args.orderId);
            if (!normalizeId) return null;
            return await ctx.db.get(normalizeId);
        } catch {
            return null;
        }
    },
});

export const getByUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

export const getOrderItems = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .collect();
    },
});

export const create = mutation({
    args: {
        totalAmount: v.number(),
        paymentId: v.optional(v.string()),
        shippingAddress: v.object({
            street: v.string(),
            city: v.string(),
            province: v.string(),
            code: v.string(),
            country: v.string(),
        }),
        items: v.array(
            v.object({
                productId: v.id("products"),
                quantity: v.number(),
                price: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const orderId = await ctx.db.insert("orders", {
            userId: userId ?? undefined,
            totalAmount: args.totalAmount,
            status: "pending",
            paymentId: args.paymentId,
            shippingAddress: args.shippingAddress,
            createdAt: Date.now(),
        });

        for (const item of args.items) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            await ctx.db.insert("orderItems", {
                orderId,
                productId: item.productId,
                vendorId: product.vendorId,
                quantity: item.quantity,
                price: item.price,
            });
        }

        return orderId;
    },
});
