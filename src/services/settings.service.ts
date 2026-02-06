import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export const settingsService = {
  async getAll(): Promise<SiteSetting[]> {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("key");

    if (error) throw error;
    return data || [];
  },

  async getByKey(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) return null;
    return data?.value || null;
  },

  async getPromoDefaults(): Promise<{
    subtitle: string;
    title: string;
    description: string;
    link: string;
    showWithoutBanner: boolean;
  }> {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .like("key", "promo_%");

    if (error || !data) {
      return {
        subtitle: "🔥 Promoção Especial",
        title: "ATÉ 40% OFF EM PEÇAS SELECIONADAS",
        description: "Aproveite descontos exclusivos na coleção de inverno. Por tempo limitado!",
        link: "/catalogo?filter=sale",
        showWithoutBanner: true,
      };
    }

    const settings: Record<string, string> = {};
    data.forEach((s) => {
      settings[s.key] = s.value;
    });

    return {
      subtitle: settings["promo_default_subtitle"] || "🔥 Promoção Especial",
      title: settings["promo_default_title"] || "ATÉ 40% OFF EM PEÇAS SELECIONADAS",
      description: settings["promo_default_description"] || "Aproveite descontos exclusivos na coleção de inverno. Por tempo limitado!",
      link: settings["promo_default_link"] || "/catalogo?filter=sale",
      showWithoutBanner: settings["promo_show_without_banner"] !== "false",
    };
  },

  async update(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from("site_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) throw error;
  },

  async updateMultiple(updates: { key: string; value: string }[]): Promise<void> {
    for (const update of updates) {
      await this.update(update.key, update.value);
    }
  },
};
