"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import Link from "next/link";
import {
    LayoutDashboard, Users, Store, Package, ShoppingBag, ClipboardList,
    BarChart3, Trash2, Check, X, Eye, EyeOff, Sparkles, Settings, Upload, ImageIcon
} from "lucide-react";

type Tab = "overview" | "waitlist" | "users" | "vendors" | "products" | "orders" | "analytics" | "settings";

const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "completed", "cancelled"] as const;

export default function AdminDashboard() {
    const user = useQuery(api.users.currentUser);
    const [tab, setTab] = useState<Tab>("overview");

    if (user === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500 font-semibold">Access Denied. Admin only.</p>
            </div>
        );
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: "waitlist", label: "Waitlist", icon: <ClipboardList className="h-4 w-4" /> },
        { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
        { id: "vendors", label: "Vendors", icon: <Store className="h-4 w-4" /> },
        { id: "products", label: "Products", icon: <Package className="h-4 w-4" /> },
        { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
        { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-56 min-h-[calc(100vh-64px)] bg-white border-r p-4 space-y-1 hidden md:block">
                    <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-3">Admin Panel</h2>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                tab === t.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted"
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </aside>

                {/* Mobile tab bar */}
                <div className="md:hidden w-full overflow-x-auto border-b bg-white">
                    <div className="flex p-2 gap-1">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
                                    tab === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                                }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <main className="flex-1 p-6 max-w-6xl">
                    {tab === "overview" && <OverviewTab />}
                    {tab === "waitlist" && <WaitlistTab />}
                    {tab === "users" && <UsersTab />}
                    {tab === "vendors" && <VendorsTab />}
                    {tab === "products" && <ProductsTab />}
                    {tab === "orders" && <OrdersTab />}
                    {tab === "analytics" && <AnalyticsTab />}
                    {tab === "settings" && <SettingsTab />}
                </main>
            </div>
        </div>
    );
}

// ─── OVERVIEW ───────────────────────────────────────────────

