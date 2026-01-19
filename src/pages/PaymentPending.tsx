import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Package, ArrowRight, Copy, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    // Clear the cart - order was created even if payment is pending
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

  const handleCopyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast({ title: "Copiado!", description: "Número do pedido copiado." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-lg">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-600">
              Pagamento Pendente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Seu pedido foi registrado e estamos aguardando a confirmação do pagamento.
            </p>

            {orderNumber && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Número do Pedido</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl font-bold">{orderNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyOrderNumber}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-left space-y-2">
              <p className="font-medium text-yellow-800">O que acontece agora?</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>Aguarde a compensação do pagamento (boleto pode levar até 3 dias úteis)</li>
                <li>Você receberá um e-mail quando o pagamento for confirmado</li>
                <li>Após a confirmação, seu pedido será processado</li>
              </ul>
            </div>

            {paymentId && (
              <div className="text-sm text-muted-foreground">
                ID da Transação: {paymentId}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Acompanhe o status do seu pedido na sua conta.</span>
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

export default PaymentPending;
