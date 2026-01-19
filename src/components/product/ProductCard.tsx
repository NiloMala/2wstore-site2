import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
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

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    if (isFavorite) {
      toast.success("Removido dos favoritos");
    } else {
      toast.success("Adicionado aos favoritos");
    }
  };

  return (
    <Link
      to={`/produto/${product.id}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image ?? (product.images && product.images[0]) ?? getProductImage(product.category)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorite 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-background/80 text-muted-foreground hover:bg-background hover:text-destructive"
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-full">
              Novo
            </span>
          )}
          {product.isOnSale && discount > 0 && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase rounded-full">
              -{discount}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase rounded-full">
              ⭐ Top
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="hero-outline" className="w-full">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Ver produto
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1 mb-2">
          {product.category}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
