"use client";

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getShippingRates, ShippingRate } from "@/lib/shiprazor";
import { generatePaymentForm, PAYFAST_URL } from "@/lib/payfast";

export default function CheckoutPage() {
    const [step, setStep] = useState<"address" | "shipping" | "payment">("address");
    const [address, setAddress] = useState({ street: "", city: "", code: "" });
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
    const [loadingRates, setLoadingRates] = useState(false);

    // Mock Cart Total
    const cartTotal = 1650;

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingRates(true);
        const fetchedRates = await getShippingRates(address, 5); // Mock weight 5kg
        setRates(fetchedRates);
        setLoadingRates(false);
        setStep("shipping");
    };

    const handleShippingSelect = (rate: ShippingRate) => {
        setSelectedRate(rate);
        setStep("payment");
    };

    const handlePayment = () => {
        // Generate PayFast form and submit
        const paymentData = generatePaymentForm({
            amount: cartTotal + (selectedRate?.price || 0),
            item_name: "WarmNest Order #12345",
        });

        // In a real app, we would create a hidden form and submit it to PayFast
        alert(`Redirecting to PayFast...\nTotal: R ${paymentData.amount}\nMerchant: ${paymentData.merchant_id}`);

        // Simulate success
        window.location.href = "/checkout/success"; // Create this page if needed or redirect to home
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">

                        {/* Step 1: Address */}
                        <Card className={step === "address" ? "border-primary" : ""}>
                            <CardHeader>
                                <CardTitle>1. Shipping Address</CardTitle>
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
                                <CardTitle>2. Shipping Method</CardTitle>
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
                                                <div className="text-sm text-muted-foreground">{rate.days} Days</div>
                                            </div>
                                            <div className="font-bold">R {rate.price}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>

                        {/* Step 3: Payment */}
                        <Card className={step === "payment" ? "border-primary" : "opacity-75"}>
                            <CardHeader>
                                <CardTitle>3. Payment</CardTitle>
                            </CardHeader>
                            {step === "payment" && selectedRate && (
                                <CardContent className="space-y-6">
                                    <div className="bg-muted p-4 rounded space-y-2">
                                        <div className="flex justify-between"><span>Cart Total</span><span>R {cartTotal}</span></div>
                                        <div className="flex justify-between"><span>Shipping</span><span>R {selectedRate.price}</span></div>
                                        <hr />
                                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>R {cartTotal + selectedRate.price}</span></div>
                                    </div>

                                    <Button size="lg" className="w-full" onClick={handlePayment}>
                                        PaySecurely via PayFast
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">Encryption by PayFast. Cards & EFT accepted.</p>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div>
                        {/* Can add mini cart summary here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
