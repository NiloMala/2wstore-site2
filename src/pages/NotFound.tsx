import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted pt-20">
      <div className="text-center px-4">
        <h1 className="text-8xl lg:text-9xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl lg:text-3xl font-bold mb-4">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Ops! A página que você está procurando não existe ou foi movida.
        </p>
        <Button variant="buy" size="xl" asChild>
          <Link to="/">
            <Home className="h-5 w-5 mr-2" />
            Voltar para o início
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
