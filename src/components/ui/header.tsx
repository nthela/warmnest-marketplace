"use client";

import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
    const pathname = usePathname();
    const { isAuthenticated } = useConvexAuth();

    const isActive = (path: string) => {
        return pathname === path ? "text-primary font-bold" : "text-muted-foreground hover:text-primary transition-colors";
    };

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
                    {isAuthenticated && (
                        <Link href="/vendors" className={isActive("/vendors")}>
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

                    <Link href={isAuthenticated ? "/account" : "/signin"}>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </Link>

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
                                <Link href="/" className={`text-lg font-medium ${pathname === "/" ? "text-primary" : ""}`}>
                                    Home
                                </Link>
                                <Link href="/shop" className={`text-lg font-medium ${pathname === "/shop" ? "text-primary" : ""}`}>
                                    Shop
                                </Link>
                                {isAuthenticated && (
                                    <Link href="/vendors" className={`text-lg font-medium ${pathname === "/vendors" ? "text-primary" : ""}`}>
                                        Vendors
                                    </Link>
                                )}
                                <Link href="/track-order" className={`text-lg font-medium ${pathname === "/track-order" ? "text-primary" : ""}`}>
                                    Track Order
                                </Link>
                                <hr className="my-2" />
                                <Link href={isAuthenticated ? "/account" : "/signin"} className="text-lg font-medium">
                                    {isAuthenticated ? "My Account" : "Sign In"}
                                </Link>
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
