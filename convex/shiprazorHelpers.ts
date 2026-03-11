import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Fetch full order details needed to create a ShipRazor order.
 */
export const getOrderWithDetails = internalQuery({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) return null;

        const order = await ctx.db.get(normalizedId);
        if (!order) return null;

        // Get order items with product details
        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", normalizedId))
            .collect();

        const items = await Promise.all(
            orderItems.map(async (oi) => {
                const product = await ctx.db.get(oi.productId);
                const vendor = oi.vendorId ? await ctx.db.get(oi.vendorId) : null;
                return {
                    productId: oi.productId as string,
                    vendorId: oi.vendorId as string,
                    productName: product?.name ?? "Product",
                    sku: product?.sku ?? undefined,
                    quantity: oi.quantity,
                    price: oi.price,
                    shiprazorWarehouseId: vendor?.shiprazorWarehouseId ?? undefined,
                };
            })
        );

        // Get buyer info
        const buyer = order.userId ? await ctx.db.get(order.userId) : null;

        return {
            order: {
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress,
            },
            items,
            buyer: {
                name: buyer?.name ?? "Customer",
                surname: buyer?.surname ?? "",
                email: buyer?.email ?? "",
                phone: buyer?.phone ?? "",
            },
        };
    },
});

/**
 * Save the ShipRazor order ID to our order record for tracking.
 */
export const saveShiprazorOrderId = internalMutation({
    args: {
        orderId: v.string(),
        shiprazorOrderId: v.number(),
    },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) throw new Error("Invalid order ID");

        await ctx.db.patch(normalizedId, {
            shiprazorOrderId: args.shiprazorOrderId,
            status: "processing",
        });
    },
});

/**
 * Update order status from ShipRazor webhook.
 */
export const updateStatusFromWebhook = internalMutation({
    args: {
        shiprazorOrderId: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        // Find order by shiprazorOrderId
        const orders = await ctx.db.query("orders").collect();
        const order = orders.find((o) => o.shiprazorOrderId === args.shiprazorOrderId);

        if (!order) {
            console.error("ShipRazor webhook: No order found for ShipRazor ID:", args.shiprazorOrderId);
            return;
        }

        // Map ShipRazor statuses to WarmNest statuses
        const statusMap: Record<string, string> = {
            NEW: "processing",
            PICKED_UP: "shipped",
            IN_TRANSIT: "shipped",
            OUT_FOR_DELIVERY: "shipped",
            DELIVERED: "delivered",
            CANCELLED: "cancelled",
            RETURNED: "cancelled",
        };

        const newStatus = statusMap[args.status];
        if (newStatus && newStatus !== order.status) {
            await ctx.db.patch(order._id, {
                status: newStatus as typeof order.status,
            });
            console.log(`ShipRazor webhook: Order ${order._id} status → ${newStatus}`);
        }
    },
});
