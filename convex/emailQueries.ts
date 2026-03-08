import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

// Internal queries used by email.ts actions to fetch order data

export const getOrderWithItems = internalQuery({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) return null;

        const order = await ctx.db.get(normalizedId);
        if (!order) return null;

        let customerName = "Customer";
        let customerEmail: string | null = null;

        if (order.userId) {
            const user = await ctx.db.get(order.userId);
            if (user) {
                customerName = user.name ?? "Customer";
                customerEmail = user.email ?? null;
            }
        } else if (order.guestEmail) {
            customerEmail = order.guestEmail;
        }

        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", normalizedId))
            .collect();

        const items = await Promise.all(
            orderItems.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return {
                    name: product?.name ?? "Product",
                    quantity: item.quantity,
                    price: item.price,
                };
            })
        );

        return {
            customerName,
            customerEmail,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress,
            items,
        };
    },
});

export const getOrderBasic = internalQuery({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) return null;

        const order = await ctx.db.get(normalizedId);
        if (!order) return null;

        let customerName = "Customer";
        let customerEmail: string | null = null;

        if (order.userId) {
            const user = await ctx.db.get(order.userId);
            if (user) {
                customerName = user.name ?? "Customer";
                customerEmail = user.email ?? null;
            }
        } else if (order.guestEmail) {
            customerEmail = order.guestEmail;
        }

        return {
            customerName,
            customerEmail,
            shippingAddress: order.shippingAddress,
        };
    },
});

export const getVendorOrderDetails = internalQuery({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) return [];

        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", normalizedId))
            .collect();

        // Group items by vendor
        const vendorMap = new Map<
            string,
            {
                vendorId: string;
                storeName: string;
                vendorEmail: string | null;
                commissionRate: number;
                items: { name: string; quantity: number; price: number }[];
            }
        >();

        for (const item of orderItems) {
            const vendorId = item.vendorId.toString();

            if (!vendorMap.has(vendorId)) {
                const vendor = await ctx.db.get(item.vendorId);
                let vendorEmail: string | null = null;
                if (vendor) {
                    const vendorUser = await ctx.db.get(vendor.userId);
                    vendorEmail = vendorUser?.email ?? null;
                }
                vendorMap.set(vendorId, {
                    vendorId,
                    storeName: vendor?.storeName ?? "Vendor",
                    vendorEmail,
                    commissionRate: vendor?.commissionRate ?? 0.12,
                    items: [],
                });
            }

            const product = await ctx.db.get(item.productId);
            vendorMap.get(vendorId)!.items.push({
                name: product?.name ?? "Product",
                quantity: item.quantity,
                price: item.price,
            });
        }

        return Array.from(vendorMap.values()).map((v) => ({
            storeName: v.storeName,
            vendorEmail: v.vendorEmail,
            items: v.items,
            totalForVendor: v.items.reduce(
                (sum, item) => sum + item.price * item.quantity * (1 - v.commissionRate),
                0
            ),
        }));
    },
});
