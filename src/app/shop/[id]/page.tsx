"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Truck, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useCallback } from "react";

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as Id<"products">;

    const product = useQuery(api.products.get, { id: productId });
    const [currentIndex, setCurrentIndex] = useState(0);

    // Touch/swipe handling
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const images = product?.imageUrls ?? [];

    const goTo = useCallback((index: number) => {
        if (index >= 0 && index < images.length) {
            setCurrentIndex(index);
        }
    }, [images.length]);

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    function handleTouchStart(e: React.TouchEvent) {
        setTouchStart(e.touches[0].clientX);
    }

    function handleTouchEnd(e: React.TouchEvent) {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goNext();
            else goPrev();
        }
        setTouchStart(null);
    }

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
                    {/* Images Gallery */}
                    <div className="space-y-4">
                        {/* Main Image with swipe + arrows */}
                        <div
                            className="relative aspect-square bg-white rounded-lg border overflow-hidden flex items-center justify-center select-none"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {images.length > 0 ? (
                                <img
                                    src={images[currentIndex]}
                                    alt={product.name}
                                    className="object-contain w-full h-full transition-opacity duration-200"
                                    draggable={false}
                                />
                            ) : (
                                <span className="text-muted-foreground">No Image</span>
                            )}

                            {/* Navigation arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={goPrev}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-2 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={goNext}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-2 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Image counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                                    {currentIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                                            i === currentIndex
                                                ? "border-primary ring-2 ring-primary/30"
                                                : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                            <div className="text-lg text-primary font-medium">{product.category}</div>
                        </div>

                        <div className="flex items-baseline gap-3">
                            {product.salePrice ? (
                                <>
                                    <span className="text-4xl font-bold text-red-600">R {product.salePrice}</span>
                                    <span className="text-2xl text-muted-foreground line-through">R {product.price}</span>
                                </>
                            ) : (
                                <span className="text-4xl font-bold">R {product.price}</span>
                            )}
                        </div>

                        {product.sku && (
                            <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                        )}

                        <div className="prose max-w-none text-muted-foreground">
                            <p>{product.description}</p>
                        </div>

                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {product.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        )}

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
                                <Store className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="font-semibold block">Sold by {product.vendorName}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Truck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="font-semibold block">Shipping via Shiprazor</span>
                                    <span className="text-muted-foreground">Calculated at checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
