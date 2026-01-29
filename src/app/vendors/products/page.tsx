"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function VendorProductsPage() {
    const products = useQuery(api.vendors.getProducts);

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Products</h1>
                    <Link href="/vendors/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

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
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No products found.</p>
                                        <Link href="/vendors/products/new">
                                            <Button variant="outline">Create your first product</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>R {product.price}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>{product.isActive ? "Active" : "Inactive"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Edit</Button>
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
