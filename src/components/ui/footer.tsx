"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function PaymentIcon({ name, children }: { name: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded px-2 py-1 flex items-center justify-center h-8 min-w-[48px]" title={name}>
            {children}
        </div>
    );
}

export function Footer() {
    const contactInfo = useQuery(api.siteSettings.getContactInfo);

    const email = contactInfo?.contactEmail;
    const phone = contactInfo?.contactPhone;
    const whatsapp = contactInfo?.contactWhatsApp;
    const address = contactInfo?.contactAddress;
    const facebook = contactInfo?.contactFacebook;
    const instagram = contactInfo?.contactInstagram;
    const twitter = contactInfo?.contactTwitter;

    const hasContact = email || phone || whatsapp || address;
    const hasSocial = facebook || instagram || twitter;

    return (
        <footer className="bg-black text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand & Contact */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <Image src="/logo.png" alt="WarmNest Logo" width={150} height={40} className="object-contain brightness-0 invert" />
                        </Link>
                        <p className="text-white/80 text-sm leading-relaxed mb-4">
                            South Africa&apos;s premier multi-vendor marketplace. Connecting you with trusted local sellers for fashion, home decor, electronics, and more.
                        </p>
                        {hasContact && (
                            <div className="space-y-2 text-sm text-white/80">
                                {email && (
                                    <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[#C8A165] transition-colors">
                                        <Mail className="h-4 w-4 shrink-0" />
                                        <span>{email}</span>
                                    </a>
                                )}
                                {phone && (
                                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-[#C8A165] transition-colors">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <span>{phone}</span>
                                    </a>
                                )}
                                {whatsapp && (
                                    <a
                                        href={`https://wa.me/${whatsapp.replace(/[^0-9+]/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-[#C8A165] transition-colors"
                                    >
                                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        <span>WhatsApp</span>
                                    </a>
                                )}
                                {address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span>{address}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {hasSocial && (
                            <div className="flex items-center gap-3 mt-4">
                                {facebook && (
                                    <a href={facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C8A165] transition-colors" title="Facebook">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                )}
                                {instagram && (
                                    <a href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C8A165] transition-colors" title="Instagram">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    </a>
                                )}
                                {twitter && (
                                    <a href={twitter.startsWith("http") ? twitter : `https://x.com/${twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C8A165] transition-colors" title="Twitter / X">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 text-[#C8A165]">Shop</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link href="/shop" className="hover:text-[#C8A165] transition-colors">All Products</Link></li>
                            <li><Link href="/shop?category=all" className="hover:text-[#C8A165] transition-colors">Categories</Link></li>
                            <li><Link href="/deals" className="hover:text-[#C8A165] transition-colors">Daily Deals</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 text-[#C8A165]">Customer Service</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link href="/track-order" className="hover:text-[#C8A165] transition-colors">Track Your Order</Link></li>
                            <li><Link href="/returns" className="hover:text-[#C8A165] transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/about" className="hover:text-[#C8A165] transition-colors">About Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-[#C8A165] transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Sell & Payment */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 text-[#C8A165]">Sell on WarmNest</h4>
                        <ul className="space-y-2 text-sm text-white/70 mb-6">
                            <li><Link href="/vendors/register" className="hover:text-[#C8A165] transition-colors">Become a Vendor</Link></li>
                            <li><Link href="/vendors/dashboard" className="hover:text-[#C8A165] transition-colors">Vendor Dashboard</Link></li>
                        </ul>

                        <h4 className="font-semibold text-lg mb-3 text-[#C8A165]">We Accept</h4>
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
                        <Link href="/privacy" className="hover:text-[#C8A165] transition-colors">Privacy</Link>
                        <Link href="/returns" className="hover:text-[#C8A165] transition-colors">Returns</Link>
                        <Link href="/about" className="hover:text-[#C8A165] transition-colors">About</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
