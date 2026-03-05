"use client";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Check, Flame, Tag, Clock, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCart } from "@/contexts/cart-context";
import { ProductImageCarousel } from "@/components/ui/product-image-carousel";
import { useState, useEffect, useMemo } from "react";
import {
    getRecentlyViewedIds,
    getTopCategories,
    getLastViewedCategory,
} from "@/lib/browsing-history";

// Reusable product card for all swipeable rows
function ProductCard({
    product,
    addedId,
    onAddToCart,
}: {
    product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] };
    addedId: string | null;
    onAddToCart: (product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] }) => void;
}) {
    return (
        <Card className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start overflow-hidden group hover:shadow-lg transition-shadow">
            <Link href={`/shop/${product._id}`}>
                <div className="aspect-square bg-muted relative">
                    <ProductImageCarousel images={product.imageUrls ?? []} alt={product.name} />
                </div>
            </Link>
            <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                    {product.salePrice ? (
                        <>
                            <span className="font-bold text-base text-red-600">R {product.salePrice}</span>
                            <span className="text-xs text-muted-foreground line-through">R {product.price}</span>
                        </>
                    ) : (
                        <span className="font-bold text-base">R {product.price}</span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Link href={`/shop/${product._id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">View</Button>
                    </Link>
                    <Button size="sm" className="flex-1" onClick={() => onAddToCart(product)}>
                        {addedId === product._id ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <><ShoppingCart className="h-4 w-4 mr-1" /> Add</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Swipeable product row section
function ProductRow({
    title,
    icon,
    products,
    addedId,
    onAddToCart,
    linkHref,
    bg,
}: {
    title: string;
    icon?: React.ReactNode;
    products: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] }[];
    addedId: string | null;
    onAddToCart: (product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] }) => void;
    linkHref?: string;
    bg?: string;
}) {
    if (products.length === 0) return null;
    return (
        <section className={bg ?? "bg-slate-50"}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {icon}
                        {title}
                    </h2>
                    {linkHref && (
                        <Link href={linkHref} className="text-primary hover:underline flex items-center gap-1 text-sm">
                            View All <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} addedId={addedId} onAddToCart={onAddToCart} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Home() {
    const productsByCategory = useQuery(api.products.byCategories);
    const heroBanner = useQuery(api.siteSettings.getHeroBanner);
    const homepageText = useQuery(api.siteSettings.getHomepageText);
    const categories = useQuery(api.siteSettings.getCategories);
    const categoryImages = useQuery(api.siteSettings.getCategoryImages);
    const { addItem } = useCart();
    const [addedId, setAddedId] = useState<string | null>(null);

    // Browsing history state (client-side only)
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const [topCategories, setTopCategories] = useState<string[]>([]);
    const [lastCategory, setLastCategory] = useState<string | null>(null);

    useEffect(() => {
        setRecentIds(getRecentlyViewedIds(12));
        setTopCategories(getTopCategories(2));
        setLastCategory(getLastViewedCategory());
    }, []);

    // Personalized queries
    const recentlyViewed = useQuery(
        api.products.getByIds,
        recentIds.length > 0 ? { ids: recentIds } : "skip"
    );
    const dealsProducts = useQuery(api.products.deals);
    const newestProducts = useQuery(api.products.newest);
    const popularInCategory = useQuery(
        api.products.byCategory,
        lastCategory ? { category: lastCategory, limit: 12 } : "skip"
    );
    const newInCategory = useQuery(
        api.products.byCategory,
        topCategories[1] ? { category: topCategories[1], limit: 12 } : "skip"
    );

    // Sort recently viewed to match the order of recentIds
    const sortedRecentlyViewed = useMemo(() => {
        if (!recentlyViewed) return [];
        const map = new Map(recentlyViewed.map((p) => [p._id, p]));
        return recentIds.map((id) => map.get(id as any)).filter(Boolean) as typeof recentlyViewed;
    }, [recentlyViewed, recentIds]);

    const handleAddToCart = (product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] }) => {
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
                    {heroBanner && <div className="absolute inset-0 bg-black/50" />}
                    {!heroBanner && (
                        <>
                            <div className="absolute inset-0 bg-primary/10" />
                            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        </>
                    )}
                    <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                        <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-6 ${heroBanner ? "text-white" : "text-foreground"}`}>
                            {homepageText?.heroTitle ?? "Discover Unique Products from"}{" "}
                            <span className={heroBanner ? "text-yellow-300" : "text-primary"}>
                                {homepageText?.heroHighlight ?? "Trusted Vendors"}
                            </span>
                        </h1>
                        <p className={`text-lg md:text-xl max-w-2xl mb-8 ${heroBanner ? "text-white/90" : "text-muted-foreground"}`}>
                            {homepageText?.heroSubtitle ?? "WarmNest is South Africa\u2019s premier marketplace connecting you with the best local sellers. Shop fashion, home decor, electronics, and more."}
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

                {/* ══════ PERSONALIZED SECTIONS ══════ */}

                {/* Pick Up Where You Left Off — recently viewed products */}
                {sortedRecentlyViewed.length > 0 && (
                    <ProductRow
                        title="Pick Up Where You Left Off"
                        icon={<Clock className="h-5 w-5 text-muted-foreground" />}
                        products={sortedRecentlyViewed}
                        addedId={addedId}
                        onAddToCart={handleAddToCart}
                        bg="bg-white"
                    />
                )}

                {/* Popular in Your Recent Category */}
                {lastCategory && popularInCategory && popularInCategory.length > 0 && (
                    <ProductRow
                        title={`Popular in ${lastCategory}`}
                        icon={<Flame className="h-5 w-5 text-orange-500" />}
                        products={popularInCategory}
                        addedId={addedId}
                        onAddToCart={handleAddToCart}
                        linkHref={`/shop?category=${lastCategory}`}
                        bg="bg-slate-50"
                    />
                )}

                {/* MORE Deals For You — products on sale */}
                {dealsProducts && dealsProducts.length > 0 && (
                    <ProductRow
                        title="MORE Deals For You"
                        icon={<Tag className="h-5 w-5 text-red-500" />}
                        products={dealsProducts}
                        addedId={addedId}
                        onAddToCart={handleAddToCart}
                        linkHref="/shop"
                        bg="bg-white"
                    />
                )}

                {/* Discover What's Hot — newest products */}
                {newestProducts && newestProducts.length > 0 && (
                    <ProductRow
                        title="Discover What's Hot"
                        icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
                        products={newestProducts}
                        addedId={addedId}
                        onAddToCart={handleAddToCart}
                        linkHref="/shop"
                        bg="bg-slate-50"
                    />
                )}

                {/* New In (Category) — second most-browsed category */}
                {topCategories[1] && newInCategory && newInCategory.length > 0 && (
                    <ProductRow
                        title={`New in ${topCategories[1]}`}
                        icon={<Sparkles className="h-5 w-5 text-primary" />}
                        products={newInCategory}
                        addedId={addedId}
                        onAddToCart={handleAddToCart}
                        linkHref={`/shop?category=${topCategories[1]}`}
                        bg="bg-white"
                    />
                )}

                {/* ══════ ALL CATEGORIES (product rows) ══════ */}

                {/* Products by Category — swipeable rows */}
                {productsByCategory === undefined ? (
                    <section className="py-12 container mx-auto px-4">
                        <div className="space-y-10">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i}>
                                    <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-4" />
                                    <div className="flex gap-4 overflow-hidden">
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <div key={j} className="w-[160px] sm:w-[200px] h-72 sm:h-80 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : productsByCategory.length === 0 ? (
                    <section className="py-16 bg-white">
                        <div className="container mx-auto px-4 text-center py-8 text-muted-foreground">
                            No products yet. Check back soon!
                        </div>
                    </section>
                ) : (
                    productsByCategory.map((group, i) => (
                        <ProductRow
                            key={group.category}
                            title={group.category}
                            products={group.products}
                            addedId={addedId}
                            onAddToCart={handleAddToCart}
                            linkHref={`/shop?category=${group.category}`}
                            bg={i % 2 === 0 ? "bg-slate-50" : "bg-white"}
                        />
                    ))
                )}

                {/* Categories Section */}
                <section className="py-16 container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Shop by Category</h2>
                        <Link href="/shop" className="text-primary hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {(categories ?? []).map((category) => {
                            const imgUrl = categoryImages?.[category];
                            return (
                                <Link key={category} href={`/shop?category=${category}`} className="group">
                                    <Card className="relative h-40 md:h-44 overflow-hidden border-none shadow-sm cursor-pointer">
                                        {imgUrl ? (
                                            <>
                                                <img
                                                    src={imgUrl}
                                                    alt={category}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                                <span className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm md:text-base drop-shadow-lg">
                                                    {category}
                                                </span>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-card group-hover:bg-accent/50 transition-colors">
                                                <span className="font-medium text-foreground group-hover:text-primary transition-colors">{category}</span>
                                            </div>
                                        )}
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Vendor Waitlist CTA */}
                <section className="py-20 bg-primary/95 text-primary-foreground">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            {homepageText?.ctaTitle ?? "Want to Sell on WarmNest?"}
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
                            {homepageText?.ctaSubtitle ?? "We\u2019re onboarding our first sellers. Join the waitlist to get early access, reduced commission rates, and priority support when we launch."}
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
