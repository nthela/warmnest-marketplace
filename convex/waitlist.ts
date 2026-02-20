import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const join = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        location: v.string(),
        businessType: v.union(v.literal("sole_proprietor"), v.literal("registered_business")),
    },
    handler: async (ctx, args) => {
        // Check if email already on waitlist
        const existing = await ctx.db
            .query("vendorWaitlist")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("This email is already on the waitlist.");
        }

        return await ctx.db.insert("vendorWaitlist", {
            name: args.name,
            email: args.email,
            location: args.location,
            businessType: args.businessType,
            createdAt: Date.now(),
        });
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("vendorWaitlist")
            .order("desc")
            .collect();
    },
});

export const getCount = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("vendorWaitlist").collect();
        return all.length;
    },
});
