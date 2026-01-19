import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
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

const Wishlist = () => {
  const { items, removeItem } = useWishlist();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} removido dos favoritos`);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Lista de Desejos ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lista vazia</h3>
            <p className="text-muted-foreground mb-4">
              Adicione produtos à sua lista de desejos para salvar para depois.
            </p>
            <Link to="/catalogo">
              <Button>Ver produtos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Link to={`/produto/${product.id}`} className="shrink-0">
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={getProductImage(product.category)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/produto/${product.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground capitalize">
                    {product.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to={`/produto/${product.id}`}>
                    <Button size="sm">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Comprar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemove(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Wishlist;
