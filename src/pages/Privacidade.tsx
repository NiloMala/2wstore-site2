import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Privacidade = () => {
  return (
    <main className="min-h-screen bg-muted pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-6">
          Na 2WL STORE, estamos comprometidos em proteger a sua privacidade. Esta
          política descreve como coletamos, usamos e armazenamos seus dados.
        </p>
        <section className="prose max-w-none text-muted-foreground">
          <h2>1. Dados coletados</h2>
          <p>
            Podemos coletar informações pessoais necessárias para processar suas
            compras, como nome, e-mail, endereço de entrega e informações de
            pagamento.
          </p>
          <h2>2. Uso dos dados</h2>
          <p>
            Utilizamos os dados para processar pedidos, melhorar a experiência do
            usuário e enviar comunicações relacionadas a compras e promoções,
            quando autorizado.
          </p>
          <h2>3. Segurança</h2>
          <p>
            Implementamos medidas razoáveis para proteger suas informações, mas
            nenhum método de transmissão é 100% seguro.
          </p>
        </section>

        <div className="mt-8">
          <Button variant="buy" asChild>
            <Link to="/">
              <Home className="h-5 w-5 mr-2" /> Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Privacidade;
