"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Store, Package, ShoppingBag, LogOut, Shield } from "lucide-react";

export default function AccountPage() {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const { signOut } = useAuthActions();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const vendor = useQuery(api.vendors.getCurrentVendor);


    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/signin");
        return null;
    }

    async function handleSignOut() {
        await signOut();
        router.push("/");
    }

    const roleBadge = user?.role === "admin"
        ? "bg-red-100 text-red-700"
        : user?.role === "vendor"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-700";

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
                                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadge}`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/track-order" className="block">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Package className="h-4 w-4" />
                                    Track Orders
                                </Button>
                            </Link>
                            <Link href="/cart" className="block">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    My Cart
                                </Button>
                            </Link>
                            {user?.role === "admin" && (
                                <Link href="/admin" className="block">
                                    <Button variant="outline" className="w-full justify-start gap-2">
                                        <Shield className="h-4 w-4" />
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleSignOut}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Vendor Section */}
                <div className="mt-8">
                    {vendor ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5" />
                                    Vendor Store
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{vendor.storeName}</h3>
                                        <p className="text-sm text-muted-foreground">{vendor.description || "No description"}</p>
                                        <div className="mt-2">
                                            {vendor.status === "approved" ? (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span>
                                            ) : vendor.status === "pending" ? (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pending Approval</span>
                                            ) : (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Rejected</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href="/vendors/dashboard">
                                            <Button>Dashboard</Button>
                                        </Link>
                                        <Link href="/vendors/products">
                                            <Button variant="outline">Products</Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <Store className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                <h3 className="font-semibold text-lg mb-1">Want to sell on WarmNest?</h3>
                                <p className="text-muted-foreground text-sm mb-4">Register as a vendor and start listing your products.</p>
                                <Link href="/vendors/register">
                                    <Button>Become a Vendor</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
