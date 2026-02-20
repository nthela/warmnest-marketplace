"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { CheckCircle2, Store, Users, Sparkles } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    location: z.string().min(2, "Please enter your business location."),
    businessType: z.enum(["sole_proprietor", "registered_business"], {
        message: "Please select a business type.",
    }),
});

export default function VendorRegisterPage() {
    const joinWaitlist = useMutation(api.waitlist.join);
    const waitlistCount = useQuery(api.waitlist.getCount);
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            location: "",
            businessType: undefined,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await joinWaitlist(values);
            setSubmitted(true);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong.";
            if (message.includes("already on the waitlist")) {
                form.setError("email", { message: "This email is already on the waitlist." });
            } else {
                form.setError("root", { message });
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-primary/10 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Sell on <span className="text-primary">WarmNest</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We&apos;re building South Africa&apos;s next big marketplace. Join the waitlist and be among the first sellers when we launch.
                        </p>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-12 container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Card className="text-center border-none shadow-sm">
                            <CardContent className="pt-6">
                                <Store className="h-10 w-10 text-primary mx-auto mb-3" />
                                <h3 className="font-bold mb-1">Your Own Storefront</h3>
                                <p className="text-sm text-muted-foreground">Get a fully branded store page with your products, story, and identity.</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center border-none shadow-sm">
                            <CardContent className="pt-6">
                                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                                <h3 className="font-bold mb-1">Reach More Customers</h3>
                                <p className="text-sm text-muted-foreground">Tap into our growing community of South African shoppers.</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center border-none shadow-sm">
                            <CardContent className="pt-6">
                                <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                                <h3 className="font-bold mb-1">Early Access Perks</h3>
                                <p className="text-sm text-muted-foreground">First sellers get reduced commission rates and priority support.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Waitlist Form */}
                <section id="waitlist-form" className="py-12 container mx-auto px-4 flex justify-center">
                    {submitted ? (
                        <Card className="w-full max-w-lg">
                            <CardContent className="pt-8 pb-8 text-center space-y-4">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                                <h2 className="text-2xl font-bold">You&apos;re on the list!</h2>
                                <p className="text-muted-foreground">
                                    We&apos;ll notify you via email when we start accepting seller applications. Stay tuned!
                                </p>
                                {waitlistCount !== undefined && waitlistCount > 1 && (
                                    <p className="text-sm text-primary font-medium">
                                        {waitlistCount} sellers already on the waitlist
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="w-full max-w-lg">
                            <CardHeader>
                                <CardTitle>Join the Seller Waitlist</CardTitle>
                                <CardDescription>
                                    Fill in your details below and we&apos;ll reach out when we&apos;re ready for you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name or Business Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Thandi's Crafts or John Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="you@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Johannesburg, Gauteng" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="businessType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Type</FormLabel>
                                                    <FormControl>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => field.onChange("sole_proprietor")}
                                                                className={`p-4 rounded-lg border-2 text-center transition-all ${
                                                                    field.value === "sole_proprietor"
                                                                        ? "border-primary bg-primary/5 text-primary"
                                                                        : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                            >
                                                                <div className="font-semibold text-sm">Sole Proprietor</div>
                                                                <div className="text-xs text-muted-foreground mt-1">Individual seller</div>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => field.onChange("registered_business")}
                                                                className={`p-4 rounded-lg border-2 text-center transition-all ${
                                                                    field.value === "registered_business"
                                                                        ? "border-primary bg-primary/5 text-primary"
                                                                        : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                            >
                                                                <div className="font-semibold text-sm">Registered Business</div>
                                                                <div className="text-xs text-muted-foreground mt-1">PTY, CC, etc.</div>
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.formState.errors.root && (
                                            <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
                                        )}

                                        <Button type="submit" className="w-full h-12 text-base" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? "Joining..." : "Join the Waitlist"}
                                        </Button>

                                        {waitlistCount !== undefined && waitlistCount > 0 && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                {waitlistCount} {waitlistCount === 1 ? "seller has" : "sellers have"} already joined
                                            </p>
                                        )}
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
