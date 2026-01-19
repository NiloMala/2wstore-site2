import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Eye
} from "lucide-react";
import { ordersService, productsService } from "@/services";
import { supabase } from "@/integrations/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  activeCustomers: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  items_count: number;
}

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
};

const getOrderStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    activeCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load order stats
      const orderStats = await ordersService.getStats();

      // Load product count
      const products = await productsService.getAllAdmin();
      const lowStock = await productsService.getLowStock(10);

      // Load active customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Load recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id,total,status,created_at,user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalOrders: orderStats.totalOrders,
        pendingOrders: orderStats.pendingOrders,
        totalRevenue: orderStats.totalRevenue,
        totalProducts: products?.length || 0,
        lowStockProducts: lowStock?.length || 0,
        activeCustomers: customersCount || 0,
      });

      if (orders) {
        setRecentOrders(
          orders.map((order: any) => ({
            id: order.id,
            total: Number(order.total),
            status: order.status,
            created_at: order.created_at,
            user: undefined,
            items_count: 0,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const statsCards = [
    { label: "Total de Pedidos", value: stats.totalOrders, icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Pedidos Pendentes", value: stats.pendingOrders, icon: AlertTriangle, color: "bg-yellow-500" },
    { label: "Receita Total", value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "bg-green-500" },
    { label: "Produtos", value: stats.totalProducts, icon: Package, color: "bg-purple-500" },
    { label: "Estoque Baixo", value: stats.lowStockProducts, icon: TrendingUp, color: "bg-red-500" },
    { label: "Clientes", value: stats.activeCustomers, icon: Users, color: "bg-indigo-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimos Pedidos</CardTitle>
          <Link to="/admin/pedidos">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum pedido encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        #{order.id.slice(0, 8)}...
                      </span>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.user?.name || 'Cliente'} • {order.items_count} item(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      R$ {order.total.toFixed(2)}
                    </p>
                    <Link to={`/admin/pedidos`}>
                      <Button variant="ghost" size="sm" className="mt-1">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
