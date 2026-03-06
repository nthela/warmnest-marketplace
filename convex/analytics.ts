import { query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── HELPERS ───────────────────────────────────────────────

async function requireAdmin(ctx: QueryCtx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin access required");
    return userId;
}

function monthRange(offset: number) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    return { start: start.getTime(), end: end.getTime() };
}

function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// ─── ADMIN: EXECUTIVE METRICS ──────────────────────────────

export const getExecutiveMetrics = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const orders = await ctx.db.query("orders").collect();
        const users = await ctx.db.query("users").collect();
        const vendors = await ctx.db.query("vendors").collect();

        const thisMonth = monthRange(0);
        const lastMonth = monthRange(-1);

        // GMV — total value of non-cancelled orders
        const validOrders = orders.filter((o) => o.status !== "cancelled");
        const gmv = validOrders.reduce((s, o) => s + o.totalAmount, 0);

        const gmvThisMonth = validOrders
            .filter((o) => o.createdAt >= thisMonth.start && o.createdAt < thisMonth.end)
            .reduce((s, o) => s + o.totalAmount, 0);
        const gmvLastMonth = validOrders
            .filter((o) => o.createdAt >= lastMonth.start && o.createdAt < lastMonth.end)
            .reduce((s, o) => s + o.totalAmount, 0);

        // Revenue — marketplace commission (avg commission * GMV)
        const approvedVendors = vendors.filter((v) => v.status === "approved");
        const avgCommission = approvedVendors.length > 0
            ? approvedVendors.reduce((s, v) => s + v.commissionRate, 0) / approvedVendors.length
            : 0.12;
        const revenue = gmv * avgCommission;
        const revenueThisMonth = gmvThisMonth * avgCommission;
        const revenueLastMonth = gmvLastMonth * avgCommission;

        // Orders
        const ordersThisMonth = validOrders.filter((o) => o.createdAt >= thisMonth.start && o.createdAt < thisMonth.end).length;
        const ordersLastMonth = validOrders.filter((o) => o.createdAt >= lastMonth.start && o.createdAt < lastMonth.end).length;

        // Active users — users who placed an order in the last 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recentOrderUserIds = new Set(
            orders
                .filter((o) => o.createdAt >= thirtyDaysAgo && o.userId)
                .map((o) => o.userId!.toString())
        );
        const activeUsers = recentOrderUserIds.size;
        const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
        const prevOrderUserIds = new Set(
            orders
                .filter((o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo && o.userId)
                .map((o) => o.userId!.toString())
        );

        return {
            gmv,
            gmvChange: pctChange(gmvThisMonth, gmvLastMonth),
            revenue,
            revenueChange: pctChange(revenueThisMonth, revenueLastMonth),
            totalOrders: validOrders.length,
            ordersChange: pctChange(ordersThisMonth, ordersLastMonth),
            activeUsers,
            activeUsersChange: pctChange(activeUsers, prevOrderUserIds.size),
            totalUsers: users.length,
            totalVendors: approvedVendors.length,
        };
    },
});

// ─── ADMIN: GROWTH METRICS ─────────────────────────────────

