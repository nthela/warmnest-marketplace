"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShopContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || undefined;

    const { results, status, loadMore } = usePaginatedQuery(
        api.products.list,
        { category },
        { initialNumItems: 12 }
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4">Categories</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/shop" className={`hover:text-primary ${!category ? 'text-primary font-bold' : ''}`}>All Categories</Link></li>
                            {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"].map(cat => (
                                <li key={cat}>
                                    <Link href={`/shop?category=${cat}`} className={`hover:text-primary ${category === cat ? 'text-primary font-bold' : ''}`}>
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4">Price Range</h3>
                        <div className="flex items-center gap-2">
                            <Input placeholder="Min" type="number" className="h-8" />
                            <span>-</span>
                            <Input placeholder="Max" type="number" className="h-8" />
                        </div>
                        <Button size="sm" className="w-full mt-2" variant="outline">Apply</Button>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">{category ? category : "All Products"}</h1>
                        <div className="text-sm text-muted-foreground">
                            Showing {results?.length} results
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {status === "LoadingFirstPage" ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
                            ))
                        ) : results?.length === 0 ? (
                            <div className="col-span-full text-center py-12">No products found.</div>
                        ) : (
                            results?.map((product) => (
                                <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-square bg-muted relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            {product.imageUrls?.[0] ? (
                                                <img src={product.imageUrls[0]} alt={product.name} className="object-cover w-full h-full" />
                                            ) : (
                                                "No Image"
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                                        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                                        <div className="font-bold text-lg mb-4">R {product.price}</div>
                                        <Link href={`/shop/${product._id}`}>
                                            <Button className="w-full">View Details</Button>
                                        </Link>
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
