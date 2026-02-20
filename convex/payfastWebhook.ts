import { v } from "convex/values";
import { httpAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// ─── HTTP ACTION: PayFast ITN Webhook ───────────────────────
// Receives the POST from PayFast, then delegates to the Node.js action for crypto verification

export const handleITN = httpAction(async (ctx, request) => {
    try {
        const body = await request.text();
        const urlParams = new URLSearchParams(body);
        const data: Record<string, string> = {};
        for (const [key, value] of urlParams.entries()) {
            data[key] = value;
        }

        // Delegate to Node.js action for signature verification and processing
        const result = await ctx.runAction(internal.payfast.verifyAndProcessITN, {
            body,
            data,
        });

        if (result.ok) {
            return new Response("OK", { status: 200 });
        } else {
            return new Response(result.error ?? "Verification failed", { status: 400 });
        }
    } catch (error) {
        console.error("PayFast ITN error:", error);
        return new Response("Internal error", { status: 500 });
    }
});

// ─── INTERNAL: Used by the verification action ──────────────

export const getOrderForVerification = internalQuery({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) return null;
        return await ctx.db.get(normalizedId);
    },
});

export const updateOrderPayment = internalMutation({
    args: {
        orderId: v.string(),
        status: v.union(v.literal("paid"), v.literal("cancelled")),
        paymentId: v.string(),
    },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("orders", args.orderId);
        if (!normalizedId) throw new Error("Invalid order ID");

        const order = await ctx.db.get(normalizedId);
        if (!order) throw new Error("Order not found");

        // Idempotency: only update orders still pending
        if (order.status !== "pending") {
            console.log(`Order ${args.orderId} already has status ${order.status}, skipping`);
            return;
        }

        await ctx.db.patch(normalizedId, {
            status: args.status,
            paymentId: args.paymentId,
        });
    },
});
