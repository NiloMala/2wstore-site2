import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X, Image as ImageIcon, Package } from "lucide-react";
import { productsService, categoriesService, storageService } from "@/services";
import type { Product, Category } from "@/services";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

// Tipo para variante de produto (tamanho + cor + estoque)
interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const AdminProducts = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Images state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Variants state (estoque por tamanho e cor)
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [useVariants, setUseVariants] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    description: "",
    sizes: "",
    colors: "",
    stock: "",
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsService.getAllAdmin(),
        categoriesService.getAllAdmin(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      description: "",
      sizes: "",
      colors: "",
      stock: "0",
      isNew: false,
      isBestSeller: false,
      isOnSale: false,
      isActive: true,
    });
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setVariants([]);
    setUseVariants(false);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || "",
      categoryId: product.category_id || "",
      description: product.description || "",
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      stock: product.stock?.toString() || "0",
      isNew: product.is_new || false,
      isBestSeller: product.is_best_seller || false,
      isOnSale: product.is_on_sale || false,
      isActive: product.is_active ?? true,
    });
    setExistingImages(product.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    // Carregar variantes existentes
    const existingVariants = (product as any).variants as ProductVariant[] | null;
    if (existingVariants && existingVariants.length > 0) {
      setVariants(existingVariants);
      setUseVariants(true);
    } else {
      setVariants([]);
      setUseVariants(false);
    }
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  // Gera as combinações de variantes baseado nos tamanhos e cores
  const generateVariants = () => {
    const sizesArray = formData.sizes ? formData.sizes.split(",").map(s => s.trim()).filter(Boolean) : [];
    const colorsArray = formData.colors ? formData.colors.split(",").map(c => c.trim()).filter(Boolean) : [];

    if (sizesArray.length === 0 && colorsArray.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um tamanho ou cor para gerar variantes.",
        variant: "destructive",
      });
      return;
    }

    const newVariants: ProductVariant[] = [];

    // Se tem tamanhos e cores, gera combinações
    if (sizesArray.length > 0 && colorsArray.length > 0) {
      for (const size of sizesArray) {
        for (const color of colorsArray) {
          // Verifica se já existe essa variante
          const existing = variants.find(v => v.size === size && v.color === color);
          newVariants.push({
            size,
            color,
            stock: existing?.stock ?? 0,
          });
        }
      }
    }
    // Se só tem tamanhos
    else if (sizesArray.length > 0) {
      for (const size of sizesArray) {
        const existing = variants.find(v => v.size === size && !v.color);
        newVariants.push({
          size,
          color: "",
          stock: existing?.stock ?? 0,
        });
      }
    }
    // Se só tem cores
    else if (colorsArray.length > 0) {
      for (const color of colorsArray) {
        const existing = variants.find(v => v.color === color && !v.size);
        newVariants.push({
          size: "",
          color,
          stock: existing?.stock ?? 0,
        });
      }
    }

    setVariants(newVariants);
    setUseVariants(true);
  };

  // Atualiza o estoque de uma variante específica
  const updateVariantStock = (index: number, stock: number) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, stock } : v));
  };

  // Calcula o estoque total das variantes
  const getTotalVariantStock = () => {
    return variants.reduce((total, v) => total + v.stock, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é uma imagem válida.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 5MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setNewImageFiles(prev => [...prev, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Erro",
        description: "O preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let uploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        setIsUploading(true);
        try {
          uploadedUrls = await storageService.uploadImages(newImageFiles, 'product-images');
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível enviar as imagens. Tente novamente.",
            variant: "destructive",
          });
          setIsSaving(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      // Calcula estoque total (soma das variantes ou estoque manual)
      const totalStock = useVariants && variants.length > 0
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : parseInt(formData.stock) || 0;

      const productData = {
        name: formData.name.trim(),
        slug: editingProduct?.slug || generateSlug(formData.name),
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category_id: formData.categoryId || null,
        description: formData.description.trim() || null,
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
        images: allImages,
        stock: totalStock,
        variants: useVariants && variants.length > 0 ? variants as unknown as Json : null,
        is_new: formData.isNew,
        is_best_seller: formData.isBestSeller,
        is_on_sale: formData.isOnSale,
        is_active: formData.isActive,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, productData);
        toast({
          title: "Produto atualizado",
          description: `"${productData.name}" foi atualizado com sucesso.`,
        });
      } else {
        await productsService.create(productData);
        toast({
          title: "Produto criado",
          description: `"${productData.name}" foi criado com sucesso.`,
        });
      }

      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      if (productToDelete.images && productToDelete.images.length > 0) {
        try {
          await storageService.deleteImages(productToDelete.images, 'product-images');
        } catch (error) {
          console.error('Error deleting product images:', error);
        }
      }

      await productsService.delete(productToDelete.id);
      toast({
        title: "Produto removido",
        description: `"${productToDelete.name}" foi removido com sucesso.`,
      });
      await loadData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o produto.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
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
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>

              {/* Image Upload Section */}
              <div className="grid gap-2">
                <Label>Imagens do Produto</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Produto ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {newImagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`Nova imagem ${index + 1}`}
                            className="w-full h-20 object-cover rounded border-2 border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Imagens
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      JPG, PNG, WebP ou GIF. Máximo 5MB por arquivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Preço *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Preço Original (promoção)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tamanhos (separar por vírgula)</Label>
                  <Input
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="P, M, G, GG"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cores (separar por vírgula)</Label>
                  <Input
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Preto, Branco"
                  />
                </div>
              </div>

              {/* Seção de Variantes - Estoque por Tamanho/Cor */}
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <Label className="font-medium">Estoque por Variante</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateVariants}
                    disabled={!formData.sizes && !formData.colors}
                  >
                    {variants.length > 0 ? "Atualizar Variantes" : "Gerar Variantes"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defina os tamanhos e cores acima, depois clique em "Gerar Variantes" para configurar o estoque de cada combinação.
                </p>

                {useVariants && variants.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-[1fr_1fr_100px] gap-2 text-xs font-medium text-muted-foreground px-1">
                      <span>Tamanho</span>
                      <span>Cor</span>
                      <span>Qtd</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {variants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-[1fr_1fr_100px] gap-2 items-center">
                          <span className="text-sm px-2 py-1 bg-background rounded border">
                            {variant.size || "-"}
                          </span>
                          <span className="text-sm px-2 py-1 bg-background rounded border">
                            {variant.color || "-"}
                          </span>
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariantStock(index, parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Estoque Total:</span>
                      <Badge variant="secondary" className="text-sm">
                        {getTotalVariantStock()} unidades
                      </Badge>
                    </div>
                  </div>
                )}

                {!useVariants && (
                  <p className="text-xs text-center text-muted-foreground py-4 border border-dashed rounded">
                    Nenhuma variante configurada. O estoque geral será usado.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isNew}
                    onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                  />
                  <Label>Novo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isBestSeller}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
                  />
                  <Label>Mais Vendido</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isOnSale}
                    onCheckedChange={(checked) => setFormData({ ...formData, isOnSale: checked })}
                  />
                  <Label>Em Promoção</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
              <Button onClick={handleSave} className="mt-4" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Enviando imagens..." : editingProduct ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
            </p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-14 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${!product.is_active ? 'text-muted-foreground' : ''}`}>
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{getCategoryName(product.category_id)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">R$ {Number(product.price).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Estoque: {product.stock || 0}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {!product.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                        {product.is_new && <Badge variant="outline" className="text-xs">Novo</Badge>}
                        {product.is_on_sale && <Badge variant="destructive" className="text-xs">Promo</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(product)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className={!product.is_active ? 'text-muted-foreground' : ''}>
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(product.category_id)}</TableCell>
                        <TableCell>
                          R$ {Number(product.price).toFixed(2)}
                          {product.original_price && (
                            <span className="text-muted-foreground line-through ml-2 text-sm">
                              R$ {Number(product.original_price).toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={product.stock && product.stock < 10 ? 'text-red-500 font-medium' : ''}>
                            {product.stock || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {!product.is_active && <Badge variant="secondary">Inativo</Badge>}
                            {product.is_new && <Badge variant="outline">Novo</Badge>}
                            {product.is_best_seller && <Badge>Mais Vendido</Badge>}
                            {product.is_on_sale && <Badge variant="destructive">Promoção</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(product)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{productToDelete?.name}"? Esta ação não pode ser desfeita.
              {productToDelete?.images && productToDelete.images.length > 0 && (
                <span className="block mt-2 text-amber-600">
                  As {productToDelete.images.length} imagem(ns) do produto também serão removidas.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
