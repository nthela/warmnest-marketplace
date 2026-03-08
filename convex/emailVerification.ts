import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── INTERNAL MUTATIONS (called by actions) ─────────────────

export const storeToken = internalMutation({
    args: {
        userId: v.id("users"),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // Delete any existing tokens for this user
        const existing = await ctx.db
            .query("emailVerificationTokens")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        for (const t of existing) {
            await ctx.db.delete(t._id);
        }

        await ctx.db.insert("emailVerificationTokens", {
            userId: args.userId,
            token: args.token,
            expiresAt: Date.now() + TOKEN_EXPIRY_MS,
        });
    },
});

// ─── INTERNAL QUERIES (called by actions) ───────────────────

export const getUserEmail = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;
        return {
            email: user.email ?? null,
            name: user.name ?? "Customer",
            emailVerified: user.emailVerified ?? false,
        };
    },
});

// ─── PUBLIC QUERIES ─────────────────────────────────────────

export const getVerificationStatus = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        const user = await ctx.db.get(userId);
        if (!user) return null;
        return {
            emailVerified: user.emailVerified ?? false,
            email: user.email ?? null,
        };
    },
});

// ─── PUBLIC MUTATIONS ───────────────────────────────────────

export const verifyToken = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const record = await ctx.db
            .query("emailVerificationTokens")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!record) {
            return { success: false, error: "Invalid or expired verification link." };
        }

        if (record.expiresAt < Date.now()) {
            await ctx.db.delete(record._id);
            return { success: false, error: "This verification link has expired. Please request a new one." };
        }

        // Mark user as verified
        const user = await ctx.db.get(record.userId);
        if (!user) {
            await ctx.db.delete(record._id);
            return { success: false, error: "User account not found." };
        }

        await ctx.db.patch(record.userId, { emailVerified: true });

        // Clean up token
        await ctx.db.delete(record._id);

        return { success: true };
    },
});

export const resendVerification = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        if (user.emailVerified) {
            return { success: false, error: "Your email is already verified." };
        }

        if (!user.email) {
            return { success: false, error: "No email address on file." };
        }

        // Rate limit: check if a token was created recently (within last 2 minutes)
        const recentToken = await ctx.db
            .query("emailVerificationTokens")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (recentToken && recentToken.expiresAt - TOKEN_EXPIRY_MS + 2 * 60 * 1000 > Date.now()) {
            return { success: false, error: "Please wait a couple of minutes before requesting another email." };
        }

        // Schedule the email action
        await ctx.scheduler.runAfter(0, internal.email.sendVerificationEmail, {
            userId,
        });

        return { success: true };
    },
});
