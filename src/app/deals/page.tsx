"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/cart-context";
import {
    Tag,
    ShoppingCart,
    Check,
    Search,
    SlidersHorizontal,
    ArrowRight,
    Clock,
    Flame,
    Sparkles,
    ChevronDown,
    X,
} from "lucide-react";
import { ProductImageCarousel } from "@/components/ui/product-image-carousel";
import {
    getRecentlyViewedIds,
    getLastViewedCategory,
} from "@/lib/browsing-history";

// Reusable product card — same sizing as homepage
function ProductCard({
    product,
    addedId,
    onAddToCart,
}: {
    product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[]; category?: string };
    addedId: string | null;
    onAddToCart: (product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] }) => void;
}) {
    const discount = product.salePrice && product.price > 0
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : null;

    return (
        <Card className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start overflow-hidden group hover:shadow-lg transition-shadow relative">
            {discount && (
                <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{discount}%
                </span>
            )}
            <Link href={`/shop/${product._id}`}>
                <div className="aspect-square bg-muted relative">
                    <ProductImageCarousel images={product.imageUrls ?? []} alt={product.name} />
                </div>
            </Link>
            <CardContent className="p-3">
                {product.category && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{product.category}</span>
                )}
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

// Swipeable product row
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
    products: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[]; category?: string }[];
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

type SortOption = "newest" | "price-low" | "price-high" | "discount";

export default function DealsPage() {
    const dealsProducts = useQuery(api.products.deals);
    const newestProducts = useQuery(api.products.newest);
    const categories = useQuery(api.siteSettings.getCategories);
    const { addItem } = useCart();
    const [addedId, setAddedId] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [showFilters, setShowFilters] = useState(false);

    // Browsing history
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const [lastCategory, setLastCategory] = useState<string | null>(null);

    useEffect(() => {
        setRecentIds(getRecentlyViewedIds(12));
        setLastCategory(getLastViewedCategory());
    }, []);

    const recentlyViewed = useQuery(
        api.products.getByIds,
        recentIds.length > 0 ? { ids: recentIds } : "skip"
    );
    const popularInCategory = useQuery(
        api.products.byCategory,
        lastCategory ? { category: lastCategory, limit: 12 } : "skip"
    );

    const sortedRecentlyViewed = useMemo(() => {
        if (!recentlyViewed) return [];
        const map = new Map(recentlyViewed.map((p) => [p._id, p]));
        return recentIds.map((id) => map.get(id as any)).filter(Boolean) as typeof recentlyViewed;
    }, [recentlyViewed, recentIds]);

    // Filter and sort deals
    const filteredDeals = useMemo(() => {
        if (!dealsProducts) return [];
        let filtered = [...dealsProducts];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
            );
        }

        // Category
        if (selectedCategory) {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        // Price range
        const min = minPrice ? Number(minPrice) : null;
        const max = maxPrice ? Number(maxPrice) : null;
        if (min !== null) filtered = filtered.filter((p) => (p.salePrice ?? p.price) >= min);
        if (max !== null) filtered = filtered.filter((p) => (p.salePrice ?? p.price) <= max);

        // Sort
        switch (sort) {
            case "price-low":
                filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
                break;
            case "price-high":
                filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
                break;
            case "discount":
                filtered.sort((a, b) => {
                    const dA = a.salePrice ? ((a.price - a.salePrice) / a.price) : 0;
                    const dB = b.salePrice ? ((b.price - b.salePrice) / b.price) : 0;
                    return dB - dA;
                });
                break;
            case "newest":
            default:
                break;
        }

        return filtered;
    }, [dealsProducts, searchQuery, selectedCategory, minPrice, maxPrice, sort]);

    // Get unique categories from deals
    const dealCategories = useMemo(() => {
        if (!dealsProducts) return [];
        const cats = new Set(dealsProducts.map((p) => p.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [dealsProducts]);

    const activeFilterCount = [selectedCategory, minPrice, maxPrice].filter(Boolean).length;

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory(null);
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");
    };

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

            {/* Deals Banner */}
            <section className="bg-gradient-to-r from-red-500 to-orange-500 py-10 md:py-14">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Tag className="h-7 w-7 text-white" />
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Daily Deals</h1>
                    </div>
                    <p className="text-white/90 max-w-xl mx-auto mb-6">
                        Discover great prices on top products. New deals added regularly — don&apos;t miss out!
                    </p>

                    {/* Search bar in banner */}
                    <div className="max-w-lg mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search deals..."
                            className="pl-10 pr-4 h-11 bg-white border-0 shadow-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* ══════ ALL DEALS WITH FILTERS ══════ */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <h2 className="text-xl font-bold mr-auto">All Deals</h2>

                        {/* Sort dropdown */}
                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortOption)}
                                className="appearance-none bg-white border rounded-lg pl-3 pr-8 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="discount">Biggest Discount</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Filter toggle */}
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-1.5"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 bg-primary-foreground text-primary rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>

                        {activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 gap-1">
                                <X className="h-3.5 w-3.5" /> Clear all
                            </Button>
                        )}
                    </div>

                    {/* Expandable filter panel */}
                    {showFilters && (
                        <div className="bg-white rounded-lg border p-4 mb-6 space-y-4 md:flex md:gap-6 md:space-y-0">
                            {/* Category pills */}
                            <div className="flex-1">
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                            !selectedCategory
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white hover:bg-muted border-gray-200"
                                        }`}
                                    >
                                        All
                                    </button>
                                    {(dealCategories.length > 0 ? dealCategories : categories ?? []).map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                                selectedCategory === cat
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-white hover:bg-muted border-gray-200"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price range */}
                            <div className="md:w-64">
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Price Range (R)</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Min"
                                        type="number"
                                        className="h-9"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span className="text-muted-foreground">–</span>
                                    <Input
                                        placeholder="Max"
                                        type="number"
                                        className="h-9"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active filter chips */}
                    {(selectedCategory || searchQuery) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                    &quot;{searchQuery}&quot;
                                    <button onClick={() => setSearchQuery("")} className="hover:text-primary/70">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                    {selectedCategory}
                                    <button onClick={() => setSelectedCategory(null)} className="hover:text-primary/70">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Results count */}
                    <p className="text-sm text-muted-foreground mb-4">
                        {dealsProducts === undefined
                            ? "Loading deals..."
                            : `${filteredDeals.length} deal${filteredDeals.length !== 1 ? "s" : ""} found`}
                    </p>

                    {/* Deals grid */}
                    <div className="flex flex-wrap gap-4">
                        {dealsProducts === undefined ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="w-[160px] sm:w-[200px] h-72 sm:h-80 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />
                            ))
                        ) : filteredDeals.length === 0 ? (
                            <div className="w-full text-center py-16 text-muted-foreground">
                                No deals match your filters. Try adjusting your search or filters.
                            </div>
                        ) : (
                            filteredDeals.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    addedId={addedId}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ══════ PERSONALIZED SECTIONS ══════ */}

            {/* Pick Up Where You Left Off */}
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

            {/* Discover What's Hot */}
            {newestProducts && newestProducts.length > 0 && (
                <ProductRow
                    title="Discover What's Hot"
                    icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
                    products={newestProducts}
                    addedId={addedId}
                    onAddToCart={handleAddToCart}
                    bg="bg-white"
                />
            )}

            <Footer />
        </div>
    );
}