export const getGrowthMetrics = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const users = await ctx.db.query("users").collect();
        const vendors = await ctx.db.query("vendors").collect();
        const products = await ctx.db.query("products").collect();

        const thisMonth = monthRange(0);
        const lastMonth = monthRange(-1);

        // Customer growth
        const customers = users.filter((u) => u.role === "customer");
        const customersThisMonth = customers.filter((u) => u._creationTime >= thisMonth.start && u._creationTime < thisMonth.end).length;
        const customersLastMonth = customers.filter((u) => u._creationTime >= lastMonth.start && u._creationTime < lastMonth.end).length;

        // Vendor growth
        const approved = vendors.filter((v) => v.status === "approved");
        const vendorsThisMonth = approved.filter((v) => v._creationTime >= thisMonth.start && v._creationTime < thisMonth.end).length;
        const vendorsLastMonth = approved.filter((v) => v._creationTime >= lastMonth.start && v._creationTime < lastMonth.end).length;

        // Category growth — products added per category this month
        const activeProducts = products.filter((p) => p.isActive);
        const categoryMap: Record<string, { total: number; thisMonth: number; lastMonth: number }> = {};
        for (const p of activeProducts) {
            if (!categoryMap[p.category]) categoryMap[p.category] = { total: 0, thisMonth: 0, lastMonth: 0 };
            categoryMap[p.category].total++;
            if (p._creationTime >= thisMonth.start && p._creationTime < thisMonth.end) categoryMap[p.category].thisMonth++;
            if (p._creationTime >= lastMonth.start && p._creationTime < lastMonth.end) categoryMap[p.category].lastMonth++;
        }

        const categoryGrowth = Object.entries(categoryMap)
            .map(([name, data]) => ({
                name,
                total: data.total,
                newThisMonth: data.thisMonth,
                change: pctChange(data.thisMonth, data.lastMonth),
            }))
            .sort((a, b) => b.total - a.total);

        // Monthly signups over last 6 months
        const monthlySignups: { month: string; customers: number; vendors: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const range = monthRange(-i);
            const label = new Date(range.start).toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
            monthlySignups.push({
                month: label,
                customers: customers.filter((u) => u._creationTime >= range.start && u._creationTime < range.end).length,
                vendors: approved.filter((v) => v._creationTime >= range.start && v._creationTime < range.end).length,
            });
        }

        return {
            totalCustomers: customers.length,
            customersThisMonth,
            customerGrowth: pctChange(customersThisMonth, customersLastMonth),
            totalVendors: approved.length,
            vendorsThisMonth,
            vendorGrowth: pctChange(vendorsThisMonth, vendorsLastMonth),
            totalCategories: Object.keys(categoryMap).length,
            categoryGrowth,
            monthlySignups,
        };
    },
});

// ─── ADMIN: MARKETPLACE HEALTH ─────────────────────────────

export const getMarketplaceHealth = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const orders = await ctx.db.query("orders").collect();
        const users = await ctx.db.query("users").collect();
        const reviews = await ctx.db.query("reviews").collect();

        const validOrders = orders.filter((o) => o.status !== "cancelled");
        const avgOrderValue = validOrders.length > 0
            ? validOrders.reduce((s, o) => s + o.totalAmount, 0) / validOrders.length
            : 0;

        // Cancellation rate
        const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
        const cancellationRate = orders.length > 0 ? Math.round((cancelledOrders / orders.length) * 100) : 0;

        // Customer retention — users who ordered more than once
        const ordersByUser: Record<string, number> = {};
        for (const o of orders) {
            if (o.userId) {
                const key = o.userId.toString();
                ordersByUser[key] = (ordersByUser[key] ?? 0) + 1;
            }
        }
        const buyerCount = Object.keys(ordersByUser).length;
        const repeatBuyers = Object.values(ordersByUser).filter((c) => c > 1).length;
        const retentionRate = buyerCount > 0 ? Math.round((repeatBuyers / buyerCount) * 100) : 0;

        // Review health
        const avgRating = reviews.length > 0
            ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
            : 0;

        // Orders by status
        const ordersByStatus: Record<string, number> = {};
        for (const o of orders) {
            ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
        }

        // Monthly order volume (last 6 months)
        const monthlyOrders: { month: string; orders: number; gmv: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const range = monthRange(-i);
            const label = new Date(range.start).toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
            const monthOrders = validOrders.filter((o) => o.createdAt >= range.start && o.createdAt < range.end);
            monthlyOrders.push({
                month: label,
                orders: monthOrders.length,
                gmv: monthOrders.reduce((s, o) => s + o.totalAmount, 0),
            });
        }

        return {
            avgOrderValue,
            cancellationRate,
            retentionRate,
            repeatBuyers,
            totalBuyers: buyerCount,
            totalReviews: reviews.length,
            avgRating,
            ordersByStatus,
            monthlyOrders,
            totalUsers: users.length,
        };
    },
});

