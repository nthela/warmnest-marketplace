import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const register = mutation({
    args: {
        storeName: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const existingVendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existingVendor) {
            throw new Error("You already have a vendor profile associated with this account.");
        }

        const existingSlug = await ctx.db
            .query("vendors")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existingSlug) {
            throw new Error("Store URL / Slug is already taken.");
        }

        const vendorId = await ctx.db.insert("vendors", {
            userId,
            storeName: args.storeName,
            slug: args.slug,
            description: args.description,
            status: "pending",
            commissionRate: 0.1, // Default 10%
        });

        // Optionally update user role to vendor-pending or similar if we strictly separate roles
        // For now, role update might happen on approval.

        return vendorId;
    },
});

export const getCurrentVendor = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        return vendor;
    },
});

export const createProduct = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        price: v.number(),
        stock: v.number(),
        category: v.string(),
        images: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!vendor || vendor.status !== "approved") {
            throw new Error("Vendor not approved");
        }

        const productId = await ctx.db.insert("products", {
            vendorId: vendor._id,
            name: args.name,
            description: args.description,
            price: args.price,
            stock: args.stock,
            category: args.category,
            images: args.images,
            tags: [],
            isActive: true,
        });

        return productId;
    },
});

export const getProducts = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!vendor) return [];

        const products = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
            .collect();

        return products;
    },
});

export const listPendingVendors = query({
    args: {},
    handler: async (ctx) => {
        // Ideally check if user is admin
        return await ctx.db
            .query("vendors")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();
    },
});

export const approveVendor = mutation({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        // Ideally check if user is admin
        await ctx.db.patch(args.vendorId, { status: "approved" });
    },
});
