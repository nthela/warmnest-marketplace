"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";

const SA_PROVINCES = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
    "Western Cape",
];

export default function SignInPage() {
    const { signIn } = useAuthActions();
    const { isAuthenticated } = useConvexAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (step === "signUp" && password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            if (step === "signIn") {
                await signIn("password", { email, password, flow: "signIn" });
            } else {
                await signIn("password", {
                    email,
                    password,
                    name,
                    surname,
                    phone,
                    flow: "signUp",
                });
            }
            router.push("/");
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
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <Card className="w-full max-w-md">
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
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">First Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="surname">Surname</Label>
                                            <Input
                                                id="surname"
                                                type="text"
                                                placeholder="Doe"
                                                value={surname}
                                                onChange={(e) => setSurname(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="0812345678"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            pattern="^(\+27|0)[0-9]{9}$"
                                            title="Enter a valid SA phone number (e.g. 0812345678 or +27812345678)"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            {step === "signUp" && (
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Loading..." : (step === "signIn" ? "Sign In" : "Create Account")}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            {step === "signIn" ? (
                                <p>Don&apos;t have an account? <button onClick={() => setStep("signUp")} className="text-primary hover:underline">Sign Up</button></p>
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
