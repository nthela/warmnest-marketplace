"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Package,
    ChevronDown,
    ChevronUp,
    ShoppingBag,
    ArrowLeft,
    Clock,
    CreditCard,
    Truck,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-4 w-4" /> },
    paid: { label: "Paid", color: "bg-blue-100 text-blue-700", icon: <CreditCard className="h-4 w-4" /> },
    processing: { label: "Processing", color: "bg-indigo-100 text-indigo-700", icon: <Package className="h-4 w-4" /> },
    shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", icon: <Truck className="h-4 w-4" /> },
    completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-4 w-4" /> },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: <XCircle className="h-4 w-4" /> },
};

type StatusFilter = "all" | "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled";

export default function OrderHistoryPage() {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const router = useRouter();
    const orders = useQuery(api.orders.getByUser);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/signin");
        return null;
    }

    const filteredOrders = orders?.filter(
        (order) => statusFilter === "all" || order.status === statusFilter
    );

    const statusCounts = orders?.reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/account">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">My Orders</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {orders ? `${orders.length} order${orders.length !== 1 ? "s" : ""} total` : "Loading..."}
                        </p>
                    </div>
                </div>

                {/* Status Filter */}
                {orders && orders.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Button
                            size="sm"
                            variant={statusFilter === "all" ? "default" : "outline"}
                            onClick={() => setStatusFilter("all")}
                        >
                            All ({orders.length})
                        </Button>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                            const count = statusCounts?.[key] || 0;
                            if (count === 0) return null;
                            return (
                                <Button
                                    key={key}
                                    size="sm"
                                    variant={statusFilter === key ? "default" : "outline"}
                                    onClick={() => setStatusFilter(key as StatusFilter)}
                                    className="gap-1.5"
                                >
                                    {config.icon}
                                    {config.label} ({count})
                                </Button>
                            );
                        })}
                    </div>
                )}

                {/* Orders List */}
                {!orders ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 bg-white rounded-lg border animate-pulse" />
                        ))}
                    </div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const isExpanded = expandedOrder === order._id;
                            const itemCount = order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);

                            return (
                                <Card key={order._id} className="overflow-hidden">
                                    {/* Order Summary Row */}
                                    <button
                                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                        className="w-full text-left"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                        <Package className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-sm text-muted-foreground">
                                                            {order._id}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                            {" \u00b7 "}
                                                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-lg">
                                                        R {order.totalAmount.toFixed(2)}
                                                    </span>
                                                    <Badge className={`${status.color} gap-1`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </Badge>
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <CardContent className="border-t pt-4 space-y-4">
                                            {/* Items */}
                                            <div>
                                                <h4 className="font-semibold text-sm mb-3">Items</h4>
                                                <div className="space-y-3">
                                                    {order.items.map((item: any) => (
                                                        <div
                                                            key={item._id}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <div className="h-14 w-14 bg-muted rounded-md overflow-hidden shrink-0">
                                                                {item.productImage ? (
                                                                    <img
                                                                        src={item.productImage}
                                                                        alt={item.productName}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">
                                                                    {item.productName}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Qty: {item.quantity} &times; R {item.price.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <span className="font-medium text-sm shrink-0">
                                                                R {(item.quantity * item.price).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            {order.shippingAddress && (
                                                <div className="bg-muted/50 p-4 rounded-md">
                                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                                                        <Truck className="h-4 w-4" />
                                                        Shipping Address
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.shippingAddress.street}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.code}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.shippingAddress.country}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Order total + actions */}
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="text-sm text-muted-foreground">
                                                    Order Total:{" "}
                                                    <span className="font-bold text-foreground text-base">
                                                        R {order.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <Link href={`/track-order?id=${order._id}`}>
                                                    <Button variant="outline" size="sm" className="gap-1.5">
                                                        <Truck className="h-3.5 w-3.5" />
                                                        Track
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg mb-1">
                                {statusFilter === "all" ? "No orders yet" : `No ${statusFilter} orders`}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                {statusFilter === "all"
                                    ? "When you place an order, it will appear here."
                                    : "Try a different filter to see more orders."}
                            </p>
                            {statusFilter === "all" ? (
                                <Link href="/shop">
                                    <Button>Start Shopping</Button>
                                </Link>
                            ) : (
                                <Button variant="outline" onClick={() => setStatusFilter("all")}>
                                    Show All Orders
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
}
