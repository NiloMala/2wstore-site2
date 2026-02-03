import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBanners } from "@/context/BannerContext";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import heroBanner from "@/assets/hero-banner.jpg";

export const HeroSection = () => {
  const { getActiveBanner } = useBanners();
  const banner = getActiveBanner("hero");

  const backgroundImage = banner?.image_url || heroBanner;
  const linkUrl = banner?.link_url || "/catalogo";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="2WL Store Hero"
          className="w-full h-full object-cover"
        />
      </div>

      {/* CTAs e Trust badges - centralizados na base */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 sm:gap-6 w-full px-4 sm:px-0 sm:w-auto">
        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button variant="hero" size="lg" className="sm:size-xl sm:h-14 sm:px-10 sm:text-lg" asChild>
            <Link to={linkUrl}>
              Comprar agora
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <Button variant="hero" size="lg" className="sm:size-xl sm:h-14 sm:px-10 sm:text-lg" asChild>
            <Link to="/catalogo?filter=new">
              Ver lançamentos
            </Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:gap-6 text-secondary-foreground/70 text-xs sm:text-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-xl">🚚</span>
            Frete grátis +R$600
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-xl">💳</span>
            <span className="flex items-center">
              5% OFF no Pix
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-primary cursor-help select-none">*</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Na primeira compra</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-xl">🔄</span>
            Troca fácil
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-secondary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-secondary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
