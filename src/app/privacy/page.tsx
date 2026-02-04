import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-8">Effective Date: 02/03/2026</p>

                <div className="bg-white rounded-lg border p-6 md:p-10 space-y-8 text-sm leading-relaxed text-foreground">
                    <p>
                        Warmnest Marketplace (&ldquo;Warmnest&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal information.
                    </p>
                    <p>
                        This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our website, mobile services, or any related platforms (collectively, the &ldquo;Platform&rdquo;).
                    </p>
                    <p>By using Warmnest Marketplace, you agree to this Privacy Policy.</p>

                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">1) Who We Are</h2>
                        <p>Warmnest Marketplace is an online marketplace where products may be sold by:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Warmnest directly, and/or</li>
                            <li>Third-party sellers (&ldquo;Sellers&rdquo;) operating on the Warmnest Marketplace platform.</li>
                        </ul>
                        <div className="space-y-1">
                            <p><strong>Business Name:</strong> Warmnest Marketplace</p>
                            <p><strong>Website:</strong> www.warmnest.co.za</p>
                            <p><strong>Email:</strong> support@warmnest.co.za</p>
                            <p><strong>Location:</strong> South Africa</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">2) What Personal Information We Collect</h2>
                        <p>We may collect the following personal information:</p>

                        <h3 className="text-base font-semibold">2.1 Information you provide to us</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Full name and surname</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Delivery address and billing address</li>
                            <li>ID number (only if required for verification or compliance)</li>
                            <li>Account login details (username/password)</li>
                            <li>Payment confirmation details (we do not store full card details)</li>
                            <li>Order history and product preferences</li>
                            <li>Messages you send to our support team or Sellers</li>
                        </ul>

                        <h3 className="text-base font-semibold">2.2 Information collected automatically</h3>
                        <p>When you use our Platform, we may collect:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>IP address</li>
                            <li>Device type and browser type</li>
                            <li>Location data (approximate)</li>
                            <li>Pages visited and time spent on the site</li>
                            <li>Referral links and interactions</li>
                            <li>Cookies and tracking data (see Cookies section)</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">3) Why We Collect Your Information (Purpose)</h2>
                        <p>We collect and use your personal information to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Create and manage your Warmnest account</li>
                            <li>Process orders and payments</li>
                            <li>Deliver products to your address</li>
                            <li>Provide customer support and handle queries</li>
                            <li>Communicate order updates (email/SMS/WhatsApp)</li>
                            <li>Process returns, refunds, and disputes</li>
                            <li>Prevent fraud and improve security</li>
                            <li>Improve our website performance and user experience</li>
                            <li>Offer promotions and marketing (only where allowed and you can opt out)</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">4) Legal Basis for Processing (POPIA)</h2>
                        <p>We process your personal information in accordance with the Protection of Personal Information Act (POPIA) and applicable South African laws.</p>
                        <p>We process your information because:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>It is necessary to fulfill a contract (your order)</li>
                            <li>You have given consent (e.g., marketing communications)</li>
                            <li>We have a legal obligation (e.g., tax, fraud prevention)</li>
                            <li>It is in our legitimate interest (improving services and platform security)</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">5) How We Share Your Information</h2>
                        <p><strong>We do not sell your personal information.</strong></p>
                        <p>We may share your information with trusted third parties only when necessary, including:</p>

                        <h3 className="text-base font-semibold">5.1 Sellers (Third-party vendors)</h3>
                        <p>If you purchase a product from a Seller, we may share necessary details such as:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Your name</li>
                            <li>Delivery address</li>
                            <li>Phone number</li>
                            <li>Order details</li>
                        </ul>
                        <p>This allows the Seller to fulfill and deliver your order.</p>

                        <h3 className="text-base font-semibold">5.2 Payment providers</h3>
                        <p>Payments are processed through secure payment gateways such as PayFast. We do not store your full card details.</p>

                        <h3 className="text-base font-semibold">5.3 Shipping and delivery partners</h3>
                        <p>We may share delivery information with our courier/shipping partners such as Shiprazor and other logistics providers.</p>

                        <h3 className="text-base font-semibold">5.4 Service providers</h3>
                        <p>We may use third-party providers for:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Website hosting and maintenance</li>
                            <li>Analytics and reporting</li>
                            <li>Customer support tools</li>
                            <li>Email/SMS notifications</li>
                        </ul>

                        <h3 className="text-base font-semibold">5.5 Legal requirements</h3>
                        <p>We may disclose personal information if required by law or to protect:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Our rights</li>
                            <li>Customer safety</li>
                            <li>Fraud prevention</li>
                            <li>Compliance investigations</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">6) Cookies &amp; Tracking Technologies</h2>
                        <p>Warmnest Marketplace uses cookies and similar technologies to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Keep you logged in</li>
                            <li>Remember your cart and preferences</li>
                            <li>Improve site performance</li>
                            <li>Measure marketing effectiveness</li>
                        </ul>
                        <p>You can control cookies in your browser settings. Disabling cookies may affect how the Platform functions.</p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">7) Marketing Communications</h2>
                        <p>We may send you marketing messages (email/SMS/WhatsApp) about:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>New products</li>
                            <li>Discounts and promotions</li>
                            <li>Warmnest Marketplace updates</li>
                        </ul>
                        <p>You can opt out anytime by:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Clicking &ldquo;unsubscribe&rdquo; in emails</li>
                            <li>Replying STOP to SMS messages (where available)</li>
                            <li>Contacting us directly at support@warmnest.co.za</li>
                        </ul>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">8) How We Protect Your Information</h2>
                        <p>We use reasonable technical and organisational measures to protect your personal information, including:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Secure servers and encryption where applicable</li>
                            <li>Limited access to personal data</li>
                            <li>Monitoring for suspicious activity</li>
                            <li>Secure payment processing through trusted providers</li>
                        </ul>
                        <p>However, no online system is 100% secure. You use the Platform at your own risk.</p>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">9) How Long We Keep Your Information</h2>
                        <p>We keep your personal information only for as long as necessary to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide our services</li>
                            <li>Meet legal and tax obligations</li>
                            <li>Resolve disputes</li>
                            <li>Enforce our agreements</li>
                        </ul>
                        <p>Once no longer needed, we securely delete or anonymise it.</p>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">10) Your Rights (POPIA)</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your information (where legally allowed)</li>
                            <li>Object to processing in certain cases</li>
                            <li>Withdraw consent for marketing communications</li>
                            <li>Lodge a complaint with the Information Regulator (South Africa)</li>
                        </ul>
                        <p>To request any of the above, contact: <strong>support@warmnest.co.za</strong></p>
                    </section>

                    {/* Section 11 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">11) Third-Party Links</h2>
                        <p>Our Platform may contain links to third-party websites or services. Warmnest is not responsible for the privacy practices of those platforms. Please review their privacy policies separately.</p>
                    </section>

                    {/* Section 12 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">12) Children&apos;s Privacy</h2>
                        <p>Warmnest Marketplace is not intended for children under 18. We do not knowingly collect personal information from minors.</p>
                    </section>

                    {/* Section 13 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">13) Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with a new effective date.</p>
                        <p>We encourage you to review this policy regularly.</p>
                    </section>

                    {/* Section 14 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">14) Contact Us</h2>
                        <p>If you have questions about this Privacy Policy or your personal information, contact:</p>
                        <p>support@warmnest.co.za</p>
                        <p>Warmnest Marketplace &ndash; South Africa</p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
