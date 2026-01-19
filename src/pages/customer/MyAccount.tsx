import { useEffect, useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { icon: User, label: "Meus dados", href: "/minha-conta" },
  { icon: Package, label: "Meus pedidos", href: "/minha-conta/pedidos" },
  { icon: MapPin, label: "Endereços", href: "/minha-conta/enderecos" },
  { icon: Heart, label: "Lista de desejos", href: "/minha-conta/favoritos" },
];

const MyAccount = () => {
  const { user, isAuthenticated, logout, isLoading, updateProfile } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [phoneValue, setPhoneValue] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 lg:pt-24 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isExactPath = location.pathname === "/minha-conta";

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-12 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Minha Conta</h1>
          <p className="text-muted-foreground">
            Olá, <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-destructive/10 text-destructive w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sair</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {isExactPath ? (
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Meus Dados</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Nome</label>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Telefone</label>
                        <p className="font-medium">{user?.phone || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Membro desde</label>
                        <p className="font-medium">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Editar dados</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar meus dados</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-3 py-4">
                            <div>
                              <label className="text-sm text-muted-foreground">Nome</label>
                              <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground">Telefone</label>
                              <Input value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                            <Button
                              onClick={async () => {
                                setIsSavingProfile(true);
                                const res = await updateProfile({ name: nameValue, phone: phoneValue });
                                setIsSavingProfile(false);
                                if (res.success) setIsEditOpen(false);
                                else alert(res.error || 'Erro ao salvar');
                              }}
                              disabled={isSavingProfile}
                            >Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
