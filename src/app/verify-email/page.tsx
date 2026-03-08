"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const verifyToken = useMutation(api.emailVerification.verifyToken);

    const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
        token ? "loading" : "no-token"
    );
    const [errorMessage, setErrorMessage] = useState("");
    const hasRun = useRef(false);

    useEffect(() => {
        if (!token || hasRun.current) return;
        hasRun.current = true;

        verifyToken({ token })
            .then((result) => {
                if (result.success) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setErrorMessage(result.error ?? "Verification failed.");
                }
            })
            .catch(() => {
                setStatus("error");
                setErrorMessage("Something went wrong. Please try again.");
            });
    }, [token, verifyToken]);

    return (
        <Card className="w-full max-w-md">
            <CardContent className="pt-8 pb-8 text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                        <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
                        <p className="text-muted-foreground text-sm">Please wait a moment.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                        <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Your email address has been successfully verified. You now have full access to your WarmNest account.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/account">
                                <Button>My Account</Button>
                            </Link>
                            <Link href="/shop">
                                <Button variant="outline">Browse Shop</Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                        <p className="text-muted-foreground text-sm mb-6">{errorMessage}</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/account">
                                <Button>Go to Account</Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === "no-token" && (
                    <>
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                        <h2 className="text-xl font-semibold mb-2">No Verification Token</h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            This page requires a verification link from your email. Check your inbox for the verification email from WarmNest.
                        </p>
                        <Link href="/">
                            <Button>Go Home</Button>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <Suspense fallback={
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-8 pb-8 text-center">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                            <p className="text-muted-foreground text-sm">Loading...</p>
                        </CardContent>
                    </Card>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
