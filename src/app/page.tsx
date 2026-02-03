import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary/10 py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Discover Unique Products from <span className="text-primary">Trusted Vendors</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              WarmNest is South Africa's premier marketplace connecting you with the best local sellers. Shop fashion, home decor, electronics, and more.
            </p>
            <div className="flex gap-4">
              <Link href="/shop">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/vendors/register">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </section>

        {/* Categories Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys"].map((category) => (
              <Link key={category} href={`/shop?category=${category}`} className="group">
                <Card className="h-32 flex items-center justify-center bg-card hover:bg-accent/50 transition-colors cursor-pointer border-none shadow-sm">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{category}</span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/shop" className="text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Product Image
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Category</div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">Product Name {i}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">R {99 * i}.00</span>
                      <div className="flex items-center text-yellow-500 text-sm">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-muted-foreground">4.5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vendor CTA */}
        <section className="py-20 bg-primary/95 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Grow Your Business with WarmNest</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
              Join thousands of sellers and reach millions of customers. We handle the payments and marketing while you focus on what you love.
            </p>
            <Button variant="secondary" size="lg" className="h-12 px-8 text-primary font-bold">
              Start Selling Today
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