function OverviewTab() {
    const stats = useQuery(api.admin.getStats);

    if (!stats) return <div>Loading stats...</div>;

    const cards = [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Active Vendors", value: stats.activeVendors },
        { label: "Pending Vendors", value: stats.pendingVendors },
        { label: "Total Products", value: stats.totalProducts },
        { label: "Total Orders", value: stats.totalOrders },
        { label: "Revenue", value: `R ${stats.totalRevenue.toFixed(2)}` },
        { label: "Waitlist", value: stats.waitlistCount },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <Card key={c.label}>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">{c.label}</p>
                            <p className="text-2xl font-bold">{c.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ─── WAITLIST ───────────────────────────────────────────────

function WaitlistTab() {
    const waitlist = useQuery(api.admin.getWaitlist);
    const removeFromWaitlist = useMutation(api.admin.removeFromWaitlist);
    const grantWish = useMutation(api.admin.grantWish);
    const [granting, setGranting] = useState<string | null>(null);

    async function handleGrantWish(waitlistId: Id<"vendorWaitlist">, name: string) {
        if (!confirm(`Grant wish for "${name}"? This will create an approved vendor account for them.`)) return;
        setGranting(waitlistId);
        try {
            await grantWish({ waitlistId });
            alert(`"${name}" is now an approved vendor!`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            alert(message);
        } finally {
            setGranting(null);
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Vendor Waitlist</h1>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {waitlist === undefined ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : waitlist.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No waitlist entries.</TableCell></TableRow>
                            ) : (
                                waitlist.map((entry) => (
                                    <TableRow key={entry._id}>
                                        <TableCell className="font-medium">{entry.name}</TableCell>
                                        <TableCell>{entry.email}</TableCell>
                                        <TableCell>{entry.location}</TableCell>
                                        <TableCell className="capitalize">{entry.businessType.replace("_", " ")}</TableCell>
                                        <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button
                                                size="sm"
                                                onClick={() => handleGrantWish(entry._id, entry.name)}
                                                disabled={granting === entry._id}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {granting === entry._id ? (
                                                    "Granting..."
                                                ) : (
                                                    <><Sparkles className="h-3 w-3 mr-1" /> Grant Wish</>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    if (confirm("Remove this entry?")) {
                                                        removeFromWaitlist({ waitlistId: entry._id });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── USERS ──────────────────────────────────────────────────

function UsersTab() {
    const users = useQuery(api.admin.getAllUsers);
    const updateRole = useMutation(api.admin.updateUserRole);
    const deleteUser = useMutation(api.admin.deleteUser);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users === undefined ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">No users.</TableCell></TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u._id}>
                                        <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                                        <TableCell>{u.email ?? "—"}</TableCell>
                                        <TableCell>
                                            <select
                                                value={u.role}
                                                onChange={(e) =>
                                                    updateRole({
                                                        userId: u._id,
                                                        role: e.target.value as "admin" | "vendor" | "customer",
                                                    })
                                                }
                                                className="text-sm border rounded px-2 py-1"
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="vendor">Vendor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    if (confirm(`Delete user "${u.name ?? u.email}"? This also deletes their vendor profile and products.`)) {
                                                        deleteUser({ userId: u._id });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── VENDORS ────────────────────────────────────────────────

function VendorsTab() {
    const vendors = useQuery(api.admin.getAllVendors);
    const approveVendor = useMutation(api.admin.approveVendor);
    const rejectVendor = useMutation(api.admin.rejectVendor);
    const deleteVendor = useMutation(api.admin.deleteVendor);
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

    const filtered = vendors?.filter((v) => filter === "all" || v.status === filter);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Vendor Management</h1>
                <div className="flex gap-1">
                    {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                        <Button
                            key={f}
                            size="sm"
                            variant={filter === f ? "default" : "outline"}
                            onClick={() => setFilter(f)}
                            className="capitalize text-xs"
                        >
                            {f}
                        </Button>
                    ))}
                </div>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered === undefined ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No vendors found.</TableCell></TableRow>
                            ) : (
                                filtered.map((v) => (
                                    <TableRow key={v._id}>
                                        <TableCell className="font-medium">{v.storeName}</TableCell>
                                        <TableCell>{v.ownerName}</TableCell>
                                        <TableCell>{v.ownerEmail}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                v.status === "approved" ? "bg-green-100 text-green-700" :
                                                v.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-red-100 text-red-700"
                                            }`}>
                                                {v.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{(v.commissionRate * 100).toFixed(0)}%</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            {v.status === "pending" && (
                                                <>
                                                    <Button size="sm" onClick={() => approveVendor({ vendorId: v._id })}>
                                                        <Check className="h-3 w-3 mr-1" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => rejectVendor({ vendorId: v._id })}>
                                                        <X className="h-3 w-3 mr-1" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    if (confirm(`Delete vendor "${v.storeName}" and all their products?`)) {
                                                        deleteVendor({ vendorId: v._id });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── PRODUCTS ───────────────────────────────────────────────

function ProductsTab() {
    const products = useQuery(api.admin.getAllProducts);
    const toggleActive = useMutation(api.admin.toggleProductActive);
    const deleteProduct = useMutation(api.admin.deleteProduct);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <Link href="/vendors/products/new">
                    <Button>+ Add Product</Button>
                </Link>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products === undefined ? (
                                <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
                            ) : products.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8">No products.</TableCell></TableRow>
                            ) : (
                                products.map((p) => (
                                    <TableRow key={p._id} className={!p.isActive ? "opacity-50" : ""}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.vendorName}</TableCell>
                                        <TableCell>
                                            {p.salePrice ? (
                                                <span>
                                                    <span className="text-red-600 font-medium">R {p.salePrice}</span>
                                                    <span className="text-xs text-muted-foreground line-through ml-1">R {p.price}</span>
                                                </span>
                                            ) : (
                                                `R ${p.price}`
                                            )}
                                        </TableCell>
                                        <TableCell>{p.stock}</TableCell>
                                        <TableCell>{p.category}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-medium ${p.isActive ? "text-green-600" : "text-red-500"}`}>
                                                {p.isActive ? "Yes" : "No"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleActive({ productId: p._id })}
                                            >
                                                {p.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    if (confirm(`Delete "${p.name}"?`)) {
                                                        deleteProduct({ productId: p._id });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── ORDERS ─────────────────────────────────────────────────

function OrdersTab() {
    const orders = useQuery(api.admin.getAllOrders);
    const updateStatus = useMutation(api.admin.updateOrderStatus);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Order Management</h1>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders === undefined ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No orders.</TableCell></TableRow>
                            ) : (
                                orders.map((o) => (
                                    <TableRow key={o._id}>
                                        <TableCell className="font-mono text-xs">{o._id.slice(-8)}</TableCell>
                                        <TableCell>
                                            <div>{o.customerName}</div>
                                            <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                                        </TableCell>
                                        <TableCell className="font-medium">R {o.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                o.status === "completed" ? "bg-green-100 text-green-700" :
                                                o.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {o.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <select
                                                value={o.status}
                                                onChange={(e) =>
                                                    updateStatus({
                                                        orderId: o._id,
                                                        status: e.target.value as (typeof ORDER_STATUSES)[number],
                                                    })
                                                }
                                                className="text-xs border rounded px-2 py-1"
                                            >
                                                {ORDER_STATUSES.map((s) => (
                                                    <option key={s} value={s} className="capitalize">{s}</option>
                                                ))}
                                            </select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── ANALYTICS ──────────────────────────────────────────────

function AnalyticsTab() {
    const analytics = useQuery(api.admin.getAnalytics);

    if (!analytics) return <div>Loading analytics...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Marketplace Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-3xl font-bold">R {analytics.totalRevenue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                        <p className="text-3xl font-bold">R {analytics.avgOrderValue.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Orders by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="capitalize text-sm">{status}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${analytics.totalOrders > 0 ? ((count as number) / analytics.totalOrders) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(analytics.ordersByStatus).length === 0 && (
                                <p className="text-sm text-muted-foreground">No orders yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.topProducts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm truncate flex-1">{p.name}</span>
                                    <div className="text-right ml-4">
                                        <span className="text-sm font-medium">{p.count} sold</span>
                                        <span className="text-xs text-muted-foreground ml-2">R {p.revenue.toFixed(0)}</span>
                                    </div>
                                </div>
                            ))}
                            {analytics.topProducts.length === 0 && (
                                <p className="text-sm text-muted-foreground">No sales yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vendor Performance */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Vendor Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Items Sold</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics.vendorPerformance.map((v, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{v.name}</TableCell>
                                        <TableCell>R {v.revenue.toFixed(2)}</TableCell>
                                        <TableCell>{v.orders}</TableCell>
                                    </TableRow>
                                ))}
                                {analytics.vendorPerformance.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No vendor data yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── SETTINGS ──────────────────────────────────────────────

function SettingsTab() {
    const heroBanner = useQuery(api.siteSettings.getHeroBanner);
    const generateUploadUrl = useMutation(api.siteSettings.generateUploadUrl);
    const setHeroBanner = useMutation(api.siteSettings.setHeroBanner);
    const removeHeroBanner = useMutation(api.siteSettings.removeHeroBanner);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            await setHeroBanner({ storageId });
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload banner. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Home Page Hero Banner
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Upload a background image for the hero section on the home page. Recommended size: 1920x800px.
                    </p>

                    {heroBanner ? (
                        <div className="space-y-3">
                            <div className="relative rounded-lg overflow-hidden border">
                                <img
                                    src={heroBanner}
                                    alt="Current hero banner"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Current Banner</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? "Uploading..." : "Replace Banner"}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={async () => {
                                        if (confirm("Remove the hero banner?")) {
                                            await removeHeroBanner();
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                            <p className="font-medium">{uploading ? "Uploading..." : "Click to upload a banner image"}</p>
                            <p className="text-sm text-muted-foreground mt-1">JPG, PNG, or WebP. Max 5MB.</p>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
