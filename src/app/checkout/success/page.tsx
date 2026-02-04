"use client";

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
                    <p className="text-muted-foreground">
                        Thank you for shopping with WarmNest Marketplace.
                    </p>
                </div>

                {orderId && (
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                        <p className="font-mono text-sm font-medium break-all">{orderId}</p>
                    </div>
                )}

                <p className="text-sm text-muted-foreground">
                    You will receive an email confirmation shortly. You can track your order status from your account.
                </p>

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
