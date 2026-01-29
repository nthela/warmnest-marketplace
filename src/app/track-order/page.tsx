"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package } from "lucide-react";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [queryId, setQueryId] = useState(""); // actual ID to query

    const order = useQuery(api.orders.get, queryId ? { orderId: queryId } : "skip");

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderId.trim()) {
            setQueryId(orderId.trim());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-12 flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

                <Card className="w-full max-w-md mb-8">
                    <CardHeader>
                        <CardTitle>Enter Order Number</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTrack} className="flex gap-2">
                            <Input
                                placeholder="Order ID (e.g. 3k7...)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                            <Button type="submit">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {queryId && !order && order !== null && (
                    <div className="text-center">Searching...</div>
                )}

                {queryId && order === null && (
                    <div className="text-red-500 font-medium">Order not found. Please check the ID.</div>
                )}

                {order && (
                    <Card className="w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-4">
                        <CardHeader className="border-b bg-muted/20">
                            <div className="flex justify-between items-center">
                                <CardTitle>Order Details</CardTitle>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize
                  ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Order ID</div>
                                    <div className="font-mono">{order._id}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                <div>
                                    <span className="text-muted-foreground block">Total Amount</span>
                                    <span className="font-semibold text-lg">R {order.totalAmount}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Order Date</span>
                                    <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="bg-muted p-4 rounded-md text-sm">
                                <div className="font-semibold mb-2">Shipping To:</div>
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.code}</p>
                                <p>{order.shippingAddress?.country}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
