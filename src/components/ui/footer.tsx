import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

function PaymentIcon({ name, children }: { name: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded px-2 py-1 flex items-center justify-center h-8 min-w-[48px]" title={name}>
            {children}
        </div>
    );
}

export function Footer() {
    return (
        <footer className="text-white" style={{ backgroundColor: "#AD2731" }}>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand & About */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <Image src="/logo.png" alt="WarmNest Logo" width={150} height={40} className="object-contain brightness-0 invert" />
                        </Link>
                        <p className="text-white/80 text-sm leading-relaxed mb-4">
                            South Africa&apos;s premier multi-vendor marketplace. Connecting you with trusted local sellers for fashion, home decor, electronics, and more.
                        </p>
                        <div className="space-y-2 text-sm text-white/80">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>support@warmnest.co.za</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>+27 (0) 11 000 0000</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span>Johannesburg, South Africa</span>
                            </div>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link href="/shop?category=all" className="hover:text-white transition-colors">Categories</Link></li>
                            <li><Link href="/deals" className="hover:text-white transition-colors">Daily Deals</Link></li>
                            <li><Link href="/shop?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
                            <li><Link href="/shop?category=Fashion" className="hover:text-white transition-colors">Fashion</Link></li>
                            <li><Link href="/shop?category=Home+%26+Living" className="hover:text-white transition-colors">Home & Living</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Customer Service</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
                            <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Information</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Sell & Payment */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Sell on WarmNest</h4>
                        <ul className="space-y-2 text-sm text-white/80 mb-6">
                            <li><Link href="/vendors/register" className="hover:text-white transition-colors">Become a Vendor</Link></li>
                            <li><Link href="/vendors/dashboard" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
                            <li><Link href="/seller-guide" className="hover:text-white transition-colors">Seller Guide</Link></li>
                        </ul>

                        <h4 className="font-semibold text-lg mb-3">We Accept</h4>
                        <div className="flex flex-wrap gap-2">
                            <PaymentIcon name="Visa">
                                <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                                    <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                                    <path d="M19.5 21H17L18.5 11H21L19.5 21Z" fill="#FEFEFE"/>
                                    <path d="M28 11.2C27.4 11 26.5 10.8 25.4 10.8C22.9 10.8 21.1 12.1 21.1 14C21.1 15.4 22.3 16.2 23.3 16.7C24.3 17.2 24.6 17.5 24.6 17.9C24.6 18.5 23.9 18.8 23.2 18.8C22.2 18.8 21.7 18.7 20.9 18.3L20.6 18.2L20.3 20.1C20.9 20.4 21.9 20.6 23 20.6C25.7 20.6 27.4 19.3 27.4 17.3C27.4 16.2 26.7 15.3 25.2 14.6C24.3 14.1 23.8 13.8 23.8 13.4C23.8 13 24.2 12.6 25.1 12.6C25.9 12.6 26.5 12.7 27 13L27.3 13.1L28 11.2Z" fill="#FEFEFE"/>
                                    <path d="M31.5 11H29.5C28.9 11 28.4 11.2 28.2 11.8L24.5 21H27.2L27.7 19.5H31L31.3 21H33.7L31.5 11ZM28.5 17.5L29.8 13.8L30.5 17.5H28.5Z" fill="#FEFEFE"/>
                                    <path d="M16.5 11L14 17.9L13.7 16.5C13.2 14.8 11.6 13 9.8 12.1L12.1 21H14.8L19.2 11H16.5Z" fill="#FEFEFE"/>
                                    <path d="M12.5 11H8.5L8.5 11.2C11.7 12 13.8 13.9 14.5 16.2L13.7 11.9C13.6 11.2 13.1 11 12.5 11Z" fill="#F9A533"/>
                                </svg>
                            </PaymentIcon>
                            <PaymentIcon name="Mastercard">
                                <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                                    <rect width="48" height="32" rx="4" fill="#252525"/>
                                    <circle cx="20" cy="16" r="8" fill="#EB001B"/>
                                    <circle cx="28" cy="16" r="8" fill="#F79E1B"/>
                                    <path d="M24 10.3C25.8 11.7 27 13.7 27 16C27 18.3 25.8 20.3 24 21.7C22.2 20.3 21 18.3 21 16C21 13.7 22.2 11.7 24 10.3Z" fill="#FF5F00"/>
                                </svg>
                            </PaymentIcon>
                            <PaymentIcon name="PayFast">
                                <span className="text-[10px] font-bold text-[#00457C]">PayFast</span>
                            </PaymentIcon>
                            <PaymentIcon name="SnapScan">
                                <span className="text-[10px] font-bold text-[#00A3E0]">SnapScan</span>
                            </PaymentIcon>
                            <PaymentIcon name="Ozow">
                                <span className="text-[10px] font-bold text-[#00B0FF]">Ozow</span>
                            </PaymentIcon>
                            <PaymentIcon name="EFT">
                                <span className="text-[10px] font-bold text-gray-700">EFT</span>
                            </PaymentIcon>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/20">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
                    <p>&copy; {new Date().getFullYear()} WarmNest Marketplace. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
