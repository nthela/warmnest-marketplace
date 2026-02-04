"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
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
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, ImageIcon, Star, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    salePrice: z.coerce.number().min(0).optional().or(z.literal("")),
    sku: z.string().optional(),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as Id<"products">;
    const product = useQuery(api.vendors.getProduct, { productId });
    const updateProduct = useMutation(api.vendors.updateProduct);
    const generateUploadUrl = useMutation(api.vendors.generateUploadUrl);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Existing images (storage IDs from the product)
    const [existingImages, setExistingImages] = useState<string[]>([]);
    // Newly selected files
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    // mainIndex tracks across both existing + new: 0..existingImages.length-1 = existing, rest = new
    const [mainIndex, setMainIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [formReady, setFormReady] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const totalImages = existingImages.length + newPreviews.length;

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            salePrice: "",
            sku: "",
            stock: 1,
            category: "",
        },
    });

    const addTag = useCallback(() => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput("");
    }, [tagInput, tags]);

    const removeTag = useCallback((tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
    }, []);

    // Populate form when product loads
    useEffect(() => {
        if (product && !formReady) {
            form.reset({
                name: product.name,
                description: product.description,
                price: product.price,
                salePrice: product.salePrice ?? "",
                sku: product.sku ?? "",
                stock: product.stock,
                category: product.category,
            });
            setExistingImages(product.images);
            setTags(product.tags ?? []);
            setFormReady(true);
        }
    }, [product, form, formReady]);

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));

        setNewFiles((prev) => [...prev, ...imageFiles]);

        imageFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewPreviews((prev) => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function removeExistingImage(index: number) {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
        if (index === mainIndex) {
            setMainIndex(0);
        } else if (index < mainIndex) {
            setMainIndex((prev) => prev - 1);
        }
    }

    function removeNewImage(index: number) {
        const globalIndex = existingImages.length + index;
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
        if (globalIndex === mainIndex) {
            setMainIndex(0);
        } else if (globalIndex < mainIndex) {
            setMainIndex((prev) => prev - 1);
        }
    }

    async function onSubmit(values: FormValues) {
        if (existingImages.length === 0 && newFiles.length === 0) {
            alert("Please have at least one product image.");
            return;
        }

        try {
            setUploading(true);

            // Upload new files
            const newImageIds: string[] = [];
            for (const file of newFiles) {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                const { storageId } = await result.json();
                newImageIds.push(storageId);
            }

            const allImages = [...existingImages, ...newImageIds];

            // Put main image first
            const orderedImages = [
                allImages[mainIndex],
                ...allImages.filter((_, i) => i !== mainIndex),
            ];

            await updateProduct({
                productId,
                name: values.name,
                description: values.description,
                price: values.price,
                salePrice: values.salePrice && values.salePrice !== "" ? Number(values.salePrice) : undefined,
                sku: values.sku || undefined,
                stock: values.stock,
                category: values.category,
                tags,
                images: orderedImages,
            });
            router.push("/vendors/products");
        } catch (error) {
            console.error(error);
            alert("Failed to update product.");
        } finally {
            setUploading(false);
        }
    }

    if (product === undefined) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    if (product === null) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <p className="text-red-600">Product not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Product</CardTitle>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="salePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sale Price (R)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Optional" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sku"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SKU</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. WN-001" {...field} />
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

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tags</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                            placeholder="Add a tag and press Enter"
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addTag}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                                    {tag} <X className="h-3 w-3 ml-1" />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

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

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product Images</label>
                                    <p className="text-xs text-muted-foreground">Click an image to set it as the main product image.</p>

                                    {/* Existing + New Previews Grid */}
                                    {totalImages > 0 && (
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            {existingImages.map((storageId, i) => (
                                                <ExistingImagePreview
                                                    key={storageId}
                                                    storageId={storageId}
                                                    isMain={i === mainIndex}
                                                    onClick={() => setMainIndex(i)}
                                                    onRemove={() => removeExistingImage(i)}
                                                />
                                            ))}
                                            {newPreviews.map((src, i) => {
                                                const globalIdx = existingImages.length + i;
                                                return (
                                                    <div
                                                        key={`new-${i}`}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-white group cursor-pointer ${
                                                            globalIdx === mainIndex ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
                                                        }`}
                                                        onClick={() => setMainIndex(globalIdx)}
                                                    >
                                                        <img
                                                            src={src}
                                                            alt={`New ${i + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {globalIdx === mainIndex && (
                                                            <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                <Star className="h-2.5 w-2.5 fill-white" />
                                                                MAIN
                                                            </div>
                                                        )}
                                                        {globalIdx !== mainIndex && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-xs font-medium">Set as main</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeNewImage(i); }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        {totalImages === 0 ? (
                                            <>
                                                <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm font-medium">Click to upload product images</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB each</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                + Add more images ({totalImages} total)
                                            </p>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || uploading}>
                                    {uploading ? (
                                        <>
                                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Component to render an existing image from Convex storage with main selection
function ExistingImagePreview({
    storageId,
    isMain,
    onClick,
    onRemove,
}: {
    storageId: string;
    isMain: boolean;
    onClick: () => void;
    onRemove: () => void;
}) {
    const url = useQuery(api.vendors.getImageUrl, { storageId: storageId as Id<"_storage"> });

    return (
        <div
            className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-white group cursor-pointer ${
                isMain ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
            }`}
            onClick={onClick}
        >
            {url ? (
                <img src={url} alt="Product" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-6 w-6 text-muted-foreground animate-pulse" />
                </div>
            )}
            {isMain && (
                <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-white" />
                    MAIN
                </div>
            )}
            {!isMain && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Set as main</span>
                </div>
            )}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
