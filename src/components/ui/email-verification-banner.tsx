"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailVerificationBanner() {
    const { isAuthenticated } = useConvexAuth();
    const status = useQuery(
        api.emailVerification.getVerificationStatus,
        isAuthenticated ? {} : "skip"
    );
    const resend = useMutation(api.emailVerification.resendVerification);
    const [dismissed, setDismissed] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    // Don't show if not authenticated, already verified, loading, or dismissed
    if (!isAuthenticated || !status || status.emailVerified || dismissed) {
        return null;
    }

    async function handleResend() {
        setResending(true);
        setResendMessage("");
        try {
            const result = await resend();
            if (result.success) {
                setResendMessage("Verification email sent! Check your inbox.");
            } else {
                setResendMessage(result.error ?? "Could not send email.");
            }
        } catch {
            setResendMessage("Something went wrong. Please try again.");
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-amber-800 min-w-0">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                        Please verify your email address{status.email ? ` (${status.email})` : ""}.
                        {resendMessage && (
                            <span className="ml-1 font-medium">{resendMessage}</span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? "Sending..." : "Resend"}
                    </Button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-amber-600 hover:text-amber-800 p-0.5"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
