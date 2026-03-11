"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Package, ShoppingBag, DollarSign, TrendingUp, TrendingDown, Minus,
    Star, AlertTriangle, BarChart3, MapPin, CheckCircle2
} from "lucide-react";

function ChangeBadge({ value }: { value: number }) {
    if (value > 0) return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600"><TrendingUp className="h-3 w-3" />+{value}%</span>;
    if (value < 0) return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500"><TrendingDown className="h-3 w-3" />{value}%</span>;
    return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground"><Minus className="h-3 w-3" />0%</span>;
}

function PickupAddressCard({ vendor }: { vendor: { collectionAddress?: { street: string; city: string; code: string; country?: string } | null; shiprazorWarehouseId?: string | null } }) {
    const updateAddress = useMutation(api.vendors.updateCollectionAddress);
    const [street, setStreet] = useState(vendor.collectionAddress?.street ?? "");
    const [city, setCity] = useState(vendor.collectionAddress?.city ?? "");
    const [code, setCode] = useState(vendor.collectionAddress?.code ?? "");
    const [warehouseId, setWarehouseId] = useState(vendor.shiprazorWarehouseId ?? "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setStreet(vendor.collectionAddress?.street ?? "");
        setCity(vendor.collectionAddress?.city ?? "");
        setCode(vendor.collectionAddress?.code ?? "");
        setWarehouseId(vendor.shiprazorWarehouseId ?? "");
    }, [vendor.collectionAddress?.street, vendor.collectionAddress?.city, vendor.collectionAddress?.code, vendor.shiprazorWarehouseId]);

    async function handleSave() {
        if (!street.trim() || !city.trim() || !code.trim()) return;
        setSaving(true);
        try {
            await updateAddress({
                street: street.trim(),
                city: city.trim(),
                code: code.trim(),
                shiprazorWarehouseId: warehouseId.trim() || undefined,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card className="mb-8">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Pickup / Collection Address
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    This is where couriers will collect parcels. Each vendor has their own pickup point.
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3 space-y-1">
                        <Label htmlFor="col-street" className="text-xs">Street Address</Label>
                        <Input
                            id="col-street"
                            placeholder="e.g. 12 Main Road, Sandton"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="col-city" className="text-xs">City</Label>
                        <Input
                            id="col-city"
                            placeholder="e.g. Johannesburg"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="col-code" className="text-xs">Postal Code</Label>
                        <Input
                            id="col-code"
                            placeholder="e.g. 2196"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="col-warehouse" className="text-xs">ShipRazor Warehouse ID</Label>
                        <Input
                            id="col-warehouse"
                            placeholder="e.g. 65bb7a21bbea..."
                            value={warehouseId}
                            onChange={(e) => setWarehouseId(e.target.value)}
                        />
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving || !street.trim() || !city.trim() || !code.trim()}
                    className="w-full md:w-auto"
                >
                    {saving ? "Saving…" : saved ? (
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Saved</span>
                    ) : "Save Address & Warehouse"}
                </Button>
                {vendor.collectionAddress && (
                    <p className="text-xs text-muted-foreground">
                        Current: {vendor.collectionAddress.street}, {vendor.collectionAddress.city}, {vendor.collectionAddress.code}, ZA
                        {vendor.shiprazorWarehouseId && <> · Warehouse: {vendor.shiprazorWarehouseId}</>}
                    </p>
                )}
                {!vendor.collectionAddress && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No pickup address set — couriers won&apos;t know where to collect.
                    </p>
                )}
                {vendor.collectionAddress && !vendor.shiprazorWarehouseId && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No ShipRazor Warehouse ID — create one at shiprazor.com → Settings → Warehouse, then paste the ID here.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function VendorDashboard() {
    const vendor = useQuery(api.vendors.getCurrentVendor);
    const stats = useQuery(api.analytics.getVendorStats);

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

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R {stats ? stats.totalRevenue.toFixed(2) : "0.00"}</div>
                            {stats && <div className="mt-1"><ChangeBadge value={stats.revenueChange} /> <span className="text-xs text-muted-foreground">vs last month</span></div>}
                            {stats && <p className="text-xs text-muted-foreground mt-1">After {(stats.commissionRate * 100).toFixed(0)}% commission</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
                            {stats && <div className="mt-1"><ChangeBadge value={stats.ordersChange} /> <span className="text-xs text-muted-foreground">vs last month</span></div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalItemsSold ?? 0}</div>
                            {stats && <div className="mt-1"><ChangeBadge value={stats.itemsChange} /> <span className="text-xs text-muted-foreground">vs last month</span></div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.activeProducts ?? 0}</div>
                            <p className="text-xs text-muted-foreground">{stats?.totalProducts ?? 0} total</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Review score */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{stats.avgRating || "—"}</span>
                                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm text-muted-foreground">({stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""})</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Low stock alerts */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    {stats.lowStock.length > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                    Stock Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.lowStock.length > 0 ? (
                                    <div className="space-y-1">
                                        {stats.lowStock.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="truncate">{p.name}</span>
                                                <span className={`font-medium ${p.stock === 0 ? "text-red-500" : "text-yellow-600"}`}>
                                                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">All products well-stocked.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Monthly Revenue Chart */}
                {stats && stats.monthlyRevenue.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-base">Monthly Revenue (6 months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(() => {
                                    const max = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1);
                                    return stats.monthlyRevenue.map((m, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm">
                                            <span className="w-20 text-right text-muted-foreground">{m.month}</span>
                                            <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                                                <div className="h-full bg-primary/70 rounded" style={{ width: `${(m.revenue / max) * 100}%` }} />
                                            </div>
                                            <span className="w-24 text-right font-medium">R {m.revenue.toFixed(0)}</span>
                                            <span className="w-16 text-right text-muted-foreground">{m.orders} order{m.orders !== 1 ? "s" : ""}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Top Products */}
                {stats && stats.topProducts.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-base">Top Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm truncate flex-1">{p.name}</span>
                                        <div className="text-right ml-4">
                                            <span className="text-sm font-medium">{p.quantity} sold</span>
                                            <span className="text-xs text-muted-foreground ml-2">R {p.revenue.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <PickupAddressCard vendor={vendor} />

                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <Link href="/vendors/products">
                        <Button variant="outline">Manage Products</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
