import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { bannersService, storageService } from "@/services";
import type { Banner, BannerPosition } from "@/services";
import { useToast } from "@/hooks/use-toast";

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    imageUrl2: "",
    mobileImageUrl: "",
    mobileImageUrl2: "",
    linkUrl: "",
    position: "hero" as BannerPosition,
    isActive: true,
    showCtaButton: true,
    endsAt: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [selectedMobileFile, setSelectedMobileFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
  const [selectedMobileFile2, setSelectedMobileFile2] = useState<File | null>(null);
  const [mobileImagePreview2, setMobileImagePreview2] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const data = await bannersService.getAllAdmin();
      setBanners(data || []);
    } catch (error) {
      console.error("Error loading banners:", error);
      toast({
        title: "Erro ao carregar banners",
        description: "Não foi possível carregar a lista de banners.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      imageUrl2: "",
      mobileImageUrl: "",
      mobileImageUrl2: "",
      linkUrl: "",
      position: "hero",
      isActive: true,
      showCtaButton: true,
      endsAt: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setSelectedFile2(null);
    setImagePreview2(null);
    setSelectedMobileFile(null);
    setMobileImagePreview(null);
    setSelectedMobileFile2(null);
    setMobileImagePreview2(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      imageUrl: banner.image_url || "",
      imageUrl2: banner.image_url_2 || "",
      mobileImageUrl: banner.mobile_image_url || "",
      mobileImageUrl2: banner.mobile_image_url_2 || "",
      linkUrl: banner.link_url || "",
      position: banner.position as BannerPosition,
      isActive: banner.is_active ?? true,
      showCtaButton: banner.show_cta_button ?? true,
      endsAt: banner.ends_at ? banner.ends_at.slice(0, 16) : "",
    });
    setSelectedFile(null);
    setImagePreview(banner.image_url || null);
    setSelectedFile2(null);
    setImagePreview2(banner.image_url_2 || null);
    setSelectedMobileFile(null);
    setMobileImagePreview(banner.mobile_image_url || null);
    setSelectedMobileFile2(null);
    setMobileImagePreview2(banner.mobile_image_url_2 || null);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, etc).",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear the URL input when a file is selected
      setFormData(prev => ({ ...prev, imageUrl: "" }));
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(editingBanner?.image_url || null);
  };

  const handleFile2Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Arquivo inválido", description: "Por favor, selecione uma imagem (JPG, PNG, etc).", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 5MB.", variant: "destructive" });
        return;
      }
      setSelectedFile2(file);
      setImagePreview2(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl2: "" }));
    }
  };

  const clearSelectedFile2 = () => {
    setSelectedFile2(null);
    if (imagePreview2 && imagePreview2.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview2);
    }
    setImagePreview2(editingBanner?.image_url_2 || null);
  };

  const handleMobileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, etc).",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedMobileFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMobileImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, mobileImageUrl: "" }));
    }
  };

  const clearSelectedMobileFile = () => {
    setSelectedMobileFile(null);
    if (mobileImagePreview && mobileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mobileImagePreview);
    }
    setMobileImagePreview(editingBanner?.mobile_image_url || null);
  };

  const handleMobileFile2Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Arquivo inválido", description: "Por favor, selecione uma imagem (JPG, PNG, etc).", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 5MB.", variant: "destructive" });
        return;
      }
      setSelectedMobileFile2(file);
      setMobileImagePreview2(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, mobileImageUrl2: "" }));
    }
  };

  const clearSelectedMobileFile2 = () => {
    setSelectedMobileFile2(null);
    if (mobileImagePreview2 && mobileImagePreview2.startsWith('blob:')) {
      URL.revokeObjectURL(mobileImagePreview2);
    }
    setMobileImagePreview2(editingBanner?.mobile_image_url_2 || null);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o título do banner.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = formData.imageUrl || editingBanner?.image_url || "/placeholder.svg";
      let imageUrl2: string | null = formData.imageUrl2 || editingBanner?.image_url_2 || null;
      let mobileImageUrl: string | null = formData.mobileImageUrl || editingBanner?.mobile_image_url || null;
      let mobileImageUrl2: string | null = formData.mobileImageUrl2 || editingBanner?.mobile_image_url_2 || null;

      const uploadOrFail = async (file: File, label: string): Promise<string | null> => {
        setIsUploading(true);
        try {
          const url = await storageService.uploadImage(file, 'banners');
          setIsUploading(false);
          return url;
        } catch (uploadError) {
          console.error(`Error uploading ${label}:`, uploadError);
          toast({
            title: `Erro no upload (${label})`,
            description: "Não foi possível fazer upload da imagem. Tente novamente.",
            variant: "destructive",
          });
          setIsSaving(false);
          setIsUploading(false);
          return null;
        }
      };

      if (selectedFile) {
        const url = await uploadOrFail(selectedFile, 'desktop 1');
        if (!url) return;
        imageUrl = url;
      }
      if (selectedFile2) {
        const url = await uploadOrFail(selectedFile2, 'desktop 2');
        if (!url) return;
        imageUrl2 = url;
      }
      if (selectedMobileFile) {
        const url = await uploadOrFail(selectedMobileFile, 'mobile 1');
        if (!url) return;
        mobileImageUrl = url;
      }
      if (selectedMobileFile2) {
        const url = await uploadOrFail(selectedMobileFile2, 'mobile 2');
        if (!url) return;
        mobileImageUrl2 = url;
      }

      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        image_url: imageUrl,
        image_url_2: imageUrl2,
        mobile_image_url: mobileImageUrl,
        mobile_image_url_2: mobileImageUrl2,
        link_url: formData.linkUrl || null,
        position: formData.position,
        is_active: formData.isActive,
        show_cta_button: formData.showCtaButton,
        display_order: editingBanner?.display_order || banners.length + 1,
        ends_at: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
      };

      if (editingBanner) {
        await bannersService.update(editingBanner.id, bannerData);
        toast({
          title: "Banner atualizado",
          description: "O banner foi atualizado com sucesso.",
        });
      } else {
        await bannersService.create(bannerData);
        toast({
          title: "Banner criado",
          description: "O banner foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      loadBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o banner.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await bannersService.delete(deleteId);
      toast({
        title: "Banner excluído",
        description: "O banner foi excluído com sucesso.",
      });
      loadBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o banner.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await bannersService.toggleActive(banner.id);
      setBanners(
        banners.map((b) =>
          b.id === banner.id ? { ...b, is_active: !b.is_active } : b
        )
      );
      toast({
        title: banner.is_active ? "Banner desativado" : "Banner ativado",
        description: `O banner "${banner.title}" foi ${banner.is_active ? "desativado" : "ativado"}.`,
      });
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do banner.",
        variant: "destructive",
      });
    }
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      hero: "Banner Principal",
      promo: "Promoção",
      category: "Categoria",
    };
    return labels[position] || position;
  };

  const getPositionDescription = (position: string) => {
    const descriptions: Record<string, string> = {
      hero: "Exibido na seção principal da página inicial",
      promo: "Exibido na seção de promoções",
      category: "Exibido nas páginas de categoria",
    };
    return descriptions[position] || "";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os banners exibidos no site.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Editar Banner" : "Novo Banner"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: ESTILO QUE DOMINA A RUA"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Ex: Nova Coleção 2026"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Moda urbana para quem não segue tendências..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Texto exibido abaixo do título (apenas para banner principal)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endsAt">Data/hora final do cronômetro</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endsAt: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para não exibir cronômetro.
                </p>
              </div>
              <div className="grid gap-2">
                <Label>🖥️ Imagem Desktop</Label>
                <p className="text-xs text-muted-foreground -mt-1">Exibida em telas maiores (recomendado: 1920×600px, landscape)</p>

                {/* Desktop Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview Desktop"
                      className="w-full h-full object-cover"
                    />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : "Escolher imagem"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou cole uma URL</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (e.target.value) {
                      setSelectedFile(null);
                      setImagePreview(e.target.value);
                    }
                  }}
                  placeholder="https://exemplo.com/imagem.jpg"
                  disabled={!!selectedFile}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
                </p>
              </div>

              {/* Desktop Image 2 */}
              <div className="grid gap-2">
                <Label>🖥️ Imagem Desktop 2 <span className="text-muted-foreground font-normal">(opcional — carrossel)</span></Label>
                <p className="text-xs text-muted-foreground -mt-1">Se informada, alterna com a imagem 1 a cada 5 segundos</p>

                {imagePreview2 && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img src={imagePreview2} alt="Preview Desktop 2" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearSelectedFile2}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedFile2 ? selectedFile2.name : "Escolher imagem 2"}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFile2Select} className="hidden" />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou cole uma URL</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Input
                  value={formData.imageUrl2}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl2: e.target.value });
                    if (e.target.value) {
                      setSelectedFile2(null);
                      setImagePreview2(e.target.value);
                    } else {
                      setImagePreview2(null);
                    }
                  }}
                  placeholder="https://exemplo.com/imagem2.jpg"
                  disabled={!!selectedFile2}
                />
                <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WebP (máx. 5MB)</p>
              </div>

              <div className="grid gap-2">
                <Label>📱 Imagem Celular <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <p className="text-xs text-muted-foreground -mt-1">Se não subir, usará a imagem desktop. Recomendado: 600×800px, portrait (retrato)</p>

                {/* Mobile Image Preview */}
                {mobileImagePreview && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={mobileImagePreview}
                      alt="Preview Celular"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearSelectedMobileFile}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedMobileFile ? selectedMobileFile.name : "Escolher imagem para celular"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou cole uma URL</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Input
                  id="mobileImageUrl"
                  value={formData.mobileImageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, mobileImageUrl: e.target.value });
                    if (e.target.value) {
                      setSelectedMobileFile(null);
                      setMobileImagePreview(e.target.value);
                    } else {
                      setMobileImagePreview(null);
                    }
                  }}
                  placeholder="https://exemplo.com/imagem-mobile.jpg"
                  disabled={!!selectedMobileFile}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
                </p>
              </div>

              {/* Mobile Image 2 */}
              <div className="grid gap-2">
                <Label>📱 Imagem Celular 2 <span className="text-muted-foreground font-normal">(opcional — carrossel)</span></Label>
                <p className="text-xs text-muted-foreground -mt-1">Se informada, alterna com a imagem celular 1 a cada 5 segundos</p>

                {mobileImagePreview2 && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img src={mobileImagePreview2} alt="Preview Celular 2" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearSelectedMobileFile2}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedMobileFile2 ? selectedMobileFile2.name : "Escolher imagem celular 2"}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleMobileFile2Select} className="hidden" />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou cole uma URL</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Input
                  value={formData.mobileImageUrl2}
                  onChange={(e) => {
                    setFormData({ ...formData, mobileImageUrl2: e.target.value });
                    if (e.target.value) {
                      setSelectedMobileFile2(null);
                      setMobileImagePreview2(e.target.value);
                    } else {
                      setMobileImagePreview2(null);
                    }
                  }}
                  placeholder="https://exemplo.com/imagem-mobile2.jpg"
                  disabled={!!selectedMobileFile2}
                />
                <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WebP (máx. 5MB)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkUrl">Link de Destino</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="/catalogo?filter=new"
                />
              </div>
              <div className="grid gap-2">
                <Label>Posição</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value: BannerPosition) =>
                    setFormData({ ...formData, position: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Banner Principal</SelectItem>
                    <SelectItem value="promo">Promoção</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {getPositionDescription(formData.position)}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label>Status</Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isActive ? "Banner visível no site" : "Banner oculto"}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              {formData.position === "promo" && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label>Botão "Aproveitar agora"</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.showCtaButton ? "Botão visível no banner" : "Botão oculto"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.showCtaButton}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, showCtaButton: checked })
                    }
                  />
                </div>
              )}
              <Button onClick={handleSave} className="mt-4" disabled={isSaving || isUploading}>
                {(isSaving || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isUploading ? "Enviando imagens..." : editingBanner ? "Salvar Alterações" : "Criar Banner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banner List */}
      <div className="grid gap-4">
        {banners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum banner cadastrado. Clique em "Novo Banner" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4 space-y-3">
                    <div className="w-full h-32 rounded overflow-hidden bg-muted">
                      <img
                        src={banner.image_url || "/placeholder.svg"}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{getPositionLabel(banner.position)}</Badge>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? (
                          <><Eye className="h-3 w-3 mr-1" /> Ativo</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Inativo</>
                        )}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleActive(banner)}
                      >
                        {banner.is_active ? (
                          <><EyeOff className="h-4 w-4 mr-1" /> Desativar</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-1" /> Ativar</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(banner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(banner.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
                      <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={banner.image_url || "/placeholder.svg"}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{getPositionLabel(banner.position)}</Badge>
                          <Badge variant={banner.is_active ? "default" : "secondary"}>
                            {banner.is_active ? (
                              <><Eye className="h-3 w-3 mr-1" /> Ativo</>
                            ) : (
                              <><EyeOff className="h-3 w-3 mr-1" /> Inativo</>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(banner)}
                        >
                          {banner.is_active ? (
                            <><EyeOff className="h-4 w-4 mr-1" /> Desativar</>
                          ) : (
                            <><Eye className="h-4 w-4 mr-1" /> Ativar</>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(banner.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Dicas</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Banner Principal:</strong> Aparece no topo da página inicial</li>
            <li>• <strong>Promoção:</strong> Aparece na seção de promoções da home</li>
            <li>• <strong>Categoria:</strong> Será usado nas páginas de categoria</li>
            <li>• <strong>Imagem Celular:</strong> Evita cortes em telas pequenas — suba uma versão portrait (retrato)</li>
            <li>• Apenas banners ativos são exibidos no site</li>
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este banner? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBanners;
