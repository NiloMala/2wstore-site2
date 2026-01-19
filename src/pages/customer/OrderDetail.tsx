import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin
} from "lucide-react";
import { getOrderStatusLabel, getOrderStatusColor } from "@/lib/orderHelpers";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated || !user || !orderId) {
        if (mounted) {
          setOrder(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), shipping_address:shipping_address_id(*)')
        .eq('user_id', user.id)
        .eq('id', orderId)
        .single();

      if (!mounted) return;
      if (error) {
        console.error('Error loading order:', error);
        setOrder(null);
      } else {
        setOrder(data || null);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [isAuthenticated, user, orderId]);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6 text-center">Carregando...</CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Pedido não encontrado</h3>
          <Link to="/minha-conta/pedidos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos pedidos
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const statusSteps = [
    { status: 'pending', label: 'Pendente', icon: Clock },
    { status: 'confirmed', label: 'Confirmado', icon: CheckCircle },
    { status: 'shipped', label: 'Enviado', icon: Truck },
    { status: 'delivered', label: 'Entregue', icon: Package },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/minha-conta/pedidos" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar aos pedidos
          </Link>
          <h2 className="text-2xl font-bold">Pedido {order.id}</h2>
          <p className="text-muted-foreground">
            Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        <Badge className={`${getOrderStatusColor(order.status)} text-sm px-4 py-2`}>
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
              
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(order.order_items || order.items || []).map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.product_name || item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.product_name || item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Tamanho: {item.size} | Cor: {item.color}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    R$ {((item.price || item.unit_price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    R$ {(item.price || item.unit_price || 0).toFixed(2).replace('.', ',')} cada
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                R$ {(order.total || order.total_amount || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="font-medium">
              {order.shipping_address?.street || order.shippingAddress?.street}, {order.shipping_address?.number || order.shippingAddress?.number}
              {(order.shipping_address?.complement || order.shippingAddress?.complement) && ` - ${order.shipping_address?.complement || order.shippingAddress?.complement}`}
            </p>
            <p className="text-muted-foreground">
              {order.shipping_address?.neighborhood || order.shippingAddress?.neighborhood}, {order.shipping_address?.city || order.shippingAddress?.city} - {order.shipping_address?.state || order.shippingAddress?.state}
            </p>
            <p className="text-muted-foreground">
              CEP: {order.shipping_address?.zip_code || order.shippingAddress?.zipCode}
            </p>
          </div>

          {(order.tracking_code || order.trackingCode) && (
            <div className="mt-4 p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Código de rastreio:</p>
              <p className="font-mono font-bold text-primary text-lg">{order.tracking_code || order.trackingCode}</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Truck className="h-4 w-4 mr-2" />
                Rastrear pedido
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
