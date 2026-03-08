"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { randomUUID } from "crypto";

// ─── ZEPTOMAIL SEND HELPER ──────────────────────────────────

async function sendEmail({
    to,
    toName,
    subject,
    htmlBody,
}: {
    to: string;
    toName: string;
    subject: string;
    htmlBody: string;
}) {
    const token = process.env.ZEPTOMAIL_TOKEN;
    const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL ?? "noreply@warmnest.co.za";
    const fromName = process.env.ZEPTOMAIL_FROM_NAME ?? "WarmNest";

    if (!token) {
        console.warn("ZEPTOMAIL_TOKEN not set — skipping email:", subject, "to:", to);
        return { ok: false, error: "ZEPTOMAIL_TOKEN not configured" };
    }

    try {
        const response = await fetch("https://api.zeptomail.com/v1.1/email", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify({
                from: { address: fromEmail, name: fromName },
                to: [{ email_address: { address: to, name: toName } }],
                subject,
                htmlbody: htmlBody,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ZeptoMail error:", response.status, errorText);
            return { ok: false, error: errorText };
        }

        return { ok: true };
    } catch (error) {
        console.error("ZeptoMail send failed:", error);
        return { ok: false, error: String(error) };
    }
}

// ─── EMAIL WRAPPER (base layout) ────────────────────────────

function emailLayout(content: string) {
    const siteUrl = process.env.SITE_URL ?? "https://warmnest.co.za";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color:#0f172a;padding:24px 32px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">WarmNest</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:32px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                            <p style="margin:0;color:#94a3b8;font-size:12px;">
                                &copy; ${new Date().getFullYear()} WarmNest Marketplace. All rights reserved.
                            </p>
                            <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">
                                <a href="${siteUrl}" style="color:#64748b;text-decoration:underline;">Visit our store</a>
                                &nbsp;&middot;&nbsp;
                                <a href="${siteUrl}/track-order" style="color:#64748b;text-decoration:underline;">Track order</a>
                                &nbsp;&middot;&nbsp;
                                <a href="${siteUrl}/returns" style="color:#64748b;text-decoration:underline;">Returns policy</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ─── EMAIL TEMPLATES ────────────────────────────────────────

function orderConfirmationHtml(order: {
    orderId: string;
    totalAmount: number;
    items: { name: string; quantity: number; price: number }[];
    shippingAddress: { street: string; city: string; province: string; code: string; country: string };
}) {
    const siteUrl = process.env.SITE_URL ?? "https://warmnest.co.za";

    const itemRows = order.items
        .map(
            (item) => `
            <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                    <span style="font-weight:500;">${item.name}</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">R ${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`
        )
        .join("");

    return emailLayout(`
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Payment Confirmed!</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
            Thank you for your order. We've received your payment and your order is being processed.
        </p>

        <table width="100%" style="background-color:#f0fdf4;border-radius:6px;padding:16px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <p style="margin:0;font-size:12px;color:#16a34a;font-weight:600;text-transform:uppercase;">Order ID</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-family:monospace;">${order.orderId}</p>
                </td>
                <td style="text-align:right;">
                    <p style="margin:0;font-size:12px;color:#16a34a;font-weight:600;text-transform:uppercase;">Total</p>
                    <p style="margin:4px 0 0;font-size:20px;color:#0f172a;font-weight:700;">R ${order.totalAmount.toFixed(2)}</p>
                </td>
            </tr>
        </table>

        <h3 style="margin:0 0 12px;color:#0f172a;font-size:16px;">Items Ordered</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;margin-bottom:24px;">
            <tr style="border-bottom:2px solid #e2e8f0;">
                <th style="padding:8px 0;text-align:left;font-weight:600;">Product</th>
                <th style="padding:8px 0;text-align:center;font-weight:600;">Qty</th>
                <th style="padding:8px 0;text-align:right;font-weight:600;">Subtotal</th>
            </tr>
            ${itemRows}
        </table>

        <h3 style="margin:0 0 8px;color:#0f172a;font-size:16px;">Shipping Address</h3>
        <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.code}<br>
            ${order.shippingAddress.country}
        </p>

        <div style="margin-top:24px;text-align:center;">
            <a href="${siteUrl}/track-order?id=${order.orderId}"
               style="display:inline-block;background-color:#0f172a;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
                Track Your Order
            </a>
        </div>
    `);
}

function shippingUpdateHtml(order: {
    orderId: string;
    status: string;
    shippingAddress: { street: string; city: string; province: string; code: string; country: string };
}) {
    const siteUrl = process.env.SITE_URL ?? "https://warmnest.co.za";

    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
        shipped: {
            title: "Your order has been shipped!",
            message: "Your package is on its way. You can track its progress using the button below.",
            color: "#7c3aed",
        },
        delivered: {
            title: "Your order has been delivered!",
            message: "Your package has arrived. We hope you love your purchase!",
            color: "#059669",
        },
        completed: {
            title: "Your order is complete!",
            message: "Your order has been finalised. Thank you for shopping with WarmNest!",
            color: "#16a34a",
        },
        cancelled: {
            title: "Your order has been cancelled",
            message: "Your order has been cancelled. If you did not request this, please contact us.",
            color: "#dc2626",
        },
        processing: {
            title: "Your order is being processed",
            message: "We are preparing your order for shipment. We'll notify you when it ships.",
            color: "#2563eb",
        },
    };

    const info = statusMessages[order.status] ?? {
        title: `Order status: ${order.status}`,
        message: "Your order status has been updated.",
        color: "#64748b",
    };

    return emailLayout(`
        <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background-color:${info.color}20;line-height:48px;font-size:24px;">
                ${order.status === "shipped" ? "📦" : order.status === "delivered" ? "📬" : order.status === "completed" ? "✅" : order.status === "cancelled" ? "❌" : "⏳"}
            </div>
        </div>

        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;text-align:center;">${info.title}</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;text-align:center;">${info.message}</p>

        <table width="100%" style="background-color:#f8fafc;border-radius:6px;padding:16px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">ORDER ID</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-family:monospace;">${order.orderId}</p>
                </td>
                <td style="text-align:right;">
                    <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">STATUS</p>
                    <p style="margin:4px 0 0;font-size:14px;color:${info.color};font-weight:700;text-transform:uppercase;">${order.status}</p>
                </td>
            </tr>
        </table>

        <h3 style="margin:0 0 8px;color:#0f172a;font-size:16px;">Shipping To</h3>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.code}<br>
            ${order.shippingAddress.country}
        </p>

        <div style="text-align:center;">
            <a href="${siteUrl}/track-order?id=${order.orderId}"
               style="display:inline-block;background-color:#0f172a;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
                Track Your Order
            </a>
        </div>
    `);
}

function vendorNewOrderHtml(vendor: {
    storeName: string;
    orderId: string;
    items: { name: string; quantity: number; price: number }[];
    totalForVendor: number;
}) {
    const siteUrl = process.env.SITE_URL ?? "https://warmnest.co.za";

    const itemRows = vendor.items
        .map(
            (item) => `
            <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${item.name}</td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">R ${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`
        )
        .join("");

    return emailLayout(`
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">New Order Received!</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
            Great news, ${vendor.storeName}! You have a new order to fulfil.
        </p>

        <table width="100%" style="background-color:#eff6ff;border-radius:6px;padding:16px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <p style="margin:0;font-size:12px;color:#2563eb;font-weight:600;">ORDER ID</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-family:monospace;">${vendor.orderId}</p>
                </td>
                <td style="text-align:right;">
                    <p style="margin:0;font-size:12px;color:#2563eb;font-weight:600;">YOUR REVENUE</p>
                    <p style="margin:4px 0 0;font-size:20px;color:#0f172a;font-weight:700;">R ${vendor.totalForVendor.toFixed(2)}</p>
                </td>
            </tr>
        </table>

        <h3 style="margin:0 0 12px;color:#0f172a;font-size:16px;">Items to Fulfil</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;margin-bottom:24px;">
            <tr style="border-bottom:2px solid #e2e8f0;">
                <th style="padding:8px 0;text-align:left;font-weight:600;">Product</th>
                <th style="padding:8px 0;text-align:center;font-weight:600;">Qty</th>
                <th style="padding:8px 0;text-align:right;font-weight:600;">Revenue</th>
            </tr>
            ${itemRows}
        </table>

        <div style="text-align:center;">
            <a href="${siteUrl}/vendors/dashboard"
               style="display:inline-block;background-color:#0f172a;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
                Go to Dashboard
            </a>
        </div>
    `);
}

// ─── EMAIL VERIFICATION TEMPLATE ────────────────────────────

function verificationEmailHtml(verifyUrl: string, userName: string) {
    return emailLayout(`
        <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#dbeafe;line-height:56px;font-size:28px;">
                &#9993;
            </div>
        </div>

        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;text-align:center;">Verify Your Email Address</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;text-align:center;">
            Hi ${userName}, thanks for signing up! Please verify your email address to get the most out of your WarmNest account.
        </p>

        <div style="text-align:center;margin-bottom:24px;">
            <a href="${verifyUrl}"
               style="display:inline-block;background-color:#0f172a;color:#ffffff;padding:14px 40px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
                Verify My Email
            </a>
        </div>

        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-align:center;">
            Or copy and paste this link into your browser:
        </p>
        <p style="margin:0 0 24px;color:#64748b;font-size:12px;text-align:center;word-break:break-all;">
            <a href="${verifyUrl}" style="color:#2563eb;">${verifyUrl}</a>
        </p>

        <div style="background-color:#f8fafc;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
                This link expires in 24 hours. If you didn't create a WarmNest account, you can safely ignore this email.
            </p>
        </div>
    `);
}

// ─── INTERNAL ACTIONS (called from other modules) ───────────

export const sendVerificationEmail = internalAction({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const userInfo = await ctx.runQuery(internal.emailVerification.getUserEmail, { userId: args.userId });
        if (!userInfo || !userInfo.email) {
            console.warn("Cannot send verification email — no email for user", args.userId);
            return;
        }

        if (userInfo.emailVerified) {
            return; // Already verified
        }

        // Generate crypto-secure token
        const token = randomUUID();

        // Store token
        await ctx.runMutation(internal.emailVerification.storeToken, {
            userId: args.userId,
            token,
        });

        // Build verification URL
        const siteUrl = process.env.SITE_URL ?? "https://warmnest.co.za";
        const verifyUrl = `${siteUrl}/verify-email?token=${token}`;

        await sendEmail({
            to: userInfo.email,
            toName: userInfo.name,
            subject: "Verify your email — WarmNest",
            htmlBody: verificationEmailHtml(verifyUrl, userInfo.name),
        });
    },
});

export const sendOrderConfirmation = internalAction({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const order = await ctx.runQuery(internal.emailQueries.getOrderWithItems, { orderId: args.orderId });
        if (!order || !order.customerEmail) {
            console.warn("Cannot send order confirmation — no order or email found for", args.orderId);
            return;
        }

        await sendEmail({
            to: order.customerEmail,
            toName: order.customerName,
            subject: `Order Confirmed — ${args.orderId}`,
            htmlBody: orderConfirmationHtml({
                orderId: args.orderId,
                totalAmount: order.totalAmount,
                items: order.items,
                shippingAddress: order.shippingAddress,
            }),
        });
    },
});

