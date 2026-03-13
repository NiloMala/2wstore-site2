import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/context/BannerContext";
import { useEffect, useState } from "react";
import { settingsService } from "@/services/settings.service";
import { useSwipe } from "@/hooks/use-swipe";

interface PromoDefaults {
  subtitle: string;
  title: string;
  description: string;
  link: string;
  showWithoutBanner: boolean;
}

export const PromoSection = () => {
  const { getActiveBanner, loading } = useBanners();
  const banner = getActiveBanner("promo");

  const [defaults, setDefaults] = useState<PromoDefaults>({
    subtitle: "🔥 Promoção Especial",
    title: "ATÉ 40% OFF EM PEÇAS SELECIONADAS",
    description: "Aproveite descontos exclusivos na coleção de inverno. Por tempo limitado!",
    link: "/catalogo?filter=sale",
    showWithoutBanner: true,
  });

  // Carousel state
  const [slide, setSlide] = useState(0);

  const desktopImages = [
    ...(banner?.image_url ? [banner.image_url] : []),
    ...(banner?.image_url_2 ? [banner.image_url_2] : []),
  ];

  const mobileImages = banner?.mobile_image_url_2
    ? [
        banner.mobile_image_url || banner?.image_url || "",
        banner.mobile_image_url_2,
      ]
    : [banner?.mobile_image_url || desktopImages[0] || ""];

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

  useEffect(() => { setSlide(0); }, [banner?.id]);

  useEffect(() => {
    settingsService.getPromoDefaults().then(setDefaults).catch(console.error);
  }, []);

  // Se não deve mostrar sem banner e não tem banner, não renderiza
  if (!banner && !defaults.showWithoutBanner) {
    return null;
  }

  const title = banner?.title || defaults.title;
  const subtitle = banner?.subtitle || defaults.subtitle;
  const description = banner?.description || defaults.description;
  const linkUrl = banner?.link_url || defaults.link;

  // Split title for better display
  const titleParts = title.split(" ");
  const midPoint = Math.ceil(titleParts.length / 2);
  const firstLine = titleParts.slice(0, midPoint).join(" ");
  const secondLine = titleParts.slice(midPoint).join(" ");

  // Cronômetro funcional
  const [timer, setTimer] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00", ended: false });
  useEffect(() => {
    if (!banner?.ends_at) return;
    const update = () => {
      const now = new Date();
      const end = new Date(banner.ends_at);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTimer({ days: "00", hours: "00", minutes: "00", seconds: "00", ended: true });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimer({
        days: d.toString().padStart(2, "0"),
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
        ended: false,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [banner?.ends_at]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background carousel / static image */}
      {desktopImages.length > 0 ? (
        <div
          className="relative w-full cursor-grab active:cursor-grabbing select-none"
          {...(hasCarousel ? swipe : {})}
        >
          {/* Invisible anchor for height */}
          <picture className="invisible pointer-events-none select-none" aria-hidden="true">
            <source media="(max-width: 639px)" srcSet={mobileImages[0] || undefined} />
            <img src={desktopImages[0]} alt="" className="w-full h-auto block" />
          </picture>

          {desktopImages.map((src, i) => {
            const mobileSrc = mobileImages[Math.min(i, mobileImages.length - 1)];
            return (
              <picture
                key={i}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`}
              >
                <source media="(max-width: 639px)" srcSet={mobileSrc || undefined} />
                <img src={src} alt="" className="w-full h-full object-cover block" />
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
                    i === slide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Slide ${i + 1}`}
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
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % desktopImages.length)}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label="Próximo slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full py-16 lg:py-24 bg-hero-gradient" />
      )}

      {/* Conteúdo sobreposto */}
      <div className="absolute inset-0 flex items-end pb-8 lg:pb-12 z-10">
        <div className="w-full px-4 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            {/* Texto - só desktop */}
            <div className="hidden lg:flex lg:flex-row items-end justify-between gap-16 w-full max-w-screen-xl mx-auto">
              <div className="flex-1 text-left">
                <span className="inline-block px-4 py-2 bg-primary-foreground/20 text-primary-foreground rounded-full text-sm font-bold uppercase tracking-wider mb-6">
                  {subtitle}
                </span>
                <h2 className="text-3xl lg:text-5xl font-black text-primary-foreground leading-tight mb-4">
                  {firstLine}
                  <br />
                  {secondLine}
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                  {description}
                </p>
                {(banner?.show_cta_button ?? true) && (
                  <Button variant="hero" size="xl" asChild>
                    <Link to={linkUrl}>
                      Aproveitar agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Timer - só mostra se tiver data definida */}
              {banner?.ends_at && (
                <div className="flex gap-4">
                  {[
                    { value: timer.days, label: "Dias" },
                    { value: timer.hours, label: "Horas" },
                    { value: timer.minutes, label: "Min" },
                    { value: timer.seconds, label: "Seg" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[70px]"
                    >
                      <div className="text-2xl lg:text-4xl font-black text-primary-foreground">
                        {item.value}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-primary-foreground/70 mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botão centralizado - mobile */}
            <div className="flex justify-center w-full lg:hidden">
              {(banner?.show_cta_button ?? true) && (
                <Button variant="hero" size="xl" asChild>
                  <Link to={linkUrl}>
                    Aproveitar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
