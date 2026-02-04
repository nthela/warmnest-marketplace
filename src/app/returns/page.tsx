import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
                <h1 className="text-3xl font-bold mb-2">Returns &amp; Refunds Policy</h1>
                <p className="text-sm text-muted-foreground mb-8">Effective Date: 03/02/2026</p>

                <div className="bg-white rounded-lg border p-6 md:p-10 space-y-8 text-sm leading-relaxed text-foreground">
                    <p>
                        Warmnest Marketplace (&ldquo;Warmnest&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an online marketplace where products may be sold either by Warmnest directly or by third-party sellers (&ldquo;Sellers&rdquo;). This policy explains how returns, refunds, and exchanges work when shopping on Warmnest Marketplace.
                    </p>
                    <p>By placing an order, you agree to the terms below.</p>

                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">1) Returns &ndash; General Rules</h2>
                        <p>We want you to shop with confidence. If you are not satisfied with your purchase, you may request a return in line with this policy and South African consumer laws.</p>
                        <p className="font-medium">Returns may be accepted for:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Incorrect item delivered</li>
                            <li>Damaged item on delivery</li>
                            <li>Defective or faulty item</li>
                            <li>Item not as described</li>
                            <li>Unwanted item (change of mind) (where applicable)</li>
                        </ul>
                        <p className="font-medium">All returns are subject to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>The product being returned within the return period</li>
                            <li>The product being in its original condition (unless faulty/damaged)</li>
                            <li>Proof of purchase (order number / invoice)</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">2) Return Timeframes</h2>

                        <h3 className="text-base font-semibold">2.1 Change of mind (Unwanted items)</h3>
                        <p>You may request a return within <strong>7 days</strong> of delivery, provided that:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>The item is unused, unwashed, and in original packaging</li>
                            <li>The item is still in resellable condition</li>
                            <li>All accessories, manuals, free gifts, and parts are included</li>
                        </ul>
                        <p className="text-muted-foreground italic">Note: Return shipping fees may apply for change-of-mind returns unless otherwise stated.</p>

                        <h3 className="text-base font-semibold">2.2 Damaged, defective, or incorrect items</h3>
                        <p>You must report the issue within <strong>48 hours</strong> of delivery, with clear photos/videos showing:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>The damage or fault</li>
                            <li>The packaging (if applicable)</li>
                            <li>The product label or identifying details</li>
                        </ul>
                        <p>If approved, you may qualify for a refund, replacement, or repair, depending on the product and supplier availability.</p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">3) Items That Cannot Be Returned</h2>
                        <p>For hygiene, safety, and legal reasons, the following items may not be eligible for return unless defective:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Products marked &ldquo;Final Sale&rdquo;, &ldquo;Clearance&rdquo;, or &ldquo;Non-Returnable&rdquo;</li>
                            <li>Used, washed, or altered items</li>
                            <li>Items missing original packaging or accessories</li>
                            <li>Gift cards / vouchers / digital products</li>
                            <li>Customised or made-to-order items (unless faulty)</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">4) How to Request a Return</h2>
                        <p>To request a return, please contact us at:</p>
                        <p className="font-medium">support@warmnest.co.za</p>
                        <p className="font-medium">Include:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Order number</li>
                            <li>Full name &amp; contact number</li>
                            <li>Item name(s)</li>
                            <li>Reason for return</li>
                            <li>Photos/videos (if damaged/defective/incorrect)</li>
                        </ul>
                        <p>Once approved, we will provide return instructions and the return address or collection details.</p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">5) Return Condition Requirements</h2>
                        <p>Returned items must be:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Packed securely to prevent damage during transit</li>
                            <li>Returned with all original components (tags, manuals, accessories)</li>
                            <li>In original condition (unless defective/damaged)</li>
                        </ul>
                        <p>Warmnest and/or the Seller reserves the right to reject returns that do not meet these requirements.</p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">6) Refunds</h2>

                        <h3 className="text-base font-semibold">6.1 Refund method</h3>
                        <p>Refunds are processed to the original payment method used at checkout (e.g., card, EFT, PayFast).</p>

                        <h3 className="text-base font-semibold">6.2 Refund processing time</h3>
                        <p>Once the returned item is received and inspected:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Refunds are typically processed within <strong>5&ndash;10 business days</strong></li>
                            <li>Banking processing times may vary depending on your bank/payment provider</li>
                        </ul>

                        <h3 className="text-base font-semibold">6.3 Partial refunds</h3>
                        <p>A partial refund may apply if:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>The item is returned in incomplete condition</li>
                            <li>The product is returned damaged due to poor packaging during return shipping</li>
                            <li>Accessories or original components are missing</li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">7) Exchanges</h2>
                        <p>Exchanges may be offered depending on product availability. If you request an exchange and the item is unavailable, we will issue a refund instead.</p>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">8) Return Shipping &amp; Collection Fees</h2>

                        <h3 className="text-base font-semibold">8.1 If the return is our fault (wrong item, defective, damaged)</h3>
                        <p>Warmnest or the Seller will cover the return shipping cost where applicable.</p>

                        <h3 className="text-base font-semibold">8.2 Change of mind returns</h3>
                        <p>The customer may be responsible for return shipping costs unless otherwise stated.</p>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">9) Marketplace Seller Products (Third-Party Sellers)</h2>
                        <p>Warmnest Marketplace includes products sold by independent Sellers.</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Some products are shipped directly by Sellers.</li>
                            <li>Returns may be handled by the Seller under this policy.</li>
                            <li>Warmnest may assist with communication and resolution, but the final approval may depend on the Seller&apos;s return conditions.</li>
                            <li>Warmnest reserves the right to suspend or restrict Sellers who do not meet customer service and return standards.</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">10) Faulty Goods &amp; Consumer Rights (South Africa)</h2>
                        <p>In line with the Consumer Protection Act (CPA), customers may have the right to return defective goods within a reasonable period, subject to assessment.</p>
                        <p>If a product is confirmed defective, you may be entitled to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Repair</li>
                            <li>Replacement</li>
                            <li>Refund</li>
                        </ul>
                        <p>This does not apply to damage caused by:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Misuse or negligence</li>
                            <li>Normal wear and tear</li>
                            <li>Incorrect installation or handling</li>
                            <li>Unauthorised repairs/modifications</li>
                        </ul>
                    </section>

                    {/* Section 11 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">11) Order Cancellations</h2>
                        <p>If your order has not yet been shipped, you may request a cancellation by contacting support immediately.</p>
                        <p>If the order has already been shipped, it will be treated as a return once delivered (subject to return eligibility).</p>
                    </section>

                    {/* Section 12 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">12) Contact Us</h2>
                        <p>For help with returns or refunds, contact:</p>
                        <p>support@warmnest.co.za</p>
                        <p>Warmnest Marketplace Support</p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
