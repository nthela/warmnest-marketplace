import { v } from "convex/values";
import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin access required");
    return userId;
}

// Public query — anyone can read the hero banner
export const getHeroBanner = query({
    args: {},
    handler: async (ctx) => {
        const setting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "heroBanner"))
            .first();
        if (!setting) return null;
        const url = await ctx.storage.getUrl(setting.value as Id<"_storage">);
        return url;
    },
});

// Admin: generate an upload URL
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.storage.generateUploadUrl();
    },
});

// Admin: save the uploaded banner
export const setHeroBanner = mutation({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const existing = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "heroBanner"))
            .first();

        if (existing) {
            // Delete old image from storage
            try {
                await ctx.storage.delete(existing.value as Id<"_storage">);
            } catch {
                // Old file may already be gone
            }
            await ctx.db.patch(existing._id, { value: args.storageId });
        } else {
            await ctx.db.insert("siteSettings", {
                key: "heroBanner",
                value: args.storageId,
            });
        }
    },
});

// Public query — read any text setting by key
export const getText = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const setting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();
        return setting?.value ?? null;
    },
});

// Public query — read all homepage text settings at once
export const getHomepageText = query({
    args: {},
    handler: async (ctx) => {
        const keys = [
            "heroTitle",
            "heroHighlight",
            "heroSubtitle",
            "ctaTitle",
            "ctaSubtitle",
        ];
        const results: Record<string, string> = {};
        for (const key of keys) {
            const setting = await ctx.db
                .query("siteSettings")
                .withIndex("by_key", (q) => q.eq("key", key))
                .first();
            if (setting) results[key] = setting.value;
        }
        return results;
    },
});

// Admin: update a text setting
export const setText = mutation({
    args: { key: v.string(), value: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const existing = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value });
        } else {
            await ctx.db.insert("siteSettings", {
                key: args.key,
                value: args.value,
            });
        }
    },
});

// ─── CATEGORIES ─────────────────────────────────────────────

const DEFAULT_CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"];

async function getCategoriesList(ctx: QueryCtx): Promise<string[]> {
    const setting = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", "categories"))
        .first();
    if (!setting || !setting.value) return DEFAULT_CATEGORIES;
    return JSON.parse(setting.value) as string[];
}

// Public query — get all categories
export const getCategories = query({
    args: {},
    handler: async (ctx) => {
        return await getCategoriesList(ctx);
    },
});

// Admin: add a category
export const addCategory = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const name = args.name.trim();
        if (!name) throw new Error("Category name cannot be empty");

        const setting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "categories"))
            .first();

        const categories: string[] = setting && setting.value
            ? JSON.parse(setting.value)
            : [...DEFAULT_CATEGORIES];

        if (categories.includes(name)) throw new Error("Category already exists");
        categories.push(name);

        if (setting) {
            await ctx.db.patch(setting._id, { value: JSON.stringify(categories) });
        } else {
            await ctx.db.insert("siteSettings", { key: "categories", value: JSON.stringify(categories) });
        }
    },
});

// Admin: rename a category
export const renameCategory = mutation({
    args: { oldName: v.string(), newName: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const newName = args.newName.trim();
        if (!newName) throw new Error("Category name cannot be empty");

        const setting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "categories"))
            .first();

        const categories: string[] = setting && setting.value
            ? JSON.parse(setting.value)
            : [...DEFAULT_CATEGORIES];

        const idx = categories.indexOf(args.oldName);
        if (idx === -1) throw new Error("Category not found");
        if (categories.includes(newName)) throw new Error("Category already exists");
        categories[idx] = newName;

        if (setting) {
            await ctx.db.patch(setting._id, { value: JSON.stringify(categories) });
        } else {
            await ctx.db.insert("siteSettings", { key: "categories", value: JSON.stringify(categories) });
        }

        // Update all products with the old category name
        const products = await ctx.db
            .query("products")
            .withIndex("by_category", (q) => q.eq("category", args.oldName))
            .collect();
        for (const product of products) {
            await ctx.db.patch(product._id, { category: newName });
        }

        // Migrate category image key
        const oldImageSetting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", `categoryImage:${args.oldName}`))
            .first();
        if (oldImageSetting) {
            await ctx.db.insert("siteSettings", {
                key: `categoryImage:${newName}`,
                value: oldImageSetting.value,
            });
            await ctx.db.delete(oldImageSetting._id);
        }
    },
});

// Admin: delete a category
export const deleteCategory = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const setting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "categories"))
            .first();

        const categories: string[] = setting && setting.value
            ? JSON.parse(setting.value)
            : [...DEFAULT_CATEGORIES];

        const filtered = categories.filter((c) => c !== args.name);
        if (filtered.length === categories.length) throw new Error("Category not found");

        if (setting) {
            await ctx.db.patch(setting._id, { value: JSON.stringify(filtered) });
        } else {
            await ctx.db.insert("siteSettings", { key: "categories", value: JSON.stringify(filtered) });
        }

        // Move affected products to "Uncategorized"
        const products = await ctx.db
            .query("products")
            .withIndex("by_category", (q) => q.eq("category", args.name))
            .collect();
        for (const product of products) {
            await ctx.db.patch(product._id, { category: "Uncategorized" });
        }

        // Delete category image
        const imageSetting = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", `categoryImage:${args.name}`))
            .first();
        if (imageSetting) {
            try {
                await ctx.storage.delete(imageSetting.value as Id<"_storage">);
            } catch { /* already gone */ }
            await ctx.db.delete(imageSetting._id);
        }
    },
});

// Public query — read all category images at once
export const getCategoryImages = query({
    args: {},
    handler: async (ctx) => {
        const categories = await getCategoriesList(ctx);
        const results: Record<string, string> = {};
        for (const cat of categories) {
            const setting = await ctx.db
                .query("siteSettings")
                .withIndex("by_key", (q) => q.eq("key", `categoryImage:${cat}`))
                .first();
            if (setting) {
                const url = await ctx.storage.getUrl(setting.value as Id<"_storage">);
                if (url) results[cat] = url;
            }
        }
        return results;
    },
});

// Admin: set a category image
export const setCategoryImage = mutation({
    args: { category: v.string(), storageId: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const key = `categoryImage:${args.category}`;

        const existing = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first();

        if (existing) {
            try {
                await ctx.storage.delete(existing.value as Id<"_storage">);
            } catch { /* old file may be gone */ }
            await ctx.db.patch(existing._id, { value: args.storageId });
        } else {
            await ctx.db.insert("siteSettings", { key, value: args.storageId });
        }
    },
});

// Admin: remove a category image
export const removeCategoryImage = mutation({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const key = `categoryImage:${args.category}`;

        const existing = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first();

        if (existing) {
            try {
                await ctx.storage.delete(existing.value as Id<"_storage">);
            } catch { /* already gone */ }
            await ctx.db.delete(existing._id);
        }
    },
});

// Admin: remove the banner
export const removeHeroBanner = mutation({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const existing = await ctx.db
            .query("siteSettings")
            .withIndex("by_key", (q) => q.eq("key", "heroBanner"))
            .first();

        if (existing) {
            try {
                await ctx.storage.delete(existing.value as Id<"_storage">);
            } catch {
                // Already gone
            }
            await ctx.db.delete(existing._id);
        }
    },
});
