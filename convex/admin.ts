import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


// Helper: verify the current user is an admin
async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin access required");
    return userId;
}

// ─── QUERIES ────────────────────────────────────────────────

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const users = await ctx.db.query("users").collect();
        const vendors = await ctx.db.query("vendors").collect();
        const products = await ctx.db.query("products").collect();
        const orders = await ctx.db.query("orders").collect();
        const waitlist = await ctx.db.query("vendorWaitlist").collect();

        const totalRevenue = orders
            .filter((o) => o.status !== "cancelled")
            .reduce((sum, o) => sum + o.totalAmount, 0);

        return {
            totalUsers: users.length,
            activeVendors: vendors.filter((v) => v.status === "approved").length,
            pendingVendors: vendors.filter((v) => v.status === "pending").length,
            totalProducts: products.filter((p) => p.isActive).length,
            totalOrders: orders.length,
            totalRevenue,
            waitlistCount: waitlist.length,
        };
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("users").order("desc").collect();
    },
});

export const getAllVendors = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const vendors = await ctx.db.query("vendors").order("desc").collect();

        // Attach user info
        const withUsers = await Promise.all(
            vendors.map(async (vendor) => {
                const user = await ctx.db.get(vendor.userId);
                return {
                    ...vendor,
                    ownerName: user?.name ?? "Unknown",
                    ownerEmail: user?.email ?? "—",
                };
            })
        );
        return withUsers;
    },
});

export const getAllProducts = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const products = await ctx.db.query("products").order("desc").collect();

        const withVendors = await Promise.all(
            products.map(async (product) => {
                const vendor = await ctx.db.get(product.vendorId);
                return {
                    ...product,
                    vendorName: vendor?.storeName ?? "Unknown",
                    commissionRate: vendor?.commissionRate ?? 0.12,
                };
            })
        );
        return withVendors;
    },
});

export const getAllOrders = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const orders = await ctx.db.query("orders").order("desc").collect();

        const withUsers = await Promise.all(
            orders.map(async (order) => {
                let customerName = "Guest";
                let customerEmail = order.guestEmail ?? "—";
                if (order.userId) {
                    const user = await ctx.db.get(order.userId);
                    if (user) {
                        customerName = user.name ?? "User";
                        customerEmail = user.email ?? "—";
                    }
                }
                return { ...order, customerName, customerEmail };
            })
        );
        return withUsers;
    },
});

export const getWaitlist = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("vendorWaitlist").order("desc").collect();
    },
});

export const getAnalytics = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const orders = await ctx.db.query("orders").collect();
        const orderItems = await ctx.db.query("orderItems").collect();
        const vendors = await ctx.db.query("vendors").collect();
        const products = await ctx.db.query("products").collect();

        // Revenue (non-cancelled)
        const validOrders = orders.filter((o) => o.status !== "cancelled");
        const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

        // Orders by status
        const ordersByStatus: Record<string, number> = {};
        for (const order of orders) {
            ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
        }

        // Revenue per vendor
        const revenuePerVendor: Record<string, { name: string; revenue: number; orders: number }> = {};
        for (const item of orderItems) {
            const vendorId = item.vendorId.toString();
            if (!revenuePerVendor[vendorId]) {
                const vendor = vendors.find((v) => v._id === item.vendorId);
                revenuePerVendor[vendorId] = {
                    name: vendor?.storeName ?? "Unknown",
                    revenue: 0,
                    orders: 0,
                };
            }
            revenuePerVendor[vendorId].revenue += item.price * item.quantity;
            revenuePerVendor[vendorId].orders += 1;
        }

        // Top products by order count
        const productOrderCount: Record<string, { name: string; count: number; revenue: number }> = {};
        for (const item of orderItems) {
            const pid = item.productId.toString();
            if (!productOrderCount[pid]) {
                const product = products.find((p) => p._id === item.productId);
                productOrderCount[pid] = { name: product?.name ?? "Deleted Product", count: 0, revenue: 0 };
            }
            productOrderCount[pid].count += item.quantity;
            productOrderCount[pid].revenue += item.price * item.quantity;
        }
        const topProducts = Object.values(productOrderCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalRevenue,
            totalOrders: orders.length,
            avgOrderValue,
            ordersByStatus,
            vendorPerformance: Object.values(revenuePerVendor).sort((a, b) => b.revenue - a.revenue),
            topProducts,
        };
    },
});

// ─── MUTATIONS ──────────────────────────────────────────────

export const deleteUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        // Delete associated vendor and products
        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (vendor) {
            const products = await ctx.db
                .query("products")
                .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
                .collect();
            for (const product of products) {
                await ctx.db.delete(product._id);
            }
            await ctx.db.delete(vendor._id);
        }

        await ctx.db.delete(args.userId);
    },
});

export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("admin"), v.literal("vendor"), v.literal("customer")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.userId, { role: args.role });
    },
});

export const approveVendor = mutation({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const vendor = await ctx.db.get(args.vendorId);
        if (!vendor) throw new Error("Vendor not found");
        await ctx.db.patch(args.vendorId, { status: "approved" });
        await ctx.db.patch(vendor.userId, { role: "vendor", vendorId: args.vendorId });
    },
});

export const rejectVendor = mutation({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.vendorId, { status: "rejected" });
    },
});

export const deleteVendor = mutation({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const products = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();
        for (const product of products) {
            await ctx.db.delete(product._id);
        }
        await ctx.db.delete(args.vendorId);
    },
});

export const deleteProduct = mutation({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.productId);
    },
});

export const toggleProductActive = mutation({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const product = await ctx.db.get(args.productId);
        if (!product) throw new Error("Product not found");
        await ctx.db.patch(args.productId, { isActive: !product.isActive });
    },
});

export const updateOrderStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.orderId, { status: args.status });
    },
});

export const removeFromWaitlist = mutation({
    args: { waitlistId: v.id("vendorWaitlist") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.waitlistId);
    },
});

export const grantWish = mutation({
    args: { waitlistId: v.id("vendorWaitlist") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const entry = await ctx.db.get(args.waitlistId);
        if (!entry) throw new Error("Waitlist entry not found");

        // Find the user account by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", entry.email))
            .first();

        if (!user) {
            throw new Error(
                `No registered account found for "${entry.email}". They need to sign up first.`
            );
        }

        // Check if this user already has a vendor profile
        const existingVendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (existingVendor) {
            throw new Error("This user already has a vendor profile.");
        }

        // Generate a URL-safe slug from the name
        const baseSlug = entry.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Ensure slug is unique
        let slug = baseSlug;
        let attempt = 0;
        while (true) {
            const taken = await ctx.db
                .query("vendors")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first();
            if (!taken) break;
            attempt++;
            slug = `${baseSlug}-${attempt}`;
        }

        // Create the vendor (approved immediately since admin is granting)
        const vendorId = await ctx.db.insert("vendors", {
            userId: user._id,
            storeName: entry.name,
            slug,
            description: `Vendor from ${entry.location}`,
            status: "approved",
            commissionRate: 0.12,
        });

        // Update user role to vendor
        await ctx.db.patch(user._id, { role: "vendor", vendorId });

        // Remove from waitlist
        await ctx.db.delete(args.waitlistId);

        return { vendorId, storeName: entry.name };
    },
});
