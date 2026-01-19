import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { productService } from "@/services/product.service";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";

interface FeaturedProductsProps {
  title: string;
  filter: "new" | "bestseller" | "sale";
  viewAllLink?: string;
}

export const FeaturedProducts = ({ title, filter, viewAllLink }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await productService.getFeatured(filter, 4);
        if (!mounted) return;
        setProducts(items as Product[]);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filter]);

  const filteredProducts = products;

  return (
    <section className="py-16 lg:py-24">
      <div className="container px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
            {title}
          </h2>
          {viewAllLink && (
            <Button variant="ghost" asChild>
              <Link to={viewAllLink} className="group">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
