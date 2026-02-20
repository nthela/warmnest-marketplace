"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart, Check } from "lucide-react";

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addItem } = useCart();

    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [priceFilter, setPriceFilter] = useState<{ min?: number; max?: number }>({});
    const [addedId, setAddedId] = useState<string | null>(null);

    const { results, status, loadMore } = usePaginatedQuery(
        api.products.list,
        { category, search },
        { initialNumItems: 12 }
    );

    // Apply client-side price filtering
    const filteredResults = results?.filter((product) => {
        const price = product.salePrice ?? product.price;
        if (priceFilter.min !== undefined && price < priceFilter.min) return false;
        if (priceFilter.max !== undefined && price > priceFilter.max) return false;
        return true;
    });

    const handlePriceFilter = () => {
        setPriceFilter({
            min: minPrice ? Number(minPrice) : undefined,
            max: maxPrice ? Number(maxPrice) : undefined,
        });
    };

    const clearPriceFilter = () => {
        setMinPrice("");
        setMaxPrice("");
        setPriceFilter({});
    };

    const handleAddToCart = (product: NonNullable<typeof results>[number]) => {
        addItem({
            productId: product._id,
            name: product.name,
            price: product.salePrice ?? product.price,
            image: product.imageUrls?.[0] ?? "",
            vendor: "",
        });
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const title = search
        ? `Results for "${search}"`
        : category
            ? category
            : "All Products";

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 space-y-6 flex-shrink-0">
                    {search && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-muted-foreground mb-2">Searching for:</p>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{search}</span>
                                <Button variant="ghost" size="sm" onClick={() => router.push("/shop")}>Clear</Button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4">Categories</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={search ? `/shop?search=${search}` : "/shop"}
                                    className={`hover:text-primary ${!category ? 'text-primary font-bold' : ''}`}
                                >
                                    All Categories
                                </Link>
                            </li>
                            {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"].map(cat => (
                                <li key={cat}>
                                    <Link
                                        href={search ? `/shop?category=${cat}&search=${search}` : `/shop?category=${cat}`}
                                        className={`hover:text-primary ${category === cat ? 'text-primary font-bold' : ''}`}
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4">Price Range</h3>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Min"
                                type="number"
                                className="h-8"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <Input
                                placeholder="Max"
                                type="number"
                                className="h-8"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <Button size="sm" className="w-full mt-2" variant="outline" onClick={handlePriceFilter}>
                            Apply
                        </Button>
                        {(priceFilter.min !== undefined || priceFilter.max !== undefined) && (
                            <Button size="sm" className="w-full mt-1" variant="ghost" onClick={clearPriceFilter}>
                                Clear Filter
                            </Button>
                        )}
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredResults?.length ?? 0} results
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {status === "LoadingFirstPage" ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
                            ))
                        ) : filteredResults?.length === 0 ? (
                            <div className="col-span-full text-center py-12">No products found.</div>
                        ) : (
                            filteredResults?.map((product) => (
                                <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <Link href={`/shop/${product._id}`}>
                                        <div className="aspect-square bg-muted relative">
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                                {product.imageUrls?.[0] ? (
                                                    <img src={product.imageUrls[0]} alt={product.name} className="object-cover w-full h-full" />
                                                ) : (
                                                    "No Image"
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <CardContent className="p-4">
                                        <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                                        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                                        <div className="mb-3">
                                            {product.salePrice ? (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-bold text-lg text-red-600">R {product.salePrice}</span>
                                                    <span className="text-sm text-muted-foreground line-through">R {product.price}</span>
                                                </div>
                                            ) : (
                                                <span className="font-bold text-lg">R {product.price}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/shop/${product._id}`} className="flex-1">
                                                <Button variant="outline" className="w-full" size="sm">View</Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                {addedId === product._id ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <><ShoppingCart className="h-4 w-4 mr-1" /> Add</>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {status === "CanLoadMore" && (
                        <div className="mt-8 text-center">
                            <Button onClick={() => loadMore(12)} variant="outline">Load More</Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
            <ShopContent />
        </Suspense>
    );
}
