"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign } from "lucide-react";

export default function VendorDashboard() {
    const vendor = useQuery(api.vendors.getCurrentVendor);

    if (vendor === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (vendor === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>You are not a registered vendor.</p>
                <Link href="/vendors/register">
                    <Button>Register Now</Button>
                </Link>
            </div>
        );
    }

    if (vendor.status === "pending") {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="container mx-auto px-4 py-12">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Under Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Your application for <strong>{vendor.storeName}</strong> is correctly being reviewed by our team. Please check back later.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Vendor Dashboard: <span className="text-primary">{vendor.storeName}</span></h1>
                    <Link href="/vendors/products/new">
                        <Button>+ Add New Product</Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R 0.00</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">+0 from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <Link href="/vendors/products">
                        <Button variant="outline">Manage Products</Button>
                    </Link>
                    <Button variant="outline">View Orders</Button>
                    <Button variant="outline">Store Settings</Button>
                </div>
            </div>
        </div>
    );
}
