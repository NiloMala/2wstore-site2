import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { bannersService, Banner } from "@/services/banners.service";

interface BannerContextType {
  banners: Banner[];
  loading: boolean;
  getActiveBanner: (position: Banner["position"]) => Banner | undefined;
  addBanner: (banner: Omit<Banner, "id">) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;
  reorderBanners: (newOrder: Banner[]) => void;
  refetch: () => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: ReactNode }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersService.getAllAdmin();
      const now = new Date();
      // Filtra apenas os ativos E dentro do período válido
      setBanners((data || []).filter((b: any) => {
        if (!b.is_active) return false;
        // Verifica data de início
        if (b.starts_at && new Date(b.starts_at) > now) return false;
        // Verifica data de término
        if (b.ends_at && new Date(b.ends_at) <= now) return false;
        return true;
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const getActiveBanner = (position: Banner["position"]) => {
    return banners
      .filter((b) => b.position === position)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0];
  };

  const addBanner = (banner: Omit<Banner, "id">) => {
    const newBanner: Banner = {
      ...banner,
      id: Date.now().toString(),
    };
    setBanners((prev) => [...prev, newBanner]);
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const reorderBanners = (newOrder: Banner[]) => {
    setBanners(newOrder);
  };

  return (
    <BannerContext.Provider
      value={{
        banners,
        loading,
        getActiveBanner,
        addBanner: () => {},
        updateBanner: () => {},
        deleteBanner: () => {},
        toggleBannerActive: () => {},
        reorderBanners: () => {},
        refetch: fetchBanners,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error("useBanners must be used within a BannerProvider");
  }
  return context;
};
