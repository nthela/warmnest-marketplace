"use client";

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCart } from "@/contexts/cart-context";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const { clearCart } = useCart();

    const order = useQuery(api.orders.get, orderId ? { orderId } : "skip");

    // Clear cart when landing on success page for the order we just placed
    useEffect(() => {
        if (orderId) {
            const pendingOrder = sessionStorage.getItem("warmnest-pending-order");
            if (pendingOrder === orderId) {
                clearCart();
                sessionStorage.removeItem("warmnest-pending-order");
            }
        }
    }, [orderId, clearCart]);

    const isPaid = order?.status === "paid";
    const isPending = order?.status === "pending";
    const isCancelled = order?.status === "cancelled";

    return (
        <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-6">
                <div className="flex justify-center">
                    {isPaid && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                    {isPending && <Clock className="h-16 w-16 text-yellow-500 animate-pulse" />}
                    {isCancelled && <AlertCircle className="h-16 w-16 text-red-500" />}
                    {!order && orderId && <Clock className="h-16 w-16 text-gray-400 animate-pulse" />}
                    {!orderId && <AlertCircle className="h-16 w-16 text-gray-400" />}
                </div>
                <div>
                    {isPaid && (
                        <>
                            <h1 className="text-2xl font-bold mb-2">Payment Confirmed!</h1>
                            <p className="text-muted-foreground">
                                Thank you for shopping with WarmNest Marketplace.
                            </p>
                        </>
                    )}
                    {isPending && (
                        <>
                            <h1 className="text-2xl font-bold mb-2">Payment Processing...</h1>
                            <p className="text-muted-foreground">
                                We&apos;re waiting for payment confirmation from PayFast.
                                This page will update automatically.
                            </p>
                        </>
                    )}
                    {isCancelled && (
                        <>
                            <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                            <p className="text-muted-foreground">
                                Your payment was not completed.
                            </p>
                        </>
                    )}
                    {!order && orderId && (
                        <>
                            <h1 className="text-2xl font-bold mb-2">Loading order...</h1>
                            <p className="text-muted-foreground">Fetching your order details.</p>
                        </>
                    )}
                    {!orderId && (
                        <>
                            <h1 className="text-2xl font-bold mb-2">No Order Found</h1>
                            <p className="text-muted-foreground">We couldn&apos;t find an order reference.</p>
                        </>
                    )}
                </div>

                {orderId && (
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                        <p className="font-mono text-sm font-medium break-all">{orderId}</p>
                    </div>
                )}

                {isPaid && (
                    <p className="text-sm text-muted-foreground">
                        You will receive an email confirmation shortly. You can track your order status from your account.
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/shop">
                        <Button variant="outline">Continue Shopping</Button>
                    </Link>
                    <Link href="/track-order">
                        <Button>Track Order</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-lg">
                <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
