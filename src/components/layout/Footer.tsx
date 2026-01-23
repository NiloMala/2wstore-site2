import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone, X, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const FooterContent = () => (
    <>
      {/* Brand */}
      <div>
        <Link to="/" className="inline-flex items-center gap-3 mb-4">
          <span className="text-2xl font-black tracking-tighter">
            <span className="text-primary">2WL</span>
            <span className="text-secondary-foreground"> STORE</span>
          </span>
        </Link>
        <p className="text-muted-foreground text-sm">
          Estilo que domina a rua. Moda urbana para quem não segue tendências, mas as cria.
        </p>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-base font-bold mb-3 uppercase tracking-wider">Links</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/catalogo" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Produtos
            </Link>
          </li>
          <li>
            <Link to="/catalogo?category=camisetas" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Camisetas
            </Link>
          </li>
          <li>
            <Link to="/catalogo?category=moletons" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Moletons
            </Link>
          </li>
          <li>
            <Link to="/catalogo?category=calcas" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Calças
            </Link>
          </li>
        </ul>
      </div>

      {/* Suporte */}
      <div>
        <h3 className="text-base font-bold mb-3 uppercase tracking-wider">Suporte</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/trocas" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Trocas e Devoluções
            </Link>
          </li>
          <li>
            <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Termos de Uso
            </Link>
          </li>
          <li>
            <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Política de Privacidade
            </Link>
          </li>
        </ul>
      </div>

      {/* Contato */}
      <div>
        <h3 className="text-base font-bold mb-3 uppercase tracking-wider">Contato</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground text-sm">contato.2wlstore@gmail.com</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground text-sm">(12) 99703-5077</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground text-sm">
              Caraguatatuba, SP - Brasil
            </span>
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Footer - Hidden on mobile */}
      <footer className="hidden md:block bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <span className="text-3xl font-black tracking-tighter">
                  <span className="text-primary">2WL</span>
                  <span className="text-secondary-foreground"> STORE</span>
                </span>
              </Link>
              <p className="text-muted-foreground mb-6">
                Estilo que domina a rua. Moda urbana para quem não segue tendências, mas as cria.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/2wlstoree__?igsh=NnhzbGwwNTJuanQy&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Loja</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/catalogo?category=camisetas" className="text-muted-foreground hover:text-primary transition-colors">
                    Camisetas
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=moletons" className="text-muted-foreground hover:text-primary transition-colors">
                    Moletons
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=calcas" className="text-muted-foreground hover:text-primary transition-colors">
                    Calças
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=shorts" className="text-muted-foreground hover:text-primary transition-colors">
                    Shorts
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=acessorios" className="text-muted-foreground hover:text-primary transition-colors">
                    Acessórios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Ajuda</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                    Política de privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/trocas" className="text-muted-foreground hover:text-primary transition-colors">
                    Trocas e devoluções
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Rua: José Jeronimo Soares, 26<br />
                    Caraguatatuba, SP
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">(12) 99703-5077</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">contato.2wlstore@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-muted">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 2WL STORE. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-4">
                <img src="https://img.icons8.com/color/48/pix.png" alt="Pix" className="h-8" />
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8" />
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Footer Toggle Button */}
      <div className="md:hidden fixed bottom-[100px] left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Footer Drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[60] transition-opacity duration-300",
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-secondary text-secondary-foreground rounded-t-3xl max-h-[85vh] overflow-y-auto transition-transform duration-300 ease-out",
            isDrawerOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          {/* Header */}
          <div className="sticky top-0 bg-secondary flex items-center justify-between p-4 border-b border-muted">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter">
                <span className="text-primary">2WL</span>
                <span className="text-secondary-foreground"> STORE</span>
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <FooterContent />

            {/* Social */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://www.instagram.com/2wlstoree__?igsh=NnhzbGwwNTJuanQy&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="pt-4 border-t border-muted">
              <p className="text-xs text-muted-foreground text-center">
                © 2026 2WL STORE. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
