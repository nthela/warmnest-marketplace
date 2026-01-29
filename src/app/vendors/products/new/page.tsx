"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    category: z.string().min(1, "Category is required"),
    images: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProductPage() {
    const createProduct = useMutation(api.vendors.createProduct);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 1,
            category: "",
            images: "",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            const imageArray = values.images ? values.images.split(",").map(s => s.trim()) : [];

            await createProduct({
                ...values,
                images: imageArray,
            });
            router.push("/vendors/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to create product. Ensure you are an approved vendor.");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Add New Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Product Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price (R)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="100" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock Quantity</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Electronics, Fashion..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Product details..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URLs (comma separated)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..., https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    Create Product
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
