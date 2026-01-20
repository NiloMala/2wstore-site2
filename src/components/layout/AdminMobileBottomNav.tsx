import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Bike, Ticket, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export const AdminMobileBottomNav = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Produtos", href: "/admin/produtos" },
    { icon: ShoppingCart, label: "Pedidos", href: "/admin/pedidos" },
    { icon: Bike, label: "Entregas", href: "/admin/entregas" },
    { icon: Ticket, label: "Cupons", href: "/admin/cupons" },
    { icon: Image, label: "Banners", href: "/admin/banners" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Navigation Bar */}
      <nav className="bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-end overflow-x-auto px-2 pb-2 pt-1 safe-area-pb scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center py-2 px-3 min-w-[56px] flex-shrink-0"
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] transition-colors mt-0.5 whitespace-nowrap",
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

      {/* Safe area spacer for iOS + hide scrollbar */}
      <style>{`
        .safe-area-pb {
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminMobileBottomNav;
