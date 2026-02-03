import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowLeft, Minus, Plus, ShoppingBag, Heart, Truck, RotateCcw, Shield } from "lucide-react";
import productTshirt from "@/assets/product-tshirt.jpg";
import productHoodie from "@/assets/product-hoodie.jpg";
import productPants from "@/assets/product-pants.jpg";
import productCap from "@/assets/product-cap.jpg";

const getProductImage = (category: string) => {
  switch (category) {
    case "camisetas":
      return productTshirt;
    case "moletons":
      return productHoodie;
    case "calcas":
    case "shorts":
      return productPants;
    case "acessorios":
      return productCap;
    default:
      return productTshirt;
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product by ID
  useEffect(() => {
    let mounted = true;
    setSelectedImageIndex(0); // Reset image selection when product changes
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = await productService.getProductById(id);
        if (!mounted) return;
        setProduct(p as Product | null);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Fetch related products
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!product) return;
      try {
        const all = await productService.getProducts();
        if (!mounted) return;
        const related = (all as Product[])
          .filter((p) => p.category === product.category && p.id !== product.id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [product]);

  if (loading) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div>Carregando...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button asChild>
            <Link to="/catalogo">Voltar ao catálogo</Link>
          </Button>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <main className="min-h-screen pt-20">
      <div className="container px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/catalogo"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao catálogo
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {(() => {
              const images = product.images && product.images.length > 0
                ? product.images
                : [product.image ?? getProductImage(product.category)];
              const currentImage = images[selectedImageIndex] || images[0];

              return (
                <>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 4).map((src, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer transition-all ${
                          selectedImageIndex === idx
                            ? "ring-2 ring-primary"
                            : "hover:ring-2 hover:ring-primary/50"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              {product.isNew && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-full">
                  Novo
                </span>
              )}
              {product.isOnSale && discount > 0 && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase rounded-full">
                  -{discount}% OFF
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase rounded-full">
                  ⭐ Mais Vendido
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{product.description}</p>

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold uppercase tracking-wider">Tamanho</span>
                <button className="text-sm text-primary hover:underline">
                  Guia de medidas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 px-4 rounded-lg font-semibold transition-all ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <span className="font-semibold uppercase tracking-wider mb-3 block">
                Cor: {selectedColor}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedColor === color
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <span className="font-semibold uppercase tracking-wider mb-3 block">
                Quantidade
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                variant="buy"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao carrinho
              </Button>
              <Button variant="outline" size="xl">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {!selectedSize || !selectedColor ? (
              <p className="text-sm text-muted-foreground text-center">
                Selecione tamanho e cor para continuar
              </p>
            ) : null}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Frete grátis +R$200
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Troca em 30 dias
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Compra segura
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-8">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;
