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
