"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";

export default function SignInPage() {
    const { signIn } = useAuthActions();
    const { isAuthenticated } = useConvexAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/account");
        }
    }, [isAuthenticated, router]);
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            if (step === "signIn") {
                await signIn("password", { email, password, flow: "signIn" });
            } else {
                await signIn("password", { email, password, name, flow: "signUp" });
            }
            router.push("/account");
        } catch (err) {
            console.error(err);
            if (step === "signIn") {
                setError("Invalid email or password. Please try again.");
            } else {
                setError("Could not create account. The email may already be registered.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>{step === "signIn" ? "Sign In" : "Create Account"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {step === "signUp" && (
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            )}
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Loading..." : (step === "signIn" ? "Sign In" : "Sign Up")}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            {step === "signIn" ? (
                                <p>Don't have an account? <button onClick={() => setStep("signUp")} className="text-primary hover:underline">Sign Up</button></p>
                            ) : (
                                <p>Already have an account? <button onClick={() => setStep("signIn")} className="text-primary hover:underline">Sign In</button></p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
