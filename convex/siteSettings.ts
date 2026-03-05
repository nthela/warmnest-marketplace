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

// Public query — read all category images at once
export const getCategoryImages = query({
    args: {},
    handler: async (ctx) => {
        const categories = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"];
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
