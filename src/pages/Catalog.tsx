import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X, Search } from "lucide-react";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryFilter = searchParams.get("category") || "";
  const filterType = searchParams.get("filter") || "";
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, c] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
        ]);
        if (!mounted) return;
        setProducts(p as Product[]);
        setCategories(c || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => (p as any).categoryId === categoryFilter);
    }

    // Type filter
    if (filterType === "new") {
      result = result.filter((p) => p.isNew);
    } else if (filterType === "bestseller") {
      result = result.filter((p) => p.isBestSeller);
    } else if (filterType === "sale") {
      result = result.filter((p) => p.isOnSale);
    }

    return result;
  }, [products, categoryFilter, filterType, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set("category", categoryId);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (filter: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (filter) {
      newParams.set("filter", filter);
    } else {
      newParams.delete("filter");
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = categoryFilter || filterType || searchQuery;

  return (
    <main className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-hero-gradient py-12 lg:py-16">
        <div className="container px-4 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-black text-primary-foreground uppercase tracking-tight mb-4">
            {searchQuery
              ? `Resultados: "${searchQuery}"`
              : categoryFilter
              ? (categories.find((c) => c.id === categoryFilter)?.name || "Catálogo")
              : filterType === "new"
              ? "Lançamentos"
              : filterType === "bestseller"
              ? "Mais Vendidos"
              : filterType === "sale"
              ? "Promoções"
              : "Catálogo"}
          </h1>
          <p className="text-primary-foreground/80">
            {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"} encontrados
          </p>
        </div>
      </section>

      <div className="container px-4 lg:px-8 py-8 lg:py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto lg:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => handleSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="font-bold uppercase tracking-wider mb-4">Categorias</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !categoryFilter
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        categoryFilter === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Types */}
              <div>
                <h3 className="font-bold uppercase tracking-wider mb-4">Filtrar por</h3>
                <div className="space-y-2">
                  {[
                    { id: "", label: "Todos" },
                    { id: "new", label: "Lançamentos" },
                    { id: "bestseller", label: "Mais Vendidos" },
                    { id: "sale", label: "Promoções" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterChange(filter.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        filterType === filter.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {hasFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  Ativo
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Filters Modal */}
          {mobileFiltersOpen && (
            <>
              <div
                className="fixed inset-0 bg-foreground/50 z-50 lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-background z-50 p-6 overflow-y-auto lg:hidden animate-slide-in-right">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider">Filtros</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="space-y-8">
                  {/* Categories */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-4">Categorias</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleCategoryChange("");
                          setMobileFiltersOpen(false);
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !categoryFilter
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        Todas
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            handleCategoryChange(category.id);
                            setMobileFiltersOpen(false);
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            categoryFilter === category.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {category.icon} {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Types */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-4">Filtrar por</h3>
                    <div className="space-y-2">
                      {[
                        { id: "", label: "Todos" },
                        { id: "new", label: "Lançamentos" },
                        { id: "bestseller", label: "Mais Vendidos" },
                        { id: "sale", label: "Promoções" },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => {
                            handleFilterChange(filter.id);
                            setMobileFiltersOpen(false);
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            filterType === filter.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasFilters && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearFilters();
                        setMobileFiltersOpen(false);
                      }}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  Nenhum produto encontrado
                </p>
                <Button onClick={clearFilters}>Ver todos os produtos</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Catalog;
