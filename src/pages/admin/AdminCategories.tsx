import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Pencil, Save, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // Validar imagem se fornecida
    if (newCategoryImage) {
      if (!newCategoryImage.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, etc).",
          variant: "destructive",
        });
        return;
      }

      if (newCategoryImage.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreating(true);
    try {
      // Gerar slug a partir do nome
      const slug = newCategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
        .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

      // Criar categoria
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName.trim(),
          slug: slug,
          icon: newCategoryIcon.trim() || '📦',
          display_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;

      let finalData = data;

      // Se houver imagem, fazer upload
      if (newCategoryImage) {
        try {
          const imageUrl = await storageService.uploadImage(newCategoryImage, 'categories');

          // Atualizar categoria com URL da imagem
          const { data: updatedData, error: updateError } = await supabase
            .from('categories')
            .update({ image_url: imageUrl })
            .eq('id', data.id)
            .select()
            .single();

          if (updateError) throw updateError;
          finalData = updatedData;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Categoria criada (sem imagem)",
            description: "A categoria foi criada, mas houve erro ao fazer upload da imagem.",
            variant: "default",
          });
        }
      }

      setCategories([...categories, finalData]);
      setIsCreateDialogOpen(false);
      setNewCategoryName("");
      setNewCategoryIcon("");
      setNewCategoryImage(null);
      setImagePreview(null);

      toast({
        title: "Categoria criada",
        description: `A categoria "${finalData.name}" foi criada com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewCategoryImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    setNewCategoryImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNewCategoryImage = () => {
    setNewCategoryImage(null);
    setImagePreview(null);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      // Deletar imagem do storage se existir
      if (categoryToDelete.image_url) {
        try {
          await storageService.deleteImage(categoryToDelete.image_url);
        } catch (error) {
          console.error("Error deleting image from storage:", error);
          // Continua mesmo se falhar ao deletar a imagem
        }
      }

      // Deletar categoria do banco
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);

      toast({
        title: "Categoria deletada",
        description: `A categoria "${categoryToDelete.name}" foi removida com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro ao deletar categoria",
        description: error.message || "Não foi possível deletar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as imagens e ícones das categorias.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 className="h-4 w-4" />
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

      {/* Dialog de criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar seus produtos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria *</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Camisetas, Calças, Acessórios..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryIcon">Emoji (opcional)</Label>
              <Input
                id="categoryIcon"
                placeholder="👕"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                maxLength={2}
                className="text-2xl text-center"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para usar 📦 como padrão. Você pode editar depois.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imagem da Categoria (opcional)</Label>
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveNewCategoryImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleNewCategoryImageSelect}
                    className="hidden"
                    id="newCategoryImageInput"
                  />
                  <Label
                    htmlFor="newCategoryImageInput"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Clique para selecionar uma imagem
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG ou GIF (máx. 5MB)
                    </span>
                  </Label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewCategoryName("");
                setNewCategoryIcon("");
                setNewCategoryImage(null);
                setImagePreview(null);
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Categoria"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de deleção */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a categoria "{categoryToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
