"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Truck, ChevronLeft, ChevronRight, Store, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useCallback, useRef, useEffect } from "react";

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as Id<"products">;

    const product = useQuery(api.products.get, { id: productId });
    const { addItem } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [added, setAdded] = useState(false);

    // Touch/swipe handling with drag tracking
    const carouselRef = useRef<HTMLDivElement>(null);
    const touchRef = useRef<{ startX: number; startY: number; isDragging: boolean } | null>(null);
    const dragOffsetRef = useRef(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const images = product?.imageUrls ?? [];

    const goTo = useCallback((index: number) => {
        if (index >= 0 && index < images.length) {
            setIsTransitioning(true);
            setCurrentIndex(index);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    }, [images.length]);

    const goNext = useCallback(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), 300);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setTimeout(() => setIsTransitioning(false), 300);
    }, [images.length]);

    // Attach non-passive touch listeners so preventDefault() actually blocks scrolling
    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;

        function onTouchStart(e: TouchEvent) {
            touchRef.current = {
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY,
                isDragging: false,
            };
            dragOffsetRef.current = 0;
            setDragOffset(0);
        }

        function onTouchMove(e: TouchEvent) {
            if (!touchRef.current) return;
            const diffX = e.touches[0].clientX - touchRef.current.startX;
            const diffY = e.touches[0].clientY - touchRef.current.startY;

            if (!touchRef.current.isDragging && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                touchRef.current.isDragging = true;
            }

            if (touchRef.current.isDragging) {
                e.preventDefault(); // This works because listener is non-passive
                dragOffsetRef.current = diffX;
                setDragOffset(diffX);
            }
        }

        function onTouchEnd() {
            if (!touchRef.current) return;
            const threshold = 50;
            const offset = dragOffsetRef.current;

            if (touchRef.current.isDragging) {
                if (offset < -threshold) {
                    setIsTransitioning(true);
                    setCurrentIndex((prev) => Math.min(prev + 1, (product?.imageUrls?.length ?? 1) - 1));
                    setTimeout(() => setIsTransitioning(false), 300);
                } else if (offset > threshold) {
                    setIsTransitioning(true);
                    setCurrentIndex((prev) => Math.max(prev - 1, 0));
                    setTimeout(() => setIsTransitioning(false), 300);
                }
            }

            dragOffsetRef.current = 0;
            setDragOffset(0);
            touchRef.current = null;
        }

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [product?.imageUrls?.length]);

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
                        {/* Main Image — swipeable carousel */}
                        <div
                            ref={carouselRef}
                            className="relative aspect-square bg-white rounded-lg border overflow-hidden select-none"
                        >
                            {images.length > 0 ? (
                                <div
                                    className="flex h-full"
                                    style={{
                                        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                                        transition: dragOffset !== 0 ? "none" : isTransitioning ? "transform 300ms ease-out" : "none",
                                    }}
                                >
                                    {images.map((img: string, i: number) => (
                                        <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                                            <img
                                                src={img}
                                                alt={`${product.name} ${i + 1}`}
                                                className="object-contain w-full h-full"
                                                draggable={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-muted-foreground">No Image</span>
                                </div>
                            )}

                            {/* Navigation arrows (desktop) */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={goPrev}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-2 transition-colors hidden md:block"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={goNext}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-2 transition-colors hidden md:block"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Dot indicators (mobile) + counter (desktop) */}
                            {images.length > 1 && (
                                <>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                                        {images.map((_: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => goTo(i)}
                                                className={`rounded-full transition-all ${
                                                    i === currentIndex
                                                        ? "w-6 h-2 bg-primary"
                                                        : "w-2 h-2 bg-white/70"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full hidden md:block">
                                        {currentIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail strip (desktop) */}
                        {images.length > 1 && (
                            <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
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
                                <Button
                                    size="lg"
                                    className="flex-1 text-lg h-14"
                                    onClick={() => {
                                        addItem({
                                            productId: product._id,
                                            name: product.name,
                                            price: product.salePrice ?? product.price,
                                            image: product.imageUrls?.[0] ?? "",
                                            vendor: product.vendorName ?? "Unknown Seller",
                                        });
                                        setAdded(true);
                                        setTimeout(() => setAdded(false), 2000);
                                    }}
                                >
                                    {added ? (
                                        <><Check className="mr-2 h-5 w-5" /> Added!</>
                                    ) : (
                                        <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>
                                    )}
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
