import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
    args: { orderId: v.string() }, // Accepts string ID to parse or search
    handler: async (ctx, args) => {
        // We expect a valid ID string. In real app, might search by custom order number field.
        // Here we try to parse it as a system ID.
        try {
            const normalizeId = ctx.db.normalizeId("orders", args.orderId);
            if (!normalizeId) return null;
            return await ctx.db.get(normalizeId);
        } catch (e) {
            return null;
        }
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
    },
    handler: async (ctx, args) => {
        // Mock create order
        return await ctx.db.insert("orders", {
            totalAmount: args.totalAmount,
            status: "pending",
            paymentId: args.paymentId,
            shippingAddress: args.shippingAddress,
            createdAt: Date.now(),
        });
    }
});
