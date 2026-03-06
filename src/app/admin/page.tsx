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
    BarChart3, Trash2, Check, X, Eye, EyeOff, Sparkles, Settings, Upload, ImageIcon, Type, Pencil, Plus, List, Mail, Phone, MapPin, Globe, Search,
    TrendingUp, TrendingDown, Minus, DollarSign, Activity, ShieldCheck, AlertTriangle, Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// ─── CHANGE BADGE ──────────────────────────────────────────

function ChangeBadge({ value }: { value: number }) {
    if (value > 0) return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600"><TrendingUp className="h-3 w-3" />+{value}%</span>;
    if (value < 0) return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500"><TrendingDown className="h-3 w-3" />{value}%</span>;
    return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground"><Minus className="h-3 w-3" />0%</span>;
}

// ─── SIMPLE BAR CHART ──────────────────────────────────────

function MiniBarChart({ data, labelKey, valueKey, formatValue }: {
    data: Record<string, unknown>[];
    labelKey: string;
    valueKey: string;
    formatValue?: (v: number) => string;
}) {
    const max = Math.max(...data.map((d) => d[valueKey] as number), 1);
    return (
        <div className="space-y-2">
            {data.map((d, i) => {
                const val = d[valueKey] as number;
                return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="w-20 text-right text-muted-foreground truncate">{d[labelKey] as string}</span>
                        <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                            <div className="h-full bg-primary/70 rounded" style={{ width: `${(val / max) * 100}%` }} />
                        </div>
                        <span className="w-16 text-right font-medium">{formatValue ? formatValue(val) : val}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── OVERVIEW ───────────────────────────────────────────────

function OverviewTab() {
    const exec = useQuery(api.analytics.getExecutiveMetrics);
    const stats = useQuery(api.admin.getStats);
    const health = useQuery(api.analytics.getMarketplaceHealth);

    if (!exec || !stats) return <div>Loading stats...</div>;

    const kpis: { label: string; value: string; change: number; icon: React.ReactNode }[] = [
        { label: "GMV", value: `R ${exec.gmv.toFixed(2)}`, change: exec.gmvChange, icon: <DollarSign className="h-4 w-4" /> },
        { label: "Revenue (Commission)", value: `R ${exec.revenue.toFixed(2)}`, change: exec.revenueChange, icon: <TrendingUp className="h-4 w-4" /> },
        { label: "Orders", value: String(exec.totalOrders), change: exec.ordersChange, icon: <ShoppingBag className="h-4 w-4" /> },
        { label: "Active Users (30d)", value: String(exec.activeUsers), change: exec.activeUsersChange, icon: <Activity className="h-4 w-4" /> },
    ];

    const secondaryCards = [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Active Vendors", value: stats.activeVendors },
        { label: "Pending Vendors", value: stats.pendingVendors },
        { label: "Total Products", value: stats.totalProducts },
        { label: "Waitlist", value: stats.waitlistCount },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            {/* Executive KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((k) => (
                    <Card key={k.label}>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm text-muted-foreground">{k.label}</p>
                                <span className="text-muted-foreground">{k.icon}</span>
                            </div>
                            <p className="text-2xl font-bold">{k.value}</p>
                            <div className="mt-1"><ChangeBadge value={k.change} /> <span className="text-xs text-muted-foreground">vs last month</span></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick metrics row */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {secondaryCards.map((c) => (
                    <Card key={c.label}>
                        <CardContent className="pt-4 pb-3">
                            <p className="text-xs text-muted-foreground">{c.label}</p>
                            <p className="text-xl font-bold">{c.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Health snapshot */}
            {health && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <p className="text-sm text-muted-foreground">Avg Order Value</p>
                            <p className="text-xl font-bold">R {health.avgOrderValue.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <p className="text-sm text-muted-foreground">Customer Retention</p>
                            <p className="text-xl font-bold">{health.retentionRate}%</p>
                            <p className="text-xs text-muted-foreground">{health.repeatBuyers} repeat of {health.totalBuyers} buyers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <p className="text-sm text-muted-foreground">Cancel Rate</p>
                            <p className="text-xl font-bold">{health.cancellationRate}%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <p className="text-sm text-muted-foreground">Avg Rating</p>
                            <p className="text-xl font-bold flex items-center gap-1">{health.avgRating || "—"} <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /></p>
                            <p className="text-xs text-muted-foreground">{health.totalReviews} reviews</p>
                        </CardContent>
                    </Card>
                </div>
            )}
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
    const categories = useQuery(api.siteSettings.getCategories);
    const toggleActive = useMutation(api.admin.toggleProductActive);
    const deleteProduct = useMutation(api.admin.deleteProduct);

    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "newest">("newest");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");

    const filtered = (products ?? []).filter((p) => {
        if (search) {
            const q = search.toLowerCase();
            if (!p.name.toLowerCase().includes(q) && !p.vendorName?.toLowerCase().includes(q)) return false;
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <Link href="/vendors/products/new">
                    <Button>+ Add Product</Button>
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or vendor..."
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
                    onChange={(e) => setStatusFilter(e.target.value as ""| "active" | "inactive")}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "price" | "stock" | "newest")}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                    <option value="newest">Newest</option>
                    <option value="name">Name A–Z</option>
                    <option value="price">Price Low–High</option>
                    <option value="stock">Stock Low–High</option>
                </select>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Cost (Commission)</TableHead>
                                <TableHead>Profit</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products === undefined ? (
                                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="text-center py-8">No products match your filters.</TableCell></TableRow>
                            ) : (
                                filtered.map((p) => {
                                    const sellingPrice = p.salePrice ?? p.price;
                                    const rate = p.commissionRate ?? 0.12;
                                    const commission = sellingPrice * rate;
                                    const profit = sellingPrice - commission;
                                    return (
                                        <TableRow
                                            key={p._id}
                                            className={`cursor-pointer hover:bg-muted/50 ${!p.isActive ? "opacity-50" : ""}`}
                                            onClick={() => window.location.href = `/vendors/products/${p._id}/edit`}
                                        >
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
                                            <TableCell>
                                                <span className="text-red-500">R {commission.toFixed(2)}</span>
                                                <span className="text-xs text-muted-foreground ml-1">({(rate * 100).toFixed(0)}%)</span>
                                            </TableCell>
                                            <TableCell className="text-green-600 font-medium">R {profit.toFixed(2)}</TableCell>
                                            <TableCell>{p.stock}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs font-medium ${p.isActive ? "text-green-600" : "text-red-500"}`}>
                                                    {p.isActive ? "Yes" : "No"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
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
                                    );
                                })
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
    const [section, setSection] = useState<"growth" | "health" | "operations">("growth");

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold mr-auto">Marketplace Analytics</h1>
                <div className="flex bg-muted rounded-lg p-1">
                    {(["growth", "health", "operations"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSection(s)}
                            className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                                section === s ? "bg-white shadow font-medium" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {section === "growth" && <GrowthSection />}
            {section === "health" && <HealthSection />}
            {section === "operations" && <OperationsSection />}
        </div>
    );
}

// ── Growth ──

function GrowthSection() {
    const growth = useQuery(api.analytics.getGrowthMetrics);
    if (!growth) return <div>Loading growth metrics...</div>;

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-muted-foreground">Customer Growth</p>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{growth.totalCustomers}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <ChangeBadge value={growth.customerGrowth} />
                            <span className="text-xs text-muted-foreground">+{growth.customersThisMonth} this month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-muted-foreground">Vendor Growth</p>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{growth.totalVendors}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <ChangeBadge value={growth.vendorGrowth} />
                            <span className="text-xs text-muted-foreground">+{growth.vendorsThisMonth} this month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-muted-foreground">Categories</p>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{growth.totalCategories}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly signups chart */}
            <Card>
                <CardHeader><CardTitle className="text-base">Monthly Signups (6 months)</CardTitle></CardHeader>
                <CardContent>
                    <MiniBarChart data={growth.monthlySignups as unknown as Record<string, unknown>[]} labelKey="month" valueKey="customers" />
                </CardContent>
            </Card>

            {/* Category breakdown */}
            <Card>
                <CardHeader><CardTitle className="text-base">Category Growth</CardTitle></CardHeader>
                <CardContent>
                    {growth.categoryGrowth.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>New This Month</TableHead>
                                    <TableHead>Change</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {growth.categoryGrowth.map((c) => (
                                    <TableRow key={c.name}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.total}</TableCell>
                                        <TableCell>{c.newThisMonth}</TableCell>
                                        <TableCell><ChangeBadge value={c.change} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground">No category data yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ── Health ──

function HealthSection() {
    const health = useQuery(api.analytics.getMarketplaceHealth);
    if (!health) return <div>Loading health metrics...</div>;

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-400",
        paid: "bg-blue-400",
        processing: "bg-indigo-400",
        shipped: "bg-cyan-400",
        completed: "bg-green-400",
        cancelled: "bg-red-400",
    };

    return (
        <div className="space-y-6">
            {/* Health KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                        <p className="text-2xl font-bold">R {health.avgOrderValue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-sm text-muted-foreground">Customer Retention</p>
                        <p className="text-2xl font-bold">{health.retentionRate}%</p>
                        <p className="text-xs text-muted-foreground">{health.repeatBuyers} repeat of {health.totalBuyers} buyers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                        <p className={`text-2xl font-bold ${health.cancellationRate > 10 ? "text-red-500" : ""}`}>{health.cancellationRate}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-sm text-muted-foreground">Review Score</p>
                        <p className="text-2xl font-bold flex items-center gap-1">{health.avgRating || "—"} <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /></p>
                        <p className="text-xs text-muted-foreground">{health.totalReviews} reviews</p>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion note */}
            <Card className="border-dashed">
                <CardContent className="pt-5 pb-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium">Conversion Rate & Cart Abandonment</p>
                        <p className="text-xs text-muted-foreground">These metrics require page view and cart event tracking. Currently the cart is client-side (localStorage). Add server-side event logging to enable these insights.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(health.ordersByStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="capitalize text-sm flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status] ?? "bg-gray-400"}`} />
                                        {status}
                                    </span>
                                    <span className="text-sm font-medium">{count as number}</span>
                                </div>
                            ))}
                            {Object.keys(health.ordersByStatus).length === 0 && (
                                <p className="text-sm text-muted-foreground">No orders yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly GMV */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Monthly GMV (6 months)</CardTitle></CardHeader>
                    <CardContent>
                        <MiniBarChart
                            data={health.monthlyOrders as unknown as Record<string, unknown>[]}
                            labelKey="month"
                            valueKey="gmv"
                            formatValue={(v) => `R ${v.toFixed(0)}`}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ── Operations ──

function OperationsSection() {
    const ops = useQuery(api.analytics.getOperationsMetrics);
    if (!ops) return <div>Loading operations metrics...</div>;

    const pipelineStages = [
        { key: "pending", label: "Pending", color: "bg-yellow-400" },
        { key: "paid", label: "Paid", color: "bg-blue-400" },
        { key: "processing", label: "Processing", color: "bg-indigo-400" },
        { key: "shipped", label: "Shipped", color: "bg-cyan-400" },
        { key: "completed", label: "Completed", color: "bg-green-400" },
        { key: "cancelled", label: "Cancelled", color: "bg-red-400" },
    ];

    return (
        <div className="space-y-6">
            {/* Fulfillment KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className={`text-2xl font-bold ${ops.fulfillmentRate >= 80 ? "text-green-600" : ops.fulfillmentRate >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                            {ops.fulfillmentRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">shipped or completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-sm text-muted-foreground">Cancel Rate</p>
                        <p className={`text-2xl font-bold ${ops.cancelRate > 10 ? "text-red-500" : ""}`}>{ops.cancelRate}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{ops.totalOrders}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Fulfillment Pipeline */}
            <Card>
                <CardHeader><CardTitle className="text-base">Fulfillment Pipeline</CardTitle></CardHeader>
                <CardContent>
                    {ops.totalOrders > 0 ? (
                        <>
                            <div className="flex h-6 rounded-full overflow-hidden mb-3">
                                {pipelineStages.map((s) => {
                                    const count = ops.pipeline[s.key as keyof typeof ops.pipeline];
                                    const pct = (count / ops.totalOrders) * 100;
                                    if (pct === 0) return null;
                                    return <div key={s.key} className={`${s.color}`} style={{ width: `${pct}%` }} title={`${s.label}: ${count}`} />;
                                })}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {pipelineStages.map((s) => {
                                    const count = ops.pipeline[s.key as keyof typeof ops.pipeline];
                                    return (
                                        <span key={s.key} className="flex items-center gap-1.5 text-xs">
                                            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                                            {s.label}: {count}
                                        </span>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* Infrastructure note */}
            <Card className="border-dashed">
                <CardContent className="pt-5 pb-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium">Infrastructure Metrics</p>
                        <p className="text-xs text-muted-foreground">Server load, page speed, and API traffic metrics require integration with a monitoring provider (e.g. Vercel Analytics, Sentry). These are not available from the application database.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
                    <CardContent>
                        {ops.topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {ops.topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm truncate flex-1">{p.name}</span>
                                        <div className="text-right ml-4">
                                            <span className="text-sm font-medium">{p.quantity} sold</span>
                                            <span className="text-xs text-muted-foreground ml-2">R {p.revenue.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No sales yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ops.lowStock.length > 0 ? (
                            <div className="space-y-2">
                                {ops.lowStock.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="truncate flex-1">{p.name}</span>
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

                {/* Vendor Performance */}
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle className="text-base">Vendor Performance</CardTitle></CardHeader>
                    <CardContent>
                        {ops.vendorPerformance.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Items Sold</TableHead>
                                        <TableHead>Orders</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ops.vendorPerformance.map((v, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{v.name}</TableCell>
                                            <TableCell>R {v.revenue.toFixed(2)}</TableCell>
                                            <TableCell>{v.itemsSold}</TableCell>
                                            <TableCell>{v.orderCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">No vendor data yet.</p>
                        )}
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
        <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

            {/* Hero Banner Upload */}
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

            {/* Homepage Text Editor */}
            <HomepageTextEditor />

            {/* Category Manager */}
            <CategoryManager />

            {/* Contact Info */}
            <ContactInfoEditor />

            {/* Category Images */}
            <CategoryImagesEditor />
        </div>
    );
}

// ─── HOMEPAGE TEXT EDITOR ───────────────────────────────────

function HomepageTextEditor() {
    const homepageText = useQuery(api.siteSettings.getHomepageText);
    const setText = useMutation(api.siteSettings.setText);
    const [saving, setSaving] = useState<string | null>(null);

    const fields = [
        { key: "heroTitle", label: "Hero Title", placeholder: "Discover Unique Products from", description: "Main heading text (before the highlighted word)" },
        { key: "heroHighlight", label: "Hero Highlight", placeholder: "Trusted Vendors", description: "The highlighted/colored word in the heading" },
        { key: "heroSubtitle", label: "Hero Subtitle", placeholder: "WarmNest is South Africa\u2019s premier marketplace...", description: "Paragraph text below the heading" },
        { key: "ctaTitle", label: "Seller CTA Title", placeholder: "Want to Sell on WarmNest?", description: "Heading for the vendor call-to-action section" },
        { key: "ctaSubtitle", label: "Seller CTA Subtitle", placeholder: "We\u2019re onboarding our first sellers...", description: "Text below the vendor CTA heading" },
    ];

    async function handleSave(key: string, value: string) {
        setSaving(key);
        try {
            await setText({ key, value });
        } catch (err) {
            console.error("Failed to save:", err);
            alert("Failed to save. Please try again.");
        } finally {
            setSaving(null);
        }
    }

    if (homepageText === undefined) return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Home Page Text
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                    Customize the text displayed on the home page. Leave a field empty and save to reset it to the default.
                </p>
                {fields.map((field) => (
                    <HomepageTextField
                        key={field.key}
                        fieldKey={field.key}
                        label={field.label}
                        placeholder={field.placeholder}
                        description={field.description}
                        currentValue={homepageText[field.key] ?? ""}
                        saving={saving === field.key}
                        onSave={handleSave}
                    />
                ))}
            </CardContent>
        </Card>
    );
}

function HomepageTextField({
    fieldKey,
    label,
    placeholder,
    description,
    currentValue,
    saving,
    onSave,
}: {
    fieldKey: string;
    label: string;
    placeholder: string;
    description: string;
    currentValue: string;
    saving: boolean;
    onSave: (key: string, value: string) => void;
}) {
    const [value, setValue] = useState(currentValue);
    const isDirty = value !== currentValue;

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button
                    size="sm"
                    onClick={() => onSave(fieldKey, value)}
                    disabled={!isDirty || saving}
                    className="shrink-0"
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    );
}

// ─── CATEGORY MANAGER ──────────────────────────────────────

function CategoryManager() {
    const categories = useQuery(api.siteSettings.getCategories);
    const addCategory = useMutation(api.siteSettings.addCategory);
    const renameCat = useMutation(api.siteSettings.renameCategory);
    const deleteCat = useMutation(api.siteSettings.deleteCategory);

    const [newName, setNewName] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    async function handleAdd() {
        const trimmed = newName.trim();
        if (!trimmed) return;
        try {
            await addCategory({ name: trimmed });
            setNewName("");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to add category");
        }
    }

    async function handleRename(oldName: string) {
        const trimmed = editValue.trim();
        if (!trimmed || trimmed === oldName) {
            setEditingIndex(null);
            return;
        }
        try {
            await renameCat({ oldName, newName: trimmed });
            setEditingIndex(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to rename category");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm(`Delete category "${name}"? Products in this category will be moved to "Uncategorized".`)) return;
        try {
            await deleteCat({ name });
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete category");
        }
    }

    if (categories === undefined) return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Manage Categories
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Add, rename, or remove product categories. Renaming updates all existing products. Deleting moves products to &quot;Uncategorized&quot;.
                </p>

                {/* Add new category */}
                <div className="flex gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                        placeholder="New category name"
                        className="flex-1"
                    />
                    <Button onClick={handleAdd} disabled={!newName.trim()}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>

                {/* Category list */}
                <div className="space-y-2">
                    {categories.map((cat, i) => (
                        <div key={cat} className="flex items-center gap-2 p-2 border rounded-md">
                            {editingIndex === i ? (
                                <>
                                    <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRename(cat); } }}
                                        className="flex-1 h-8"
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={() => handleRename(cat)}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingIndex(null)}>Cancel</Button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 font-medium text-sm">{cat}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setEditingIndex(i); setEditValue(cat); }}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(cat)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── CATEGORY IMAGES EDITOR ────────────────────────────────

function CategoryImagesEditor() {
    const categories = useQuery(api.siteSettings.getCategories);
    const categoryImages = useQuery(api.siteSettings.getCategoryImages);
    const generateUploadUrl = useMutation(api.siteSettings.generateUploadUrl);
    const setCategoryImage = useMutation(api.siteSettings.setCategoryImage);
    const removeCategoryImage = useMutation(api.siteSettings.removeCategoryImage);

    const [uploading, setUploading] = useState<string | null>(null);

    async function handleUpload(category: string, file: File) {
        setUploading(category);
        try {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            await setCategoryImage({ category, storageId });
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(null);
        }
    }

    if (categories === undefined || categoryImages === undefined) {
        return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Category Images
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Upload images for each category card on the home page. Recommended size: 400x300px.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <CategoryImageCard
                            key={cat}
                            category={cat}
                            imageUrl={categoryImages[cat] ?? null}
                            uploading={uploading === cat}
                            onUpload={(file) => handleUpload(cat, file)}
                            onRemove={() => {
                                if (confirm(`Remove image for "${cat}"?`)) {
                                    removeCategoryImage({ category: cat });
                                }
                            }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function CategoryImageCard({
    category,
    imageUrl,
    uploading,
    onUpload,
    onRemove,
}: {
    category: string;
    imageUrl: string | null;
    uploading: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="relative h-28 bg-muted">
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt={category} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-white text-sm font-semibold drop-shadow">{category}</span>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-muted-foreground">{category}</span>
                    </div>
                )}
            </div>
            <div className="p-2 flex gap-1">
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                >
                    <Upload className="h-3 w-3 mr-1" />
                    {uploading ? "Uploading..." : imageUrl ? "Replace" : "Upload"}
                </Button>
                {imageUrl && (
                    <Button size="sm" variant="destructive" className="text-xs" onClick={onRemove}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

// ─── CONTACT INFO EDITOR ───────────────────────────────────

function ContactInfoEditor() {
    const contactInfo = useQuery(api.siteSettings.getContactInfo);
    const setContactInfo = useMutation(api.siteSettings.setContactInfo);
    const [saving, setSaving] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [initialized, setInitialized] = useState(false);

    // Sync from server on first load
    if (contactInfo && !initialized) {
        setValues(contactInfo);
        setInitialized(true);
    }

    const fields = [
        { key: "contactEmail", label: "Email", icon: <Mail className="h-4 w-4" />, placeholder: "support@warmnest.co.za" },
        { key: "contactPhone", label: "Phone", icon: <Phone className="h-4 w-4" />, placeholder: "+27 (0) 11 000 0000" },
        { key: "contactWhatsApp", label: "WhatsApp", icon: <Phone className="h-4 w-4" />, placeholder: "+27 60 000 0000" },
        { key: "contactAddress", label: "Address", icon: <MapPin className="h-4 w-4" />, placeholder: "Johannesburg, South Africa" },
        { key: "contactFacebook", label: "Facebook", icon: <Globe className="h-4 w-4" />, placeholder: "https://facebook.com/warmnest" },
        { key: "contactInstagram", label: "Instagram", icon: <Globe className="h-4 w-4" />, placeholder: "@warmnest" },
        { key: "contactTwitter", label: "Twitter / X", icon: <Globe className="h-4 w-4" />, placeholder: "@warmnest" },
    ];

    async function handleSave(key: string) {
        setSaving(key);
        try {
            await setContactInfo({ key, value: values[key] ?? "" });
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(null);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Only filled-in fields will appear in the site footer. Leave blank to hide.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field) => (
                    <div key={field.key} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-28 shrink-0 text-sm font-medium text-muted-foreground">
                            {field.icon}
                            {field.label}
                        </div>
                        <Input
                            placeholder={field.placeholder}
                            value={values[field.key] ?? ""}
                            onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                            className="flex-1"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSave(field.key)}
                            disabled={saving === field.key}
                        >
                            {saving === field.key ? "Saving..." : "Save"}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
