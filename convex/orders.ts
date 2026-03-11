import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const get = query({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        try {
            const normalizeId = ctx.db.normalizeId("orders", args.orderId);
            if (!normalizeId) return null;

            const order = await ctx.db.get(normalizeId);
            if (!order) return null;

            // Auth check: only the order owner or an admin can view order details
            const userId = await getAuthUserId(ctx);
            if (!userId) return null;

            if (order.userId !== userId) {
                const user = await ctx.db.get(userId);
                if (!user || user.role !== "admin") return null;
            }

            return order;
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

        const orders = await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await ctx.db
                    .query("orderItems")
                    .withIndex("by_order", (q) => q.eq("orderId", order._id))
                    .collect();

                const itemsWithProducts = await Promise.all(
                    items.map(async (item) => {
                        const product = await ctx.db.get(item.productId);
                        let imageUrl: string | null = null;
                        if (product?.images?.[0]) {
                            try {
                                imageUrl = await ctx.storage.getUrl(product.images[0] as any);
                            } catch {
                                imageUrl = product.images[0].startsWith("http") ? product.images[0] : null;
                            }
                        }
                        return {
                            ...item,
                            productName: product?.name ?? "Deleted product",
                            productImage: imageUrl,
                        };
                    })
                );

                return { ...order, items: itemsWithProducts };
            })
        );

        return ordersWithItems;
    },
});

export const getOrderItems = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        // Auth check: only order owner or admin can view items
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const order = await ctx.db.get(args.orderId);
        if (!order) return [];

        if (order.userId !== userId) {
            const user = await ctx.db.get(userId);
            if (!user || user.role !== "admin") return [];
        }

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
        couponCode: v.optional(v.string()),
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
        if (!userId) {
            throw new Error("You must be signed in to place an order.");
        }

        // Validate stock for all items before creating the order
        const productsToUpdate: { productId: typeof args.items[0]["productId"]; product: { vendorId: any; stock: number }; quantity: number }[] = [];
        for (const item of args.items) {
            const product = await ctx.db.get(item.productId);
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            if (!product.isActive) {
                throw new Error(`Product "${product.name}" is no longer available.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(
                    `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`
                );
            }
            productsToUpdate.push({ productId: item.productId, product, quantity: item.quantity });
        }

        // Free orders (R0 total with coupon) are marked as paid immediately
        const isFreeOrder = args.totalAmount === 0 && args.couponCode;

        const orderId = await ctx.db.insert("orders", {
            userId,
            totalAmount: args.totalAmount,
            status: isFreeOrder ? "paid" : "pending",
            paymentId: isFreeOrder ? `coupon:${args.couponCode}` : args.paymentId,
            shippingAddress: args.shippingAddress,
            createdAt: Date.now(),
        });

        // Insert order items and decrement stock atomically
        for (const { productId, product, quantity } of productsToUpdate) {
            await ctx.db.insert("orderItems", {
                orderId,
                productId,
                vendorId: product.vendorId,
                quantity,
                price: args.items.find((i) => i.productId === productId)!.price,
            });

            await ctx.db.patch(productId, {
                stock: product.stock - quantity,
            });
        }

        // Send confirmation emails for free orders (paid orders get emails from PayFast webhook)
        if (isFreeOrder) {
            await ctx.scheduler.runAfter(0, internal.email.sendOrderConfirmation, { orderId: orderId as string });
            await ctx.scheduler.runAfter(0, internal.email.sendVendorNewOrderAlert, { orderId: orderId as string });
            // Create ShipRazor order for courier dispatch
            await ctx.scheduler.runAfter(0, internal.shiprazor.createOrder, { orderId: orderId as string });
        }

        // Schedule auto-cancel after 30 minutes for unpaid orders
        if (!isFreeOrder) {
            await ctx.scheduler.runAfter(
                30 * 60 * 1000, // 30 minutes
                internal.orders.autoCancelUnpaid,
                { orderId }
            );
        }

        return orderId;
    },
});

// ─── INTERNAL: Auto-cancel unpaid orders and restore stock ─────────
export const autoCancelUnpaid = internalMutation({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) return;

        // Only cancel if still pending (not yet paid)
        if (order.status !== "pending") {
            return;
        }

        // Mark order as cancelled
        await ctx.db.patch(args.orderId, { status: "cancelled" });

        // Restore stock for each item
        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .collect();

        for (const item of orderItems) {
            const product = await ctx.db.get(item.productId);
            if (product) {
                await ctx.db.patch(item.productId, {
                    stock: product.stock + item.quantity,
                });
            }
        }

        console.log(`Order ${args.orderId} auto-cancelled after 30min — stock restored`);
    },
});
