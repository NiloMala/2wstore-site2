import { Link, useLocation } from "react-router-dom";
import { Home, Grid3X3, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isCenter?: boolean;
  action?: "cart";
  badge?: number;
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();

  const navItems: NavItem[] = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Grid3X3, label: "Catálogo", href: "/catalogo" },
    { icon: ShoppingCart, label: "Carrinho", href: "#", isCenter: true, action: "cart", badge: totalItems },
    { icon: Heart, label: "Favoritos", href: "/minha-conta/favoritos", badge: wishlistItems.length },
    { icon: User, label: "Conta", href: "/minha-conta" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "#") return false;
    return location.pathname.startsWith(href);
  };

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.action === "cart") {
      e.preventDefault();
      openCart();
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Navigation Bar */}
      <nav className="bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-end justify-around px-2 pb-2 pt-1 safe-area-pb">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.isCenter) {
              return (
                <button
                  key={item.label}
                  onClick={(e) => handleItemClick(item, e)}
                  className="flex flex-col items-center -mt-5 relative"
                >
                  <div className="bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                    <Icon className="h-6 w-6" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center py-2 px-1 min-w-[60px]"
              >
                {/* Badge on top */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold mb-0.5">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] transition-colors mt-0.5",
                    active ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Safe area spacer for iOS */}
      <style>{`
        .safe-area-pb {
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
};

export default MobileBottomNav;
