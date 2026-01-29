"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Truck } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as Id<"products">;

    const product = useQuery(api.products.get, { id: productId });

    if (product === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (product === null) {
        return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-lg border overflow-hidden flex items-center justify-center">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="object-contain w-full h-full" />
                            ) : (
                                <span className="text-muted-foreground">No Image</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.slice(1).map((img: string, i: number) => (
                                <div key={i} className="aspect-square bg-white rounded-lg border overflow-hidden">
                                    <img src={img} alt="" className="object-cover w-full h-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                            <div className="text-lg text-primary font-medium">{product.category}</div>
                        </div>

                        <div className="text-4xl font-bold">R {product.price}</div>

                        <div className="prose max-w-none text-muted-foreground">
                            <p>{product.description}</p>
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex gap-4">
                                <Button size="lg" className="flex-1 text-lg h-14">
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 w-14 p-0">
                                    <Heart className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="font-semibold block">Shipping via Shiprazor</span>
                                    <span className="text-muted-foreground">Calculated at checkout</span>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pl-8">
                                Sold by Vendor ID: {product.vendorId} (Fetch Vendor Name logic here)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
