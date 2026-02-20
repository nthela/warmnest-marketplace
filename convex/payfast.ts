"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHash } from "crypto";

// ─── HELPERS ────────────────────────────────────────────────

function md5(input: string): string {
    return createHash("md5").update(input).digest("hex");
}

function generateSignature(
    params: Record<string, string>,
    passphrase: string | null
): string {
    const sortedKeys = Object.keys(params).sort();

    const queryString = sortedKeys
        .filter((key) => params[key] !== undefined && params[key] !== "")
        .map((key) => {
            const value = encodeURIComponent(params[key].trim()).replace(/%20/g, "+");
            return `${key}=${value}`;
        })
        .join("&");

    const signatureString = passphrase
        ? `${queryString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
        : queryString;

    return md5(signatureString);
}

// ─── ACTION: Build signed payment form data ─────────────────

export const buildPaymentData = action({
    args: {
        orderId: v.string(),
        amount: v.number(),
        itemName: v.string(),
        email: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const merchantId = process.env.PAYFAST_MERCHANT_ID;
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
        const passphrase = process.env.PAYFAST_PASSPHRASE ?? null;
        const appUrl = process.env.SITE_URL ?? process.env.APP_URL;
        const convexSiteUrl = process.env.CONVEX_SITE_URL;

        if (!merchantId || !merchantKey || !appUrl) {
            throw new Error("PayFast configuration missing. Set PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, and SITE_URL in Convex environment variables.");
        }

        const notifyUrl = convexSiteUrl
            ? `${convexSiteUrl}/payfast-itn`
            : `${appUrl}/api/payfast-itn`;

        const params: Record<string, string> = {
            merchant_id: merchantId,
            merchant_key: merchantKey,
            return_url: `${appUrl}/checkout/success?orderId=${args.orderId}`,
            cancel_url: `${appUrl}/checkout/cancel?orderId=${args.orderId}`,
            notify_url: notifyUrl,
            m_payment_id: args.orderId,
            amount: args.amount.toFixed(2),
            item_name: args.itemName.substring(0, 100),
        };

        if (args.email) {
            params.email_address = args.email;
        }

        const signature = generateSignature(params, passphrase);
        params.signature = signature;

        return params;
    },
});

// ─── INTERNAL ACTION: Verify and process ITN ────────────────
// Called by the httpAction in payfastWebhook.ts — runs in Node.js for crypto access

export const verifyAndProcessITN = internalAction({
    args: {
        body: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        const data = args.data as Record<string, string>;

        // Step 1: Verify signature
        const receivedSignature = data.signature;
        const paramsWithoutSignature = { ...data };
        delete paramsWithoutSignature.signature;

        const passphrase = process.env.PAYFAST_PASSPHRASE ?? null;
        const expectedSignature = generateSignature(paramsWithoutSignature, passphrase);

        if (receivedSignature !== expectedSignature) {
            console.error("PayFast ITN: Signature mismatch");
            return { ok: false, error: "Signature mismatch" };
        }

        // Step 2: Verify data matches our order
        const orderId = data.m_payment_id;
        const order = await ctx.runQuery(internal.payfastWebhook.getOrderForVerification, { orderId });

        if (!order) {
            console.error("PayFast ITN: Order not found:", orderId);
            return { ok: false, error: "Order not found" };
        }

        const receivedAmount = parseFloat(data.amount_gross);
        if (Math.abs(receivedAmount - order.totalAmount) > 0.01) {
            console.error("PayFast ITN: Amount mismatch", receivedAmount, order.totalAmount);
            return { ok: false, error: "Amount mismatch" };
        }

        const merchantId = process.env.PAYFAST_MERCHANT_ID;
        if (data.merchant_id !== merchantId) {
            console.error("PayFast ITN: Merchant ID mismatch");
            return { ok: false, error: "Merchant ID mismatch" };
        }

        // Step 3: Confirm with PayFast server
        const isSandbox = process.env.PAYFAST_SANDBOX === "true";
        const validateUrl = isSandbox
            ? "https://sandbox.payfast.co.za/eng/query/validate"
            : "https://www.payfast.co.za/eng/query/validate";

        const validateResponse = await fetch(validateUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: args.body,
        });

        const validateResult = await validateResponse.text();
        if (validateResult !== "VALID") {
            console.error("PayFast ITN: Validation failed:", validateResult);
            return { ok: false, error: "Validation failed" };
        }

        // Step 4: Update order based on payment status
        const paymentStatus = data.payment_status;
        const pfPaymentId = data.pf_payment_id;

        if (paymentStatus === "COMPLETE") {
            await ctx.runMutation(internal.payfastWebhook.updateOrderPayment, {
                orderId,
                status: "paid",
                paymentId: pfPaymentId,
            });
        } else if (paymentStatus === "CANCELLED") {
            await ctx.runMutation(internal.payfastWebhook.updateOrderPayment, {
                orderId,
                status: "cancelled",
                paymentId: pfPaymentId,
            });
        }

        return { ok: true };
    },
});
