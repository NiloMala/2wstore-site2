import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Eye,
  Truck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getOrderStatusLabel, getOrderStatusColor } from "@/lib/orderHelpers";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MyOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated || !user) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), shipping_address:shipping_address_id(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    };
    load();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Meus Pedidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não fez nenhum pedido.
            </p>
            <Link to="/catalogo">
              <Button>Ver produtos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">Pedido {order.order_number || order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at || order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                      <p className="font-bold">
                        R$ {(order.total || order.total_amount || 0).toFixed(2).replace('.', ',')}
                      </p>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {expandedOrder === order.id && (
                  <div className="p-4 border-t border-border animate-fade-in">
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {(order.order_items || order.items || []).map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                            <img
                              src={item.product_image || item.image || '/placeholder.svg'}
                              alt={item.product_name || item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name || item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Tam: {item.size || 'N/A'} | Cor: {item.color || 'N/A'} | Qtd: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            R$ {((item.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="p-4 bg-muted/30 rounded-lg mb-4">
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Endereço de entrega</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shipping_address?.street || order.shippingAddress?.street}, {order.shipping_address?.number || order.shippingAddress?.number}
                            {(order.shipping_address?.complement || order.shippingAddress?.complement) && ` - ${order.shipping_address?.complement || order.shippingAddress?.complement}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.shipping_address?.neighborhood || order.shippingAddress?.neighborhood}, {order.shipping_address?.city || order.shippingAddress?.city} - {order.shipping_address?.state || order.shippingAddress?.state}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            CEP: {order.shipping_address?.zip_code || order.shippingAddress?.zipCode}
                          </p>
                          {order.trackingCode && (
                            <p className="text-sm mt-2">
                              <span className="text-muted-foreground">Rastreio: </span>
                              <span className="font-mono font-semibold text-primary">
                                {order.tracking_code || order.trackingCode}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/minha-conta/pedidos/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </Link>
                      {order.trackingCode && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          Rastrear pedido
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyOrders;
