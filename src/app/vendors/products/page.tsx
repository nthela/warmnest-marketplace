"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function VendorProductsPage() {
    const products = useQuery(api.vendors.getProducts);
    const categories = useQuery(api.siteSettings.getCategories);
    const deleteProduct = useMutation(api.vendors.deleteProduct);

    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
    const [sortBy, setSortBy] = useState<"newest" | "name" | "price" | "stock">("newest");

    const filtered = (products ?? []).filter((p) => {
        if (search) {
            const q = search.toLowerCase();
            if (!p.name.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) return false;
        }
        if (catFilter && p.category !== catFilter) return false;
        if (statusFilter === "active" && !p.isActive) return false;
        if (statusFilter === "inactive" && p.isActive) return false;
        return true;
    }).sort((a, b) => {
        switch (sortBy) {
            case "name": return a.name.localeCompare(b.name);
            case "price": return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
            case "stock": return a.stock - b.stock;
            default: return 0;
        }
    });

    async function handleDelete(productId: Id<"products">, name: string) {
        if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            try {
                await deleteProduct({ productId });
            } catch (error) {
                console.error(error);
                alert("Failed to delete product.");
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Products</h1>
                    <Link href="/vendors/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        value={catFilter}
                        onChange={(e) => setCatFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                        <option value="">All Categories</option>
                        {(categories ?? []).map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "" | "active" | "inactive")}
                        className="border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "newest" | "name" | "price" | "stock")}
                        className="border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                        <option value="newest">Newest</option>
                        <option value="name">Name A–Z</option>
                        <option value="price">Price Low–High</option>
                        <option value="stock">Stock Low–High</option>
                    </select>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

                <div className="bg-white rounded-lg shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products === undefined ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        {products.length === 0 ? (
                                            <>
                                                <p className="text-muted-foreground mb-4">No products found.</p>
                                                <Link href="/vendors/products/new">
                                                    <Button variant="outline">Create your first product</Button>
                                                </Link>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">No products match your filters.</p>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            {product.salePrice ? (
                                                <span>
                                                    <span className="text-red-600 font-medium">R {product.salePrice}</span>
                                                    <span className="text-xs text-muted-foreground line-through ml-1">R {product.price}</span>
                                                </span>
                                            ) : (
                                                `R ${product.price}`
                                            )}
                                        </TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-medium ${product.isActive ? "text-green-600" : "text-red-500"}`}>
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/vendors/products/${product._id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(product._id, product.name)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
