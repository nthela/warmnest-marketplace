"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import {
    Heart,
    ShoppingCart,
    ArrowLeft,
    Trash2,
    Loader2,
    Package,
    Check,
} from "lucide-react";
import { useState } from "react";

export default function WishlistPage() {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const router = useRouter();
    const wishlistItems = useQuery(api.wishlist.get);
    const removeFromWishlist = useMutation(api.wishlist.remove);
    const { addItem } = useCart();
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/signin");
        return null;
    }

    function handleAddToCart(item: any) {
        addItem({
            productId: item.product._id,
            name: item.product.name,
            price: item.product.salePrice ?? item.product.price,
            image: item.product.imageUrl ?? "",
            vendor: item.product.vendorName,
        });
        setAddedIds((prev) => new Set(prev).add(item.product._id));
        setTimeout(() => {
            setAddedIds((prev) => {
                const next = new Set(prev);
                next.delete(item.product._id);
                return next;
            });
        }, 2000);
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/account">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {wishlistItems
                                ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} saved`
                                : "Loading..."}
                        </p>
                    </div>
                </div>

                {/* Wishlist Items */}
                {!wishlistItems ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-72 bg-white rounded-lg border animate-pulse" />
                        ))}
                    </div>
                ) : wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {wishlistItems.map((item: any) => {
                            const isAdded = addedIds.has(item.product._id);
                            const outOfStock = item.product.stock <= 0;

                            return (
                                <Card key={item._id} className="overflow-hidden group">
                                    {/* Image */}
                                    <Link href={`/shop/${item.product._id}`}>
                                        <div className="aspect-square bg-muted relative overflow-hidden">
                                            {item.product.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-10 w-10 text-muted-foreground" />
                                                </div>
                                            )}
                                            {item.product.salePrice && (
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    {Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100)}% OFF
                                                </span>
                                            )}
                                            {outOfStock && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="bg-white text-sm font-semibold px-3 py-1.5 rounded">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <CardContent className="p-4 space-y-3">
                                        <div>
                                            <Link href={`/shop/${item.product._id}`}>
                                                <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {item.product.vendorName}
                                            </p>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            {item.product.salePrice ? (
                                                <>
                                                    <span className="font-bold text-red-600">
                                                        R {item.product.salePrice.toFixed(2)}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        R {item.product.price.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-bold">
                                                    R {item.product.price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 gap-1.5"
                                                disabled={outOfStock || isAdded}
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                {isAdded ? (
                                                    <><Check className="h-3.5 w-3.5" /> Added</>
                                                ) : (
                                                    <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => removeFromWishlist({ productId: item.product._id })}
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg mb-1">Your wishlist is empty</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Save items you love by tapping the heart icon on any product.
                            </p>
                            <Link href="/shop">
                                <Button>Browse Products</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
}
