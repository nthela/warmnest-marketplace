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
        // Input validation
        const name = args.name.trim();
        const email = args.email.trim().toLowerCase();
        const location = args.location.trim();
        if (!name || name.length > 200) throw new Error("Name is required and must be under 200 characters.");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email address is required.");
        if (!location || location.length > 200) throw new Error("Location is required and must be under 200 characters.");

        // Check if email already on waitlist
        const existing = await ctx.db
            .query("vendorWaitlist")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            throw new Error("This email is already on the waitlist.");
        }

        return await ctx.db.insert("vendorWaitlist", {
            name,
            email,
            location,
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
