import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a short-lived upload URL for Convex file storage
export const generateUploadUrl = mutation(async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
});

// Get a public URL for a stored file
export const getImageUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

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
        salePrice: v.optional(v.number()),
        sku: v.optional(v.string()),
        stock: v.number(),
        category: v.string(),
        tags: v.optional(v.array(v.string())),
        images: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        // Allow admin to create products (uses first vendor or throws)
        const user = await ctx.db.get(userId);
        if (!vendor || vendor.status !== "approved") {
            if (user?.role === "admin") {
                // Admin can create products — use first approved vendor as fallback
                const anyVendor = await ctx.db
                    .query("vendors")
                    .filter((q) => q.eq(q.field("status"), "approved"))
                    .first();
                if (anyVendor) {
                    const productId = await ctx.db.insert("products", {
                        vendorId: anyVendor._id,
                        name: args.name,
                        description: args.description,
                        price: args.price,
                        salePrice: args.salePrice,
                        sku: args.sku,
                        stock: args.stock,
                        category: args.category,
                        images: args.images,
                        tags: args.tags ?? [],
                        isActive: true,
                    });
                    return productId;
                }
            }
            throw new Error("Vendor not approved");
        }

        const productId = await ctx.db.insert("products", {
            vendorId: vendor._id,
            name: args.name,
            description: args.description,
            price: args.price,
            salePrice: args.salePrice,
            sku: args.sku,
            stock: args.stock,
            category: args.category,
            images: args.images,
            tags: args.tags ?? [],
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

export const getProduct = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.productId);
    },
});

export const updateProduct = mutation({
    args: {
        productId: v.id("products"),
        name: v.string(),
        description: v.string(),
        price: v.number(),
        salePrice: v.optional(v.number()),
        sku: v.optional(v.string()),
        stock: v.number(),
        category: v.string(),
        tags: v.optional(v.array(v.string())),
        images: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const product = await ctx.db.get(args.productId);
        if (!product) throw new Error("Product not found");

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!vendor || vendor._id !== product.vendorId) {
            throw new Error("Not your product");
        }

        const { productId, ...updates } = args;
        await ctx.db.patch(productId, { ...updates, tags: updates.tags ?? [] });
    },
});

export const deleteProduct = mutation({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const product = await ctx.db.get(args.productId);
        if (!product) throw new Error("Product not found");

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!vendor || vendor._id !== product.vendorId) {
            throw new Error("Not your product");
        }

        await ctx.db.delete(args.productId);
    },
});

export const listPendingVendors = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");
        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Admin access required");

        return await ctx.db
            .query("vendors")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();
    },
});

export const approveVendor = mutation({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");
        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Admin access required");

        const vendor = await ctx.db.get(args.vendorId);
        if (!vendor) throw new Error("Vendor not found");
        await ctx.db.patch(args.vendorId, { status: "approved" });
        await ctx.db.patch(vendor.userId, { role: "vendor", vendorId: args.vendorId });
    },
});
