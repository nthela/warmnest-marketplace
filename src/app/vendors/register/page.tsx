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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";

const formSchema = z.object({
    storeName: z.string().min(2, "Store name must be at least 2 characters."),
    slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes."),
    description: z.string().optional(),
});

export default function VendorRegisterPage() {
    const registerVendor = useMutation(api.vendors.register);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            storeName: "",
            slug: "",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await registerVendor(values);
            router.push("/vendors/dashboard");
        } catch (error) {
            console.error(error);
            form.setError("root", { message: "Something went wrong. Slug might be taken." });
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Become a Vendor</CardTitle>
                        <CardDescription>Start selling on WarmNest today. Create your seller profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="storeName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Inc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store URL Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="acme-inc" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Your store will be at warmnest.co.za/shop/{field.value || "..."}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Tell us about your store..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.formState.errors.root && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
                                )}

                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Submitting..." : "Register Store"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
