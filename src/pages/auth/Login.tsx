import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { login, resendConfirmationEmail, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/minha-conta', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNeedsConfirmation(false);

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      // Navigation is handled by useEffect when isAuthenticated becomes true
    } else {
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
      }
      toast({
        title: "Erro no login",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    setIsResending(true);

    const result = await resendConfirmationEmail(email);

    if (result.success) {
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    } else {
      toast({
        title: "Erro ao reenviar",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsResending(false);
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-12 flex items-center justify-center bg-muted/30">
      <div className="container max-w-md px-4">
        <Card className="shadow-card">
          <CardHeader className="space-y-1 text-center">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black tracking-tighter">
                <span className="text-primary">2WL</span>
                <span className="text-foreground"> STORE</span>
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold">Entrar na conta</CardTitle>
            <CardDescription>
              Digite seu email e senha para acessar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {needsConfirmation && (
                <Alert className="border-amber-500 bg-amber-50">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <p className="font-medium">Confirme seu email</p>
                    <p className="text-sm mt-1">
                      Enviamos um link de confirmação para seu email. Verifique também a pasta de spam.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-amber-700 hover:text-amber-900"
                      onClick={handleResendEmail}
                      disabled={isResending}
                    >
                      {isResending ? "Reenviando..." : "Reenviar email de confirmação"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    Senha <span className="text-destructive">*</span>
                  </Label>
                  <Link
                    to="/recuperar-senha"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/cadastro" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