// ─── ADMIN: OPERATIONS METRICS ─────────────────────────────

export const getOperationsMetrics = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const orders = await ctx.db.query("orders").collect();
        const orderItems = await ctx.db.query("orderItems").collect();
        const vendors = await ctx.db.query("vendors").collect();
        const products = await ctx.db.query("products").collect();

        // Fulfillment pipeline
        const pipeline = {
            pending: 0,
            paid: 0,
            processing: 0,
            shipped: 0,
            completed: 0,
            cancelled: 0,
        };
        for (const o of orders) {
            pipeline[o.status as keyof typeof pipeline]++;
        }

        // Fulfillment rate — orders that reached shipped or completed vs total non-cancelled
        const totalNonCancelled = orders.filter((o) => o.status !== "cancelled").length;
        const fulfilledOrders = orders.filter((o) => o.status === "shipped" || o.status === "completed").length;
        const fulfillmentRate = totalNonCancelled > 0 ? Math.round((fulfilledOrders / totalNonCancelled) * 100) : 0;

        // Cancel rate
        const cancelRate = orders.length > 0
            ? Math.round((pipeline.cancelled / orders.length) * 100) : 0;

        // Top products by sales volume
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        for (const item of orderItems) {
            const pid = item.productId.toString();
            if (!productSales[pid]) {
                const product = products.find((p) => p._id === item.productId);
                productSales[pid] = { name: product?.name ?? "Deleted Product", quantity: 0, revenue: 0 };
            }
            productSales[pid].quantity += item.quantity;
            productSales[pid].revenue += item.price * item.quantity;
        }
        const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

        // Vendor performance
        const vendorPerf: Record<string, { name: string; revenue: number; itemsSold: number; orderCount: number }> = {};
        for (const item of orderItems) {
            const vid = item.vendorId.toString();
            if (!vendorPerf[vid]) {
                const vendor = vendors.find((v) => v._id === item.vendorId);
                vendorPerf[vid] = { name: vendor?.storeName ?? "Unknown", revenue: 0, itemsSold: 0, orderCount: 0 };
            }
            vendorPerf[vid].revenue += item.price * item.quantity;
            vendorPerf[vid].itemsSold += item.quantity;
            vendorPerf[vid].orderCount++;
        }
        const vendorPerformance = Object.values(vendorPerf).sort((a, b) => b.revenue - a.revenue);

        // Low stock products (< 5 units)
        const lowStock = products
            .filter((p) => p.isActive && p.stock < 5)
            .map((p) => ({ name: p.name, stock: p.stock, id: p._id }))
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 10);

        return {
            pipeline,
            fulfillmentRate,
            cancelRate,
            topProducts,
            vendorPerformance,
            lowStock,
            totalOrders: orders.length,
        };
    },
});

// ─── VENDOR: DASHBOARD STATS ───────────────────────────────

