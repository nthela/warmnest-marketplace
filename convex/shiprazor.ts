"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const SHIPRAZOR_API_URL = "https://shiprazor.com/api/vendor/order";

interface OrderItem {
    productId: string;
    vendorId: string;
    productName: string;
    sku?: string;
    quantity: number;
    price: number;
    shiprazorWarehouseId?: string;
}

/**
 * Create ShipRazor orders after payment is confirmed.
 * Groups items by vendor warehouse and creates one ShipRazor order per warehouse.
 */
export const createOrder = internalAction({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const apiKey = process.env.SHIPRAZOR_API_KEY;
        const fallbackWarehouseId = process.env.SHIPRAZOR_WAREHOUSE_ID;

        if (!apiKey) {
            console.error("ShipRazor: SHIPRAZOR_API_KEY not set — skipping order creation");
            return { ok: false, error: "ShipRazor not configured" };
        }

        const orderData = await ctx.runQuery(internal.shiprazorHelpers.getOrderWithDetails, {
            orderId: args.orderId,
        });

        if (!orderData) {
            console.error("ShipRazor: Order not found:", args.orderId);
            return { ok: false, error: "Order not found" };
        }

        const { order, items, buyer } = orderData;
        const addr = order.shippingAddress;

        // Split buyer name
        const nameParts = (buyer.name ?? "Customer").split(" ");
        const firstName = nameParts[0] || "Customer";
        const lastName = nameParts.slice(1).join(" ") || (buyer.surname ?? "");

        const buyerDetails = {
            permanentAddress: {
                firstName,
                lastName,
                emailId: buyer.email ?? "",
                contactNumber: buyer.phone ?? "",
                address: addr.street,
                houseNumberOrBuildingName: "",
                suburb: addr.city,
                province: addr.province,
                city: addr.city,
                country: addr.country || "South Africa",
                postalCode: addr.code,
            },
            billingAddress: {
                firstName,
                lastName,
                emailId: buyer.email ?? "",
                contactNumber: buyer.phone ?? "",
                alternateContactNumber: buyer.phone ?? "",
                address: addr.street,
                houseNumberOrBuildingName: "",
                province: addr.province,
                suburb: addr.city,
                city: addr.city,
                country: addr.country || "South Africa",
                postalCode: addr.code,
            },
            isBillingAddressSame: true,
        };

        // Group items by warehouse ID (one ShipRazor order per pickup warehouse)
        const warehouseGroups = new Map<string, OrderItem[]>();

        for (const item of items as OrderItem[]) {
            const whId = item.shiprazorWarehouseId || fallbackWarehouseId || "";
            if (!whId) {
                console.error(`ShipRazor: No warehouse for vendor ${item.vendorId}, skipping item ${item.productName}`);
                continue;
            }
            const group = warehouseGroups.get(whId) ?? [];
            group.push(item);
            warehouseGroups.set(whId, group);
        }

        if (warehouseGroups.size === 0) {
            console.error("ShipRazor: No warehouses found for any items — no orders created");
            return { ok: false, error: "No warehouse configured for vendors" };
        }

        // Create one ShipRazor order per warehouse
        const results: { warehouseId: string; shiprazorOrderId?: number; error?: string }[] = [];
        let firstOrderId: number | undefined;

        for (const [whId, groupItems] of warehouseGroups) {
            const body = {
                orderType: "DOMESTIC",
                buyerDetails,
                orderDetails: {
                    paymentMode: "PREPAID",
                    productCategory: "OTHER",
                    products: groupItems.map((item) => ({
                        productName: item.productName,
                        quantity: item.quantity,
                        sku: item.sku || `WN-${item.productId.slice(-8)}`,
                        unitPrice: item.price,
                    })),
                    totalWeight: Math.max(1, groupItems.reduce((sum, i) => sum + i.quantity, 0)),
                    totalPackages: 1,
                    length: 20,
                    width: 15,
                    height: 10,
                },
                pickupWareHouseId: whId,
                vendorOrderId: `${args.orderId}-${whId.slice(-6)}`,
                shipDetails: {
                    serviceType: "COURIERGUY",
                    vehicleType: "ECONOMY",
                    maxShipCost: 300,
                },
            };

            try {
                const response = await fetch(SHIPRAZOR_API_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Apikey ${apiKey}`,
                        VENDOR_API_KEY: apiKey,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

                const data = await response.json();

                if (data.status === 200 && data.data?.orderResponse?.orderId) {
                    const srOrderId = data.data.orderResponse.orderId as number;
                    console.log(`ShipRazor: Order #${srOrderId} created (warehouse ${whId}) for WarmNest order ${args.orderId}`);
                    results.push({ warehouseId: whId, shiprazorOrderId: srOrderId });
                    if (!firstOrderId) firstOrderId = srOrderId;
                } else {
                    const failReasons = data.data?.orderResponse?.shipFailedReasons ?? [];
                    console.error(`ShipRazor: Failed for warehouse ${whId}:`, JSON.stringify(data));
                    results.push({ warehouseId: whId, error: failReasons.join(", ") || "Unknown error" });
                }
            } catch (error) {
                console.error(`ShipRazor: API call failed for warehouse ${whId}:`, error);
                results.push({ warehouseId: whId, error: String(error) });
            }
        }

        // Save the first successful ShipRazor order ID to our order for tracking
        if (firstOrderId) {
            await ctx.runMutation(internal.shiprazorHelpers.saveShiprazorOrderId, {
                orderId: args.orderId,
                shiprazorOrderId: firstOrderId,
            });
        }

        const anySuccess = results.some((r) => r.shiprazorOrderId);
        return { ok: anySuccess, results };
    },
});
