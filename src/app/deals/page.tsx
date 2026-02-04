"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tag } from "lucide-react";

export default function DealsPage() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.products.list,
        {},
        { initialNumItems: 12 }
    );

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            {/* Deals Banner */}
            <section className="bg-primary/10 py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Tag className="h-6 w-6 text-primary" />
                        <h1 className="text-3xl md:text-4xl font-extrabold">Daily Deals</h1>
                    </div>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Discover great prices on top products. New deals added regularly — don&apos;t miss out!
                    </p>
                </div>
            </section>

            {/* Product Grid */}
            <main className="flex-1 container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {status === "LoadingFirstPage" ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
                        ))
                    ) : results?.length === 0 ? (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            No deals available right now. Check back soon!
                        </div>
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
                        <Button onClick={() => loadMore(12)} variant="outline">Load More Deals</Button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
