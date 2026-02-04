import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">About Warmnest Marketplace</h1>

                <div className="bg-white rounded-lg border p-6 md:p-10 space-y-6 text-sm leading-relaxed text-foreground">
                    <p>
                        Welcome to Warmnest Marketplace, your trusted destination for quality products at great value. We are a South African eCommerce store and marketplace offering a wide variety of items, including home essentials, lifestyle accessories, and more.
                    </p>
                    <p>
                        Warmnest Marketplace features products sold by Warmnest and approved third-party sellers, giving customers access to more choice in one place. Our goal is to create a safe, convenient shopping experience with secure checkout, reliable delivery partners, and customer-first support.
                    </p>
                    <p>
                        At Warmnest, we believe comfort is more than a product&mdash;it&apos;s a lifestyle. We&apos;re here to help you shop smarter, live better, and feel at home.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
