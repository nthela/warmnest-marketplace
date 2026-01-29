"use client";

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";

// Mock Data
const INITIAL_CART = [
    { id: "1", name: "Premium Leather Wallet", price: 450, quantity: 1, vendor: "Urban Leather Co." },
    { id: "2", name: "Wireless Headphones", price: 1200, quantity: 1, vendor: "TechGiant" },
];

export default function CartPage() {
    const [cart, setCart] = useState(INITIAL_CART);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const removeItem = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                        <Link href="/shop">
                            <Button>Continue Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                            Img
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">Sold by {item.vendor}</p>
                                            <div className="font-bold mt-1">R {item.price}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Quantity Logic omitted for brevity */}
                                            <span className="text-sm">Qty: {item.quantity}</span>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>R {total}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-sm">
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>R {total}</span>
                                    </div>
                                    <Link href="/checkout">
                                        <Button className="w-full mt-4" size="lg">Proceed to Checkout</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
