"use client";

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Suspense } from "react";

function CancelContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-6">
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                    <p className="text-muted-foreground">
                        Your payment was cancelled. Your order has not been processed.
                    </p>
                </div>

                {orderId && (
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
                        <p className="font-mono text-sm font-medium break-all">{orderId}</p>
                    </div>
                )}

                <p className="text-sm text-muted-foreground">
                    Your cart items are still saved. You can try again whenever you&apos;re ready.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout">
                        <Button>Try Again</Button>
                    </Link>
                    <Link href="/shop">
                        <Button variant="outline">Continue Shopping</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-lg">
                <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
                    <CancelContent />
                </Suspense>
            </div>
        </div>
    );
}