export const getVendorStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!vendor || vendor.status !== "approved") return null;

        const products = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
            .collect();

        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
            .collect();

        // Gather full order data for these items
        const orderIdSet = new Set(orderItems.map((i) => i.orderId));
        const orderMap: Record<string, { status: string; createdAt: number }> = {};
        for (const oid of orderIdSet) {
            const order = await ctx.db.get(oid);
            if (order) orderMap[oid.toString()] = { status: order.status, createdAt: order.createdAt };
        }

        const thisMonth = monthRange(0);
        const lastMonth = monthRange(-1);

        // Revenue (vendor's share = item price * quantity * (1 - commissionRate))
        const commissionRate = vendor.commissionRate;
        let totalRevenue = 0;
        let revenueThisMonth = 0;
        let revenueLastMonth = 0;
        let totalItemsSold = 0;
        let itemsThisMonth = 0;
        let itemsLastMonth = 0;

        for (const item of orderItems) {
            const order = orderMap[item.orderId.toString()];
            if (!order || order.status === "cancelled") continue;

            const itemRevenue = item.price * item.quantity * (1 - commissionRate);
            totalRevenue += itemRevenue;
            totalItemsSold += item.quantity;

            if (order.createdAt >= thisMonth.start && order.createdAt < thisMonth.end) {
                revenueThisMonth += itemRevenue;
                itemsThisMonth += item.quantity;
            }
            if (order.createdAt >= lastMonth.start && order.createdAt < lastMonth.end) {
                revenueLastMonth += itemRevenue;
                itemsLastMonth += item.quantity;
            }
        }

        // Orders count (distinct orders containing this vendor's items)
        const validOrderIds = orderItems
            .filter((i) => {
                const o = orderMap[i.orderId.toString()];
                return o && o.status !== "cancelled";
            })
            .map((i) => i.orderId.toString());
        const uniqueOrders = new Set(validOrderIds);
        const totalOrders = uniqueOrders.size;

        const thisMonthOrderIds = new Set(
            orderItems
                .filter((i) => {
                    const o = orderMap[i.orderId.toString()];
                    return o && o.status !== "cancelled" && o.createdAt >= thisMonth.start && o.createdAt < thisMonth.end;
                })
                .map((i) => i.orderId.toString())
        );
        const lastMonthOrderIds = new Set(
            orderItems
                .filter((i) => {
                    const o = orderMap[i.orderId.toString()];
                    return o && o.status !== "cancelled" && o.createdAt >= lastMonth.start && o.createdAt < lastMonth.end;
                })
                .map((i) => i.orderId.toString())
        );

        // Active products
        const activeProducts = products.filter((p) => p.isActive).length;

        // Top products for this vendor
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        for (const item of orderItems) {
            const o = orderMap[item.orderId.toString()];
            if (!o || o.status === "cancelled") continue;
            const pid = item.productId.toString();
            if (!productSales[pid]) {
                const product = products.find((p) => p._id === item.productId);
                productSales[pid] = { name: product?.name ?? "Deleted Product", quantity: 0, revenue: 0 };
            }
            productSales[pid].quantity += item.quantity;
            productSales[pid].revenue += item.price * item.quantity * (1 - commissionRate);
        }
        const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

        // Monthly revenue over last 6 months
        const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const range = monthRange(-i);
            const label = new Date(range.start).toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
            let monthRev = 0;
            const monthOrderIdSet = new Set<string>();
            for (const item of orderItems) {
                const o = orderMap[item.orderId.toString()];
                if (!o || o.status === "cancelled") continue;
                if (o.createdAt >= range.start && o.createdAt < range.end) {
                    monthRev += item.price * item.quantity * (1 - commissionRate);
                    monthOrderIdSet.add(item.orderId.toString());
                }
            }
            monthlyRevenue.push({ month: label, revenue: monthRev, orders: monthOrderIdSet.size });
        }

        // Low stock
        const lowStock = products
            .filter((p) => p.isActive && p.stock < 5)
            .map((p) => ({ name: p.name, stock: p.stock }))
            .sort((a, b) => a.stock - b.stock);

        // Reviews for this vendor's products
        const reviews = await ctx.db.query("reviews").collect();
        const vendorProductIds = new Set(products.map((p) => p._id.toString()));
        const vendorReviews = reviews.filter((r) => vendorProductIds.has(r.productId.toString()));
        const avgRating = vendorReviews.length > 0
            ? Math.round((vendorReviews.reduce((s, r) => s + r.rating, 0) / vendorReviews.length) * 10) / 10
            : 0;

        return {
            totalRevenue,
            revenueChange: pctChange(revenueThisMonth, revenueLastMonth),
            totalOrders,
            ordersChange: pctChange(thisMonthOrderIds.size, lastMonthOrderIds.size),
            activeProducts,
            totalProducts: products.length,
            totalItemsSold,
            itemsChange: pctChange(itemsThisMonth, itemsLastMonth),
            topProducts,
            monthlyRevenue,
            lowStock,
            avgRating,
            totalReviews: vendorReviews.length,
            commissionRate,
        };
    },
});
