"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";

export default function SignInPage() {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (step === "signIn") {
                await signIn("password", { email, password, flow: "signIn" });
            } else {
                await signIn("password", { email, password, flow: "signUp" });
            }
            // Redirect or handle session check
            // With @convex-dev/auth, redirects are often handled or we just go to home
            router.push("/");
        } catch (error) {
            console.error(error);
            alert("Authentication failed. " + (error as any).message);
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
                        <form onSubmit={handleSubmit} className="space-y-4">
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
