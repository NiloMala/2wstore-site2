import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Termos = () => {
  return (
    <main className="min-h-screen bg-muted pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Termos de Uso</h1>
        <p className="text-muted-foreground mb-6">
          Bem-vindo aos Termos de Uso da 2WL STORE. Aqui descrevemos as regras e
          condições para utilização do site, compras e serviços relacionados.
        </p>
        <section className="prose max-w-none text-muted-foreground">
          <h2>1. Aceitação dos termos</h2>
          <p>
            Ao utilizar nossos serviços, você concorda com estes termos. Se não
            concordar, por favor, não utilize o site.
          </p>
          <h2>2. Cadastro e segurança</h2>
          <p>
            O usuário é responsável por manter a confidencialidade de sua
            conta e senha. Notifique-nos imediatamente sobre qualquer uso
            não autorizado.
          </p>
          <h2>3. Compras e pagamentos</h2>
          <p>
            Todas as compras estão sujeitas à confirmação de pagamento e
            disponibilidade de estoque.
          </p>
          <h2>4. Conteúdo e propriedade intelectual</h2>
          <p>
            Os conteúdos exibidos no site são propriedade da 2WL STORE ou de seus
            licenciadores e não podem ser reproduzidos sem autorização.
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

export default Termos;
