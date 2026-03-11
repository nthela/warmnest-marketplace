"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/cart-context";
import {
    ShoppingCart,
    Check,
    ArrowRight,
    Clock,
    Flame,
    Tag,
    Sparkles,
    SlidersHorizontal,
    ChevronDown,
    X,
    Search,
} from "lucide-react";
import { ProductImageCarousel } from "@/components/ui/product-image-carousel";
import { ProductRating } from "@/components/ui/product-rating";
import {
    getRecentlyViewedIds,
    getTopCategories,
    getLastViewedCategory,
} from "@/lib/browsing-history";
import { Id } from "../../../convex/_generated/dataModel";

// Reusable product card — same sizing as homepage
function ProductCard({
    product,
    addedId,
    onAddToCart,
}: {
    product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[]; category?: string; stock?: number };
    addedId: string | null;
    onAddToCart: (product: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[] }) => void;
}) {
    const stock = product.stock ?? Infinity;
    const isOutOfStock = stock <= 0;
    return (
        <Card className={`w-[160px] sm:w-[200px] flex-shrink-0 snap-start overflow-hidden group transition-shadow ${isOutOfStock ? "opacity-50 grayscale" : "hover:shadow-lg"}`}>
            <Link href={`/shop/${product._id}`}>
                <div className="aspect-square bg-muted relative">
                    <ProductImageCarousel images={product.imageUrls ?? []} alt={product.name} />
                    {isOutOfStock && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            Out of Stock
                        </span>
                    )}
                    {!isOutOfStock && stock < 10 && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Only {stock} left
                        </span>
                    )}
                </div>
            </Link>
            <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                <ProductRating productId={product._id as Id<"products">} />
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
                    <Button size="sm" className="flex-1" disabled={isOutOfStock} onClick={() => !isOutOfStock && onAddToCart(product)}>
                        {isOutOfStock ? (
                            "Sold Out"
                        ) : addedId === product._id ? (
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
    products: { _id: string; name: string; price: number; salePrice?: number; imageUrls?: string[]; stock?: number }[];
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

type SortOption = "newest" | "price-low" | "price-high" | "name-az" | "name-za";

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addItem } = useCart();

    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const categories = useQuery(api.siteSettings.getCategories);

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [showFilters, setShowFilters] = useState(false);
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

    const sortedRecentlyViewed = useMemo(() => {
        if (!recentlyViewed) return [];
        const map = new Map(recentlyViewed.map((p) => [p._id, p]));
        return recentIds.map((id) => map.get(id as any)).filter(Boolean) as typeof recentlyViewed;
    }, [recentlyViewed, recentIds]);

    const { results, status, loadMore } = usePaginatedQuery(
        api.products.list,
        { category, search },
        { initialNumItems: 20 }
    );

    // Apply client-side price filtering + sorting
    const filteredResults = useMemo(() => {
        if (!results) return [];
        let filtered = [...results];

        // Price filter
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
            case "name-az":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-za":
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "newest":
            default:
                break;
        }

        return filtered;
    }, [results, minPrice, maxPrice, sort]);

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

    const clearAllFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");
        router.push("/shop");
    };

    const title = search
        ? `Results for "${search}"`
        : category
            ? category
            : "All Products";

    const showPersonalized = !category && !search;
    const activeFilterCount = [category, search, minPrice, maxPrice].filter(Boolean).length;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            {/* ══════ PERSONALIZED SECTIONS ══════ */}
            {showPersonalized && (
                <>
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

                    {dealsProducts && dealsProducts.length > 0 && (
                        <ProductRow
                            title="MORE Deals For You"
                            icon={<Tag className="h-5 w-5 text-red-500" />}
                            products={dealsProducts}
                            addedId={addedId}
                            onAddToCart={handleAddToCart}
                            bg="bg-white"
                        />
                    )}

                    {newestProducts && newestProducts.length > 0 && (
                        <ProductRow
                            title="Discover What's Hot"
                            icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
                            products={newestProducts}
                            addedId={addedId}
                            onAddToCart={handleAddToCart}
                            bg="bg-slate-50"
                        />
                    )}

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
                </>
            )}

            {/* ══════ MAIN SHOP CONTENT ══════ */}
            <div className="container mx-auto px-4 py-8 flex-1">

                {/* Title + Controls bar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <h1 className="text-2xl font-bold mr-auto">{title}</h1>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="appearance-none bg-white border rounded-lg pl-3 pr-8 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-az">Name: A–Z</option>
                            <option value="name-za">Name: Z–A</option>
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
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-500 gap-1">
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
                                <Link
                                    href={search ? `/shop?search=${search}` : "/shop"}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                        !category
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-white hover:bg-muted border-gray-200"
                                    }`}
                                >
                                    All
                                </Link>
                                {(categories ?? []).map((cat) => (
                                    <Link
                                        key={cat}
                                        href={search ? `/shop?category=${cat}&search=${search}` : `/shop?category=${cat}`}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                            category === cat
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white hover:bg-muted border-gray-200"
                                        }`}
                                    >
                                        {cat}
                                    </Link>
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
                {(category || search || minPrice || maxPrice) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {search && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                <Search className="h-3 w-3" />
                                &quot;{search}&quot;
                                <button onClick={() => router.push(category ? `/shop?category=${category}` : "/shop")} className="hover:text-primary/70">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {category && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                {category}
                                <button onClick={() => router.push(search ? `/shop?search=${search}` : "/shop")} className="hover:text-primary/70">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {minPrice && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                Min: R{minPrice}
                                <button onClick={() => setMinPrice("")} className="hover:text-primary/70">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {maxPrice && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                Max: R{maxPrice}
                                <button onClick={() => setMaxPrice("")} className="hover:text-primary/70">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results count */}
                <p className="text-sm text-muted-foreground mb-4">
                    {status === "LoadingFirstPage"
                        ? "Loading..."
                        : `Showing ${filteredResults.length} product${filteredResults.length !== 1 ? "s" : ""}`}
                </p>

                {/* Product Grid */}
                <div className="flex flex-wrap gap-4">
                    {status === "LoadingFirstPage" ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="w-[160px] sm:w-[200px] h-72 sm:h-80 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />
                        ))
                    ) : filteredResults.length === 0 ? (
                        <div className="w-full text-center py-16">
                            <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                            <Button variant="outline" onClick={clearAllFilters}>Clear all filters</Button>
                        </div>
                    ) : (
                        filteredResults.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                addedId={addedId}
                                onAddToCart={handleAddToCart}
                            />
                        ))
                    )}
                </div>

                {status === "CanLoadMore" && (
                    <div className="mt-8 text-center">
                        <Button onClick={() => loadMore(20)} variant="outline">Load More</Button>
                    </div>
                )}
            </div>

            <Footer />
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
