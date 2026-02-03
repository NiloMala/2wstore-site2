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
  const title = banner?.title || "ESTILO QUE DOMINA A RUA";
  const subtitle = banner?.subtitle || "Nova Coleção 2026";
  const description = banner?.description || "Moda urbana para quem não segue tendências, mas as cria. Vista-se com atitude e autenticidade.";
  const linkUrl = banner?.link_url || "/catalogo";

  // Parse title to handle line breaks (split by space for multi-line effect)
  const titleParts = title.split(" ");
  const midPoint = Math.ceil(titleParts.length / 2);
  const firstLine = titleParts.slice(0, midPoint).join(" ");
  const secondLine = titleParts.slice(midPoint).join(" ");

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="2WL Store Hero"
          className="w-full h-full object-cover"
        />
        {/* Máscara removida */}
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 lg:px-8 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full text-primary-foreground mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              {subtitle}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-secondary-foreground leading-none mb-6 animate-slide-up">
            {firstLine}
            <br />
            <span className="text-primary">{secondLine}</span>
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to={linkUrl}>
                Comprar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero" size="xl" asChild>
              <Link to="/catalogo?filter=new">
                Ver lançamentos
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-12 text-secondary-foreground/70 text-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              Frete grátis +R$600,00
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
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
            <div className="flex items-center gap-2">
              <span className="text-xl">🔄</span>
              Troca fácil
            </div>
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
