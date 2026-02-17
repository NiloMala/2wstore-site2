import { useState, useEffect } from "react";
import { Truck, Loader2, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { shippingService } from "@/services";
import type { ShippingSettings } from "@/services";

const AdminShipping = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings | null>(null);

  // Form fields
  const [apiToken, setApiToken] = useState("");
  const [isSandbox, setIsSandbox] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  // Origin (Store) Address
  const [originName, setOriginName] = useState("");
  const [originEmail, setOriginEmail] = useState("");
  const [originPhone, setOriginPhone] = useState("");
  const [originDocument, setOriginDocument] = useState("");
  const [originPostalCode, setOriginPostalCode] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [originNumber, setOriginNumber] = useState("");
  const [originComplement, setOriginComplement] = useState("");
  const [originNeighborhood, setOriginNeighborhood] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [originState, setOriginState] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await shippingService.getMelhorEnvioSettings();
      if (data) {
        setSettings(data);
        setApiToken(data.api_token || "");
        setIsSandbox(data.is_sandbox ?? true);
        setIsActive(data.is_active ?? false);
        setOriginName(data.origin_name || "");
        setOriginEmail(data.origin_email || "");
        setOriginPhone(data.origin_phone || "");
        setOriginDocument(data.origin_document || "");
        setOriginPostalCode(data.origin_postal_code || "");
        setOriginAddress(data.origin_address || "");
        setOriginNumber(data.origin_number || "");
        setOriginComplement(data.origin_complement || "");
        setOriginNeighborhood(data.origin_neighborhood || "");
        setOriginCity(data.origin_city || "");
        setOriginState(data.origin_state || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do Melhor Envio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validações
    if (isActive && !apiToken) {
      toast({
        title: "Erro",
        description: "Token da API é obrigatório quando o serviço está ativo.",
        variant: "destructive",
      });
      return;
    }

    if (isActive && (!originName || !originPostalCode || !originPhone)) {
      toast({
        title: "Erro",
        description: "Nome da loja, CEP e Telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar telefone (mínimo 10 dígitos)
    const cleanPhone = originPhone.replace(/\D/g, '');
    if (isActive && cleanPhone.length < 10) {
      toast({
        title: "Erro",
        description: "Telefone inválido. Digite um telefone com DDD (ex: 11999999999).",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        provider: 'melhor_envio',
        api_token: apiToken,
        is_sandbox: isSandbox,
        is_active: isActive,
        origin_name: originName,
        origin_email: originEmail,
        origin_phone: originPhone,
        origin_document: originDocument,
        origin_postal_code: originPostalCode,
        origin_address: originAddress,
        origin_number: originNumber,
        origin_complement: originComplement,
        origin_neighborhood: originNeighborhood,
        origin_city: originCity,
        origin_state: originState,
      };

      await shippingService.updateMelhorEnvioSettings(data);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do Melhor Envio foram atualizadas com sucesso.",
      });

      await loadSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Melhor Envio</h1>
        <p className="text-muted-foreground">
          Configure a integração com o Melhor Envio para cálculo de frete
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você pode obter seu token de API no painel do Melhor Envio em{" "}
          <a
            href="https://melhorenvio.com.br/painel/gerenciar/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            Configurações → Tokens
          </a>
        </AlertDescription>
      </Alert>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Configurações da API</CardTitle>
                <CardDescription>
                  Token e ambiente de integração
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="apiToken">Token da API *</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Digite o token da API do Melhor Envio"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Modo Sandbox (Teste)</p>
              <p className="text-sm text-muted-foreground">
                Use o ambiente de testes do Melhor Envio
              </p>
            </div>
            <Switch
              checked={isSandbox}
              onCheckedChange={setIsSandbox}
            />
          </div>
        </CardContent>
      </Card>

      {/* Store Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço da Loja (Origem)</CardTitle>
          <CardDescription>
            Endereço de onde os produtos serão enviados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="originName">Nome da Loja *</Label>
              <Input
                id="originName"
                placeholder="Ex: Minha Loja"
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originEmail">E-mail</Label>
              <Input
                id="originEmail"
                type="email"
                placeholder="contato@loja.com"
                value={originEmail}
                onChange={(e) => setOriginEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originPhone">Telefone (com DDD) *</Label>
              <Input
                id="originPhone"
                placeholder="11999999999"
                value={originPhone}
                onChange={(e) => setOriginPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite apenas números, com DDD
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originDocument">CPF/CNPJ</Label>
              <Input
                id="originDocument"
                placeholder="000.000.000-00"
                value={originDocument}
                onChange={(e) => setOriginDocument(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originPostalCode">CEP *</Label>
              <Input
                id="originPostalCode"
                placeholder="00000-000"
                value={originPostalCode}
                onChange={(e) => setOriginPostalCode(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originAddress">Endereço</Label>
              <Input
                id="originAddress"
                placeholder="Rua, Avenida..."
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originNumber">Número</Label>
              <Input
                id="originNumber"
                placeholder="123"
                value={originNumber}
                onChange={(e) => setOriginNumber(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originComplement">Complemento</Label>
              <Input
                id="originComplement"
                placeholder="Apto, Sala..."
                value={originComplement}
                onChange={(e) => setOriginComplement(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originNeighborhood">Bairro</Label>
              <Input
                id="originNeighborhood"
                placeholder="Centro"
                value={originNeighborhood}
                onChange={(e) => setOriginNeighborhood(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originCity">Cidade</Label>
              <Input
                id="originCity"
                placeholder="São Paulo"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="originState">Estado (Sigla)</Label>
              <Input
                id="originState"
                placeholder="SP"
                maxLength={2}
                value={originState}
                onChange={(e) => setOriginState(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">
                Digite apenas a sigla (ex: SP, RJ, MG)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminShipping;
