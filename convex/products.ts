import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
    args: {
        category: v.optional(v.string()),
        search: v.optional(v.string()),
        vendorId: v.optional(v.id("vendors")),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("products").withIndex("by_category");

        if (args.category !== undefined) {
            q = ctx.db.query("products").withIndex("by_category", (q) => q.eq("category", args.category!));
        } else if (args.vendorId !== undefined) {
            q = ctx.db.query("products").withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId!));
        }

        const results = await q.filter(q => q.eq(q.field("isActive"), true)).paginate(args.paginationOpts);

        return results;
    },
});

export const get = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
