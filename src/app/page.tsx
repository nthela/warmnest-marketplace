"use client";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Check } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCart } from "@/contexts/cart-context";
import { ProductImageCarousel } from "@/components/ui/product-image-carousel";
import { useState } from "react";

export default function Home() {
    const products = useQuery(api.products.featured);
    const heroBanner = useQuery(api.siteSettings.getHeroBanner);
    const { addItem } = useCart();
    const [addedId, setAddedId] = useState<string | null>(null);

    const handleAddToCart = (product: NonNullable<typeof products>[number]) => {
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section
                    className="relative py-20 lg:py-32 overflow-hidden bg-cover bg-center"
                    style={heroBanner ? { backgroundImage: `url(${heroBanner})` } : undefined}
                >
                    {/* Dark overlay when banner is present for text readability */}
                    {heroBanner && <div className="absolute inset-0 bg-black/50" />}
                    {/* Fallback gradient blobs when no banner */}
                    {!heroBanner && (
                        <>
                            <div className="absolute inset-0 bg-primary/10" />
                            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        </>
                    )}
                    <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                        <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-6 ${heroBanner ? "text-white" : "text-foreground"}`}>
                            Discover Unique Products from <span className={heroBanner ? "text-yellow-300" : "text-primary"}>Trusted Vendors</span>
                        </h1>
                        <p className={`text-lg md:text-xl max-w-2xl mb-8 ${heroBanner ? "text-white/90" : "text-muted-foreground"}`}>
                            WarmNest is South Africa&apos;s premier marketplace connecting you with the best local sellers. Shop fashion, home decor, electronics, and more.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/shop">
                                <Button size="lg" className="h-12 px-8 text-base">
                                    Start Shopping
                                </Button>
                            </Link>
                            <Link href="/vendors/register#waitlist-form">
                                <Button size="lg" variant={heroBanner ? "secondary" : "outline"} className="h-12 px-8 text-base">
                                    Become a Seller
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="py-16 container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Shop by Category</h2>
                        <Link href="/shop" className="text-primary hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"].map((category) => (
                            <Link key={category} href={`/shop?category=${category}`} className="group">
                                <Card className="h-32 flex items-center justify-center bg-card hover:bg-accent/50 transition-colors cursor-pointer border-none shadow-sm">
                                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{category}</span>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Featured Products */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Featured Products</h2>
                            <Link href="/shop" className="text-primary hover:underline flex items-center gap-1">
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
                            {products === undefined ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="min-w-[72%] flex-shrink-0 snap-start sm:min-w-0 h-80 bg-gray-200 animate-pulse rounded-lg" />
                                ))
                            ) : products.length === 0 ? (
                                <div className="min-w-full text-center py-8 text-muted-foreground">
                                    No products yet. Check back soon!
                                </div>
                            ) : (
                                products.map((product) => (
                                    <Card key={product._id} className="min-w-[72%] flex-shrink-0 snap-start sm:min-w-0 overflow-hidden group hover:shadow-lg transition-shadow">
                                        <Link href={`/shop/${product._id}`}>
                                            <div className="aspect-square bg-muted relative">
                                                <ProductImageCarousel
                                                    images={product.imageUrls ?? []}
                                                    alt={product.name}
                                                />
                                            </div>
                                        </Link>
                                        <CardContent className="p-4">
                                            <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                                            <div className="flex items-center justify-between mb-3">
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
                    </div>
                </section>

                {/* Vendor Waitlist CTA */}
                <section className="py-20 bg-primary/95 text-primary-foreground">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4 text-white">Want to Sell on WarmNest?</h2>
                        <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
                            We&apos;re onboarding our first sellers. Join the waitlist to get early access, reduced commission rates, and priority support when we launch.
                        </p>
                        <Link href="/vendors/register#waitlist-form">
                            <Button variant="secondary" size="lg" className="h-12 px-8 text-primary font-bold">
                                Join the Waitlist
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
