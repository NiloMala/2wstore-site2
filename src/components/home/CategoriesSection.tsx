import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";


export const CategoriesSection = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await productService.getCategories();
        if (!mounted) return;
        setCategories(c || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">
            Explore por Categoria
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Encontre o estilo perfeito para você
          </p>
        </div>

        {/* Categories - horizontal scroll on mobile */}
        <div className="flex lg:grid lg:grid-cols-5 gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalogo?category=${category.id}`}
              className="group relative bg-card rounded-xl p-4 lg:p-8 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex-shrink-0 w-28 lg:w-auto"
            >
              <div className="text-3xl lg:text-5xl mb-2 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-16 h-16 lg:w-20 lg:h-20 object-contain mx-auto"
                  />
                ) : (
                  category.icon
                )}
              </div>
              <h3 className="font-bold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors text-xs lg:text-base">
                {category.name}
              </h3>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
