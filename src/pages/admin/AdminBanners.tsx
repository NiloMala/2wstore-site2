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
    linkUrl: "",
    position: "hero" as BannerPosition,
    isActive: true,
    endsAt: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      linkUrl: "",
      position: "hero",
      isActive: true,
      endsAt: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      imageUrl: banner.image_url || "",
      linkUrl: banner.link_url || "",
      position: banner.position as BannerPosition,
      isActive: banner.is_active ?? true,
      endsAt: banner.ends_at ? banner.ends_at.slice(0, 16) : "",
    });
    setSelectedFile(null);
    setImagePreview(banner.image_url || null);
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

      // Upload new image if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          imageUrl = await storageService.uploadImage(selectedFile, 'banners');
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload da imagem. Tente novamente.",
            variant: "destructive",
          });
          setIsSaving(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        image_url: imageUrl,
        link_url: formData.linkUrl || null,
        position: formData.position,
        is_active: formData.isActive,
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
                <Label>Imagem do Banner</Label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview"
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

                {/* File Upload */}
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

                {/* Or use URL */}
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
              <Button onClick={handleSave} className="mt-4" disabled={isSaving || isUploading}>
                {(isSaving || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isUploading ? "Enviando imagem..." : editingBanner ? "Salvar Alterações" : "Criar Banner"}
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
