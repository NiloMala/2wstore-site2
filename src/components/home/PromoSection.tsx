import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBanners } from "@/context/BannerContext";
import { useEffect, useState } from "react";
import { settingsService } from "@/services/settings.service";

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

  const backgroundImage = banner?.image_url;

  return (
    <section
      className="py-16 lg:py-24 overflow-hidden relative"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {/* Overlay escuro se tiver imagem, senão usa gradiente */}
      <div className={`absolute inset-0 ${backgroundImage ? 'bg-black/40' : 'bg-hero-gradient'}`} />

      <div className="container px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
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
            <Button variant="hero" size="xl" asChild>
              <Link to={linkUrl}>
                Aproveitar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
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
      </div>
    </section>
  );
};
