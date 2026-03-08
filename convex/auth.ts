import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [
        Password({
            profile(params) {
                return {
                    email: params.email as string,
                    name: (params.name as string) || (params.email as string).split("@")[0],
                    surname: (params.surname as string) || "",
                    phone: (params.phone as string) || "",
                    role: "customer" as const,
                    emailVerified: false,
                };
            },
        }),
    ],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx, args) {
            // Only send verification email for new sign-ups (no existing user)
            if (args.existingUserId === null && args.type === "credentials") {
                await ctx.scheduler.runAfter(0, internal.email.sendVerificationEmail, {
                    userId: args.userId,
                });
            }
        },
    },
});
