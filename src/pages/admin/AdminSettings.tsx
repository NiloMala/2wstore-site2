import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { settingsService } from "@/services/settings.service";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [promoSettings, setPromoSettings] = useState({
    subtitle: "",
    title: "",
    description: "",
    link: "",
    showWithoutBanner: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const promo = await settingsService.getPromoDefaults();
      setPromoSettings(promo);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePromo = async () => {
    try {
      setIsSaving(true);
      await settingsService.updateMultiple([
        { key: "promo_default_subtitle", value: promoSettings.subtitle },
        { key: "promo_default_title", value: promoSettings.title },
        { key: "promo_default_description", value: promoSettings.description },
        { key: "promo_default_link", value: promoSettings.link },
        { key: "promo_show_without_banner", value: promoSettings.showWithoutBanner ? "true" : "false" },
      ]);

      toast({
        title: "Configurações salvas",
        description: "As configurações da seção promoção foram atualizadas.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Site</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os textos padrão e configurações do site.
        </p>
      </div>

      {/* Seção Promoção */}
      <Card>
        <CardHeader>
          <CardTitle>Seção Promoção (Padrão)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Estes textos serão exibidos quando não houver banner de promoção ativo.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar seção sem banner</Label>
              <p className="text-xs text-muted-foreground">
                Exibir a seção promoção mesmo quando não houver banner cadastrado
              </p>
            </div>
            <Switch
              checked={promoSettings.showWithoutBanner}
              onCheckedChange={(checked) =>
                setPromoSettings({ ...promoSettings, showWithoutBanner: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-subtitle">Subtítulo</Label>
            <Input
              id="promo-subtitle"
              value={promoSettings.subtitle}
              onChange={(e) =>
                setPromoSettings({ ...promoSettings, subtitle: e.target.value })
              }
              placeholder="🔥 Promoção Especial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-title">Título</Label>
            <Input
              id="promo-title"
              value={promoSettings.title}
              onChange={(e) =>
                setPromoSettings({ ...promoSettings, title: e.target.value })
              }
              placeholder="ATÉ 40% OFF EM PEÇAS SELECIONADAS"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-description">Descrição</Label>
            <Textarea
              id="promo-description"
              value={promoSettings.description}
              onChange={(e) =>
                setPromoSettings({ ...promoSettings, description: e.target.value })
              }
              placeholder="Aproveite descontos exclusivos na coleção de inverno. Por tempo limitado!"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-link">Link do botão</Label>
            <Input
              id="promo-link"
              value={promoSettings.link}
              onChange={(e) =>
                setPromoSettings({ ...promoSettings, link: e.target.value })
              }
              placeholder="/catalogo?filter=sale"
            />
            <p className="text-xs text-muted-foreground">
              URL para onde o botão "Aproveitar agora" vai direcionar
            </p>
          </div>

          <Button onClick={handleSavePromo} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar configurações
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Como funciona</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Se houver um <strong>banner de promoção ativo</strong>, os textos do banner serão exibidos</li>
            <li>• Se <strong>não houver banner</strong>, os textos configurados aqui serão usados como padrão</li>
            <li>• Você pode desativar a seção completamente quando não houver banner</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