export const sendShippingUpdate = internalAction({
    args: {
        orderId: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const order = await ctx.runQuery(internal.emailQueries.getOrderBasic, { orderId: args.orderId });
        if (!order || !order.customerEmail) {
            console.warn("Cannot send shipping update — no order or email for", args.orderId);
            return;
        }

        await sendEmail({
            to: order.customerEmail,
            toName: order.customerName,
            subject: `Order ${args.status === "shipped" ? "Shipped" : args.status === "delivered" ? "Delivered" : args.status === "completed" ? "Complete" : "Update"} — ${args.orderId}`,
            htmlBody: shippingUpdateHtml({
                orderId: args.orderId,
                status: args.status,
                shippingAddress: order.shippingAddress,
            }),
        });
    },
});

export const sendVendorNewOrderAlert = internalAction({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const vendorOrders = await ctx.runQuery(internal.emailQueries.getVendorOrderDetails, { orderId: args.orderId });
        if (!vendorOrders || vendorOrders.length === 0) return;

        for (const vo of vendorOrders) {
            if (!vo.vendorEmail) continue;

            await sendEmail({
                to: vo.vendorEmail,
                toName: vo.storeName,
                subject: `New Order — ${args.orderId}`,
                htmlBody: vendorNewOrderHtml({
                    storeName: vo.storeName,
                    orderId: args.orderId,
                    items: vo.items,
                    totalForVendor: vo.totalForVendor,
                }),
            });
        }
    },
});
