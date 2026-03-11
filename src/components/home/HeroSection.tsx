import { useBanners } from "@/context/BannerContext";
import heroBanner from "@/assets/hero-banner.jpg";

export const HeroSection = () => {
  const { getActiveBanner, loading } = useBanners();
  const banner = getActiveBanner("hero");

  // Se ainda está carregando e não há banner em cache, mostra placeholder
  // para evitar flash do banner local antes do banner real aparecer
  const hasBanner = !loading || banner;
  const backgroundImage = banner?.image_url || heroBanner;
  const mobileBackgroundImage = banner?.mobile_image_url || backgroundImage;

  return (
    <section className="relative w-full overflow-hidden pt-16 lg:pt-20">
      {loading && !banner ? (
        // Placeholder com proporção similar ao banner enquanto carrega
        <div className="w-full bg-muted animate-pulse" style={{ aspectRatio: "16/6" }} />
      ) : (
        <picture className="w-full block">
          {/* Mobile: portrait image shown on screens smaller than 640px */}
          <source media="(max-width: 639px)" srcSet={mobileBackgroundImage} />
          {/* Desktop: landscape image */}
          <img
            src={backgroundImage}
            alt="2WL Store Hero"
            className="w-full h-auto block"
          />
        </picture>
      )}

      {/* Scroll indicator */}
      {!loading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-secondary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-secondary-foreground/50 rounded-full" />
          </div>
        </div>
      )}
    </section>
  );
};
