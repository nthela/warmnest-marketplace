import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listAccounts = internalQuery({
    args: {},
    handler: async (ctx) => {
        const accounts = await ctx.db.query("authAccounts").take(10);
        const users = await ctx.db.query("users").take(10);
        return { accounts, users };
    },
});
