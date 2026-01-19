import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PromoSection } from "@/components/home/PromoSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <CategoriesSection />

      {/* New Arrivals */}
      <FeaturedProducts
        title="Lançamentos"
        filter="new"
        viewAllLink="/catalogo?filter=new"
      />

      {/* Promo Banner */}
      <PromoSection />

      {/* Best Sellers */}
      <FeaturedProducts
        title="Mais Vendidos"
        filter="bestseller"
        viewAllLink="/catalogo?filter=bestseller"
      />

      {/* Sale Items */}
      <div className="bg-muted">
        <FeaturedProducts
          title="Promoções"
          filter="sale"
          viewAllLink="/catalogo?filter=sale"
        />
      </div>
    </main>
  );
};

export default Index;
