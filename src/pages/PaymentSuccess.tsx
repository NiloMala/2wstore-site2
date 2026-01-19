import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  useEffect(() => {
    // Clear the cart on successful payment
    clearCart();

    // Fetch order details
    const fetchOrder = async () => {
      if (orderId) {
        const { data } = await supabase
          .from("orders")
          .select("order_number")
          .eq("id", orderId)
          .single();

        if (data) {
          setOrderNumber(data.order_number);
        }
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-lg">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Pagamento Aprovado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Seu pedido foi confirmado e está sendo processado.
            </p>

            {orderNumber && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Número do Pedido</p>
                <p className="text-xl font-bold">{orderNumber}</p>
              </div>
            )}

            {paymentId && (
              <div className="text-sm text-muted-foreground">
                ID da Transação: {paymentId}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Você receberá atualizações sobre seu pedido por e-mail e WhatsApp.</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link to="/minha-conta/pedidos">
                  Ver Meus Pedidos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/catalogo">Continuar Comprando</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default PaymentSuccess;
