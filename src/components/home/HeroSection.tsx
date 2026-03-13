import { useBanners } from "@/context/BannerContext";
import { useEffect, useState } from "react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useSwipe } from "@/hooks/use-swipe";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const HeroSection = () => {
  const { getActiveBanner, loading } = useBanners();
  const banner = getActiveBanner("hero");
  const [slide, setSlide] = useState(0);

  const desktopImages = [
    banner?.image_url || heroBanner,
    ...(banner?.image_url_2 ? [banner.image_url_2] : []),
  ];

  const mobileImages = banner?.mobile_image_url_2
    ? [
        banner.mobile_image_url || banner?.image_url || heroBanner,
        banner.mobile_image_url_2,
      ]
    : [banner?.mobile_image_url || desktopImages[0]];

  const hasCarousel = desktopImages.length > 1;

  const swipe = useSwipe(
    () => setSlide((s) => (s + 1) % desktopImages.length),
    () => setSlide((s) => (s - 1 + desktopImages.length) % desktopImages.length)
  );

  useEffect(() => {
    if (!hasCarousel) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % desktopImages.length), 5000);
    return () => clearInterval(id);
  }, [hasCarousel, desktopImages.length]);

  // Reset slide when banner changes
  useEffect(() => { setSlide(0); }, [banner?.id]);

  return (
    <section className="relative w-full overflow-hidden pt-16 lg:pt-20">
      {loading && !banner ? (
        <div className="w-full bg-muted animate-pulse" style={{ aspectRatio: "16/6" }} />
      ) : (
        <div
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
          {...(hasCarousel ? swipe : {})}
        >
          {/* Invisible height reference (first image defines container height) */}
          <picture className="invisible pointer-events-none select-none" aria-hidden="true">
            <source media="(max-width: 639px)" srcSet={mobileImages[0]} />
            <img src={desktopImages[0]} alt="" className="w-full h-auto block" />
          </picture>

          {/* All slides overlaid */}
          {desktopImages.map((src, i) => {
            const mobileSrc = mobileImages[Math.min(i, mobileImages.length - 1)];
            return (
              <picture
                key={i}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`}
              >
                <source media="(max-width: 639px)" srcSet={mobileSrc} />
                <img
                  src={src}
                  alt={`2WL Store Hero ${i + 1}`}
                  className="w-full h-full object-cover block"
                />
              </picture>
            );
          })}

          {/* Carousel dots */}
          {hasCarousel && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {desktopImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === slide
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Prev / Next arrows — desktop only */}
          {hasCarousel && (
            <>
              <button
                onClick={() => setSlide((s) => (s - 1 + desktopImages.length) % desktopImages.length)}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label="Banner anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % desktopImages.length)}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label="Próximo banner"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
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
