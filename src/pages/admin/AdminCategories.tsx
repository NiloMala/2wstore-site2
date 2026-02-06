import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Pencil, Save } from "lucide-react";
import { productService } from "@/services/product.service";
import { storageService } from "@/services";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  display_order: number | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar a lista de categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (categoryId: string, file: File) => {
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

    setUploadingId(categoryId);

    try {
      const imageUrl = await storageService.uploadImage(file, 'categories');

      const { error } = await supabase
        .from('categories')
        .update({ image_url: imageUrl })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, image_url: imageUrl } : c
      ));

      toast({
        title: "Imagem atualizada",
        description: "A imagem da categoria foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemoveImage = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ image_url: null })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, image_url: null } : c
      ));

      toast({
        title: "Imagem removida",
        description: "A imagem da categoria foi removida. Voltará a exibir o emoji.",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateIcon = async (categoryId: string, newIcon: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ icon: newIcon })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, icon: newIcon } : c
      ));

      setEditingId(null);

      toast({
        title: "Ícone atualizado",
        description: "O emoji da categoria foi atualizado.",
      });
    } catch (error) {
      console.error("Error updating icon:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o emoji.",
        variant: "destructive",
      });
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
        <h1 className="text-3xl font-bold">Categorias</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as imagens e ícones das categorias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4 space-y-4">
              {/* Preview atual */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{category.icon}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.image_url ? "Usando imagem" : "Usando emoji"}
                  </p>
                </div>
              </div>

              {/* Editar emoji */}
              <div>
                <Label className="text-xs text-muted-foreground">Emoji (fallback)</Label>
                {editingId === category.id ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={category.icon || ""}
                      id={`icon-${category.id}`}
                      className="w-20 text-center text-xl"
                      maxLength={2}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`icon-${category.id}`) as HTMLInputElement;
                        handleUpdateIcon(category.id, input.value);
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl w-10">{category.icon || "—"}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(category.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Upload de imagem */}
              <div>
                <Label className="text-xs text-muted-foreground">Imagem personalizada</Label>
                <div className="flex gap-2 mt-1">
                  <label className="flex-1">
                    <div className={`flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${uploadingId === category.id ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingId === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {uploadingId === category.id ? "Enviando..." : "Upload"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(category.id, file);
                        e.target.value = '';
                      }}
                      className="hidden"
                      disabled={uploadingId === category.id}
                    />
                  </label>
                  {category.image_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveImage(category.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Como funciona</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Se uma categoria tiver <strong>imagem</strong>, ela será exibida no lugar do emoji</li>
            <li>• Se não tiver imagem, o <strong>emoji</strong> será exibido como fallback</li>
            <li>• Formatos aceitos: JPG, PNG, WebP (máx. 5MB)</li>
            <li>• Recomendação: imagens quadradas com fundo transparente (PNG)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
