import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Trocas = () => {
  return (
    <main className="min-h-screen bg-muted pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Trocas e Devoluções</h1>
        <p className="text-muted-foreground mb-6">
          Nossa política de trocas e devoluções garante que você possa solicitar
          troca ou reembolso dentro do prazo especificado, mediante atendimento
          aos requisitos abaixo.
        </p>
        <section className="prose max-w-none text-muted-foreground">
          <h2>1. Prazo</h2>
          <p>
            Você tem 7 dias corridos, a partir do recebimento, para solicitar
            devolução ou troca em produtos elegíveis.
          </p>
          <h2>2. Condições</h2>
          <p>
            O produto deve estar sem uso, com etiquetas e embalagem original.
            Produtos em promoção podem ter regras específicas.
          </p>
          <h2>3. Processo</h2>
          <p>
            Para iniciar, entre em contato com nosso suporte pelo e-mail informado
            no site e informe o número do pedido e motivo.
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

export default Trocas;
