import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ShoppingCart } from "lucide-react";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");
  const errorMessage = searchParams.get("error");

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-lg">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Pagamento Recusado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Infelizmente seu pagamento não foi aprovado. Isso pode acontecer por diversos motivos.
            </p>

            <div className="bg-muted p-4 rounded-lg text-left space-y-2">
              <p className="font-medium">Possíveis causas:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Cartão com limite insuficiente</li>
                <li>Dados do cartão incorretos</li>
                <li>Transação não autorizada pelo banco</li>
                <li>Cartão vencido ou bloqueado</li>
              </ul>
            </div>

            {errorMessage && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link to="/checkout">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/carrinho">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ver Carrinho
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Se o problema persistir, entre em contato conosco pelo WhatsApp.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default PaymentFailure;
