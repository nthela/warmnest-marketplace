import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

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
            commissionRate: 0.12, // Default 12%
        });

        // Optionally update user role to vendor-pending or similar if we strictly separate roles
        // For now, role update might happen on approval.

        return vendorId;
    },
});

export const updateCollectionAddress = mutation({
    args: {
        vendorId: v.optional(v.id("vendors")), // admin can specify; vendors update their own
        street: v.string(),
        city: v.string(),
        code: v.string(),
        shiprazorWarehouseId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        let targetVendorId: typeof args.vendorId;

        if (user?.role === "admin" && args.vendorId) {
            targetVendorId = args.vendorId;
        } else {
            const vendor = await ctx.db
                .query("vendors")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .first();
            if (!vendor) throw new Error("Vendor not found");
            targetVendorId = vendor._id;
        }

        const patch: Record<string, unknown> = {
            collectionAddress: {
                street: args.street,
                city: args.city,
                code: args.code,
                country: "ZA",
            },
        };

        if (args.shiprazorWarehouseId !== undefined) {
            patch.shiprazorWarehouseId = args.shiprazorWarehouseId || undefined;
        }

        await ctx.db.patch(targetVendorId!, patch);
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
        vendorId: v.optional(v.id("vendors")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Input validation
        const name = args.name.trim();
        if (!name || name.length > 200) {
            throw new Error("Product name is required and must be under 200 characters.");
        }
        if (args.price < 0) throw new Error("Price cannot be negative.");
        if (args.salePrice !== undefined && args.salePrice < 0) throw new Error("Sale price cannot be negative.");
        if (args.salePrice !== undefined && args.salePrice >= args.price) throw new Error("Sale price must be less than the regular price.");
        if (args.stock < 0 || !Number.isInteger(args.stock)) throw new Error("Stock must be a non-negative integer.");

        const user = await ctx.db.get(userId);
        let targetVendorId: typeof args.vendorId;

        if (user?.role === "admin" && args.vendorId) {
            // Admin can create products for a specific vendor
            const targetVendor = await ctx.db.get(args.vendorId);
            if (!targetVendor || targetVendor.status !== "approved") {
                throw new Error("Target vendor not found or not approved.");
            }
            targetVendorId = args.vendorId;
        } else {
            // Regular vendor flow
            const vendor = await ctx.db
                .query("vendors")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .first();

            if (!vendor || vendor.status !== "approved") {
                throw new Error("Vendor not approved");
            }
            targetVendorId = vendor._id;
        }

        const productId = await ctx.db.insert("products", {
            vendorId: targetVendorId!,
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

        return products.map((p) => ({
            ...p,
            commissionRate: vendor.commissionRate,
        }));
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

        // Input validation
        const name = args.name.trim();
        if (!name || name.length > 200) {
            throw new Error("Product name is required and must be under 200 characters.");
        }
        if (args.price < 0) throw new Error("Price cannot be negative.");
        if (args.salePrice !== undefined && args.salePrice < 0) throw new Error("Sale price cannot be negative.");
        if (args.salePrice !== undefined && args.salePrice >= args.price) throw new Error("Sale price must be less than the regular price.");
        if (args.stock < 0 || !Number.isInteger(args.stock)) throw new Error("Stock must be a non-negative integer.");

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

// Used by ShipRazor to get warehouse IDs for vendors in an order
export const getWarehouseIdsForProducts = query({
    args: { productIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const seenVendorIds = new Set<string>();
        const warehouses: { vendorId: string; shiprazorWarehouseId: string }[] = [];

        for (const id of args.productIds) {
            try {
                const product = await ctx.db.get(id as Id<"products">);
                if (!product || seenVendorIds.has(product.vendorId)) continue;
                seenVendorIds.add(product.vendorId);

                const vendor = await ctx.db.get(product.vendorId as Id<"vendors">);
                if (vendor?.shiprazorWarehouseId) {
                    warehouses.push({
                        vendorId: product.vendorId,
                        shiprazorWarehouseId: vendor.shiprazorWarehouseId,
                    });
                }
            } catch {
                // Skip invalid IDs
            }
        }

        return warehouses;
    },
});

// Used by the shipping action to determine collection addresses for each vendor in the cart
export const getCollectionAddressesForProducts = query({
    args: { productIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const seenVendorIds = new Set<string>();
        const addresses: { vendorId: string; street: string; city: string; code: string }[] = [];

        for (const id of args.productIds) {
            try {
                const product = await ctx.db.get(id as Id<"products">);
                if (!product || seenVendorIds.has(product.vendorId)) continue;
                seenVendorIds.add(product.vendorId);

                const vendor = await ctx.db.get(product.vendorId as Id<"vendors">);
                if (vendor?.collectionAddress) {
                    addresses.push({
                        vendorId: product.vendorId,
                        street: vendor.collectionAddress.street,
                        city: vendor.collectionAddress.city,
                        code: vendor.collectionAddress.code,
                    });
                }
            } catch {
                // Skip invalid IDs
            }
        }

        return addresses;
    },
});
