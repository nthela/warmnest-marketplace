"use client";

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { getShippingRates, ShippingRate } from "@/lib/shiprazor";
import { generatePaymentForm } from "@/lib/payfast";
import { useCart } from "@/contexts/cart-context";
import Link from "next/link";

const SA_PROVINCES = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
    "Western Cape",
];

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCart();
    const createOrder = useMutation(api.orders.create);

    const [step, setStep] = useState<"address" | "shipping" | "payment">("address");
    const [address, setAddress] = useState({ street: "", city: "", province: "Gauteng", code: "" });
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
    const [loadingRates, setLoadingRates] = useState(false);
    const [placing, setPlacing] = useState(false);

    const cartTotal = getTotal();

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingRates(true);
        const fetchedRates = await getShippingRates(address, 5);
        setRates(fetchedRates);
        setLoadingRates(false);
        setStep("shipping");
    };

    const handleShippingSelect = (rate: ShippingRate) => {
        setSelectedRate(rate);
        setStep("payment");
    };

    const handlePayment = async () => {
        if (!selectedRate || items.length === 0) return;
        setPlacing(true);

        try {
            const orderId = await createOrder({
                totalAmount: cartTotal + selectedRate.price,
                shippingAddress: {
                    street: address.street,
                    city: address.city,
                    province: address.province,
                    code: address.code,
                    country: "South Africa",
                },
                items: items.map((item) => ({
                    productId: item.productId as Id<"products">,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });

            generatePaymentForm({
                amount: cartTotal + selectedRate.price,
                item_name: "WarmNest Order",
            });

            clearCart();
            router.push(`/checkout/success?orderId=${orderId}`);
        } catch (error) {
            console.error("Failed to create order:", error);
            alert("Something went wrong placing your order. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    if (items.length === 0 && step === "address") {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
                    <Link href="/shop">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">

                        {/* Step 1: Address */}
                        <Card className={step === "address" ? "border-primary" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            {step === "address" && (
                                <CardContent>
                                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Street Address</Label>
                                            <Input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} required placeholder="123 Main St" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>City</Label>
                                                <Input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required placeholder="Johannesburg" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Postal Code</Label>
                                                <Input value={address.code} onChange={e => setAddress({ ...address, code: e.target.value })} required placeholder="2000" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Province</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={address.province}
                                                onChange={e => setAddress({ ...address, province: e.target.value })}
                                                required
                                            >
                                                {SA_PROVINCES.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loadingRates}>
                                            {loadingRates ? "Calculating Shipping..." : "Continue to Shipping"}
                                        </Button>
                                    </form>
                                </CardContent>
                            )}
                        </Card>

                        {/* Step 2: Shipping */}
                        <Card className={step === "shipping" ? "border-primary" : "opacity-75"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className={`h-6 w-6 rounded-full text-xs flex items-center justify-center ${step === "shipping" || step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                                    Shipping Method
                                </CardTitle>
                            </CardHeader>
                            {step === "shipping" && (
                                <CardContent className="space-y-4">
                                    {rates.map(rate => (
                                        <div key={rate.id}
                                            className="flex items-center justify-between p-4 border rounded cursor-pointer hover:border-primary transition"
                                            onClick={() => handleShippingSelect(rate)}
                                        >
                                            <div>
                                                <div className="font-semibold">{rate.name}</div>
                                                <div className="text-sm text-muted-foreground">{rate.days} {rate.days === 1 ? "Day" : "Days"}</div>
                                            </div>
                                            <div className="font-bold">R {rate.price.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>

                        {/* Step 3: Payment */}
                        <Card className={step === "payment" ? "border-primary" : "opacity-75"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className={`h-6 w-6 rounded-full text-xs flex items-center justify-center ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                                    Payment
                                </CardTitle>
                            </CardHeader>
                            {step === "payment" && selectedRate && (
                                <CardContent className="space-y-6">
                                    <div className="bg-muted p-4 rounded space-y-2">
                                        <div className="flex justify-between"><span>Cart Total</span><span>R {cartTotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Shipping ({selectedRate.name})</span><span>R {selectedRate.price.toFixed(2)}</span></div>
                                        <hr />
                                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>R {(cartTotal + selectedRate.price).toFixed(2)}</span></div>
                                    </div>

                                    <Button size="lg" className="w-full" onClick={handlePayment} disabled={placing}>
                                        {placing ? "Placing Order..." : "Pay Securely via PayFast"}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">Encryption by PayFast. Cards & EFT accepted.</p>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-medium">R {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <hr />
                                <div className="flex justify-between font-bold">
                                    <span>Subtotal</span>
                                    <span>R {cartTotal.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
