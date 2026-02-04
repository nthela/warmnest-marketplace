"use client";

import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Search, ShoppingCart, User, Menu, LogOut, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    const user = useQuery(api.users.currentUser);

    const isActive = (path: string) => {
        return pathname === path ? "text-primary font-bold" : "text-muted-foreground hover:text-primary transition-colors";
    };

    async function handleSignOut() {
        await signOut();
        router.push("/");
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="WarmNest Logo" width={150} height={40} className="object-contain" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className={isActive("/")}>
                        Home
                    </Link>
                    <Link href="/shop" className={isActive("/shop")}>
                        Shop
                    </Link>
                    <Link href="/shop?category=all" className={isActive("/categories")}>
                        Categories
                    </Link>
                    <Link href="/deals" className={isActive("/deals")}>
                        Deals
                    </Link>
                    {isAuthenticated && (
                        <Link href="/vendors/dashboard" className={isActive("/vendors")}>
                            Vendors
                        </Link>
                    )}
                    <Link href="/track-order" className={isActive("/track-order")}>
                        Track Order
                    </Link>
                </nav>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-sm items-center gap-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="w-full pl-8 bg-muted/50"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                    </Button>

                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                0
                            </span>
                        </Button>
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            My Account
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/track-order" className="cursor-pointer">
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            My Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    {(user.role === "vendor" || user.vendorId) && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/vendors/dashboard" className="cursor-pointer">
                                                <Store className="mr-2 h-4 w-4" />
                                                Vendor Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user.role === "admin" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer">
                                                <Shield className="mr-2 h-4 w-4" />
                                                Admin
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" size="icon" className="relative" disabled>
                                <div className="h-8 w-8 rounded-full bg-primary/10 animate-pulse" />
                            </Button>
                        )
                    ) : (
                        <Link href="/signin">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden md:inline">Sign In</span>
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-8">
                                {isAuthenticated && user && (
                                    <>
                                        <div className="flex items-center gap-3 pb-2">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-bold text-primary">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        <hr />
                                    </>
                                )}
                                <Link href="/" className={`text-lg font-medium ${pathname === "/" ? "text-primary" : ""}`}>
                                    Home
                                </Link>
                                <Link href="/shop" className={`text-lg font-medium ${pathname === "/shop" ? "text-primary" : ""}`}>
                                    Shop
                                </Link>
                                <Link href="/shop?category=all" className="text-lg font-medium">
                                    Categories
                                </Link>
                                <Link href="/deals" className={`text-lg font-medium ${pathname === "/deals" ? "text-primary" : ""}`}>
                                    Deals
                                </Link>
                                {isAuthenticated && (
                                    <Link href="/vendors/dashboard" className={`text-lg font-medium ${pathname?.startsWith("/vendors") ? "text-primary" : ""}`}>
                                        Vendors
                                    </Link>
                                )}
                                <Link href="/track-order" className={`text-lg font-medium ${pathname === "/track-order" ? "text-primary" : ""}`}>
                                    Track Order
                                </Link>
                                <hr className="my-2" />
                                {isAuthenticated ? (
                                    <>
                                        <Link href="/account" className="text-lg font-medium">
                                            My Account
                                        </Link>
                                        <button onClick={handleSignOut} className="text-lg font-medium text-red-600 text-left">
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/signin" className="text-lg font-medium">
                                        Sign In
                                    </Link>
                                )}
                                <Link href="/cart" className="text-lg font-medium">
                                    Cart
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
