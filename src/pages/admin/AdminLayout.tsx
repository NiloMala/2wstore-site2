import { useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Ticket, 
  Image,
  LogOut,
  Store,
  Bike
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Produtos", href: "/admin/produtos" },
  { icon: ShoppingCart, label: "Pedidos", href: "/admin/pedidos" },
  { icon: Bike, label: "Entregas", href: "/admin/entregas" },
  { icon: Ticket, label: "Cupons", href: "/admin/cupons" },
  { icon: Image, label: "Banners", href: "/admin/banners" },
];

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              <span className="text-xl font-bold">2W Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm hover:text-primary transition-colors">
              Ver loja
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 text-sm hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border hidden lg:block">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
