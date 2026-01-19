import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Bike, Loader2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { deliveryService } from '@/services/delivery.service';
import { shippingService, type FreightOption } from '@/services/shipping.service';
import { paymentService } from '@/services/payment.service';
import type { DeliveryZone as ServiceDeliveryZone } from '@/services/delivery.service';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user, register } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"motoboy" | "melhor_envio">("motoboy");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");

  // Melhor Envio state
  const [melhorEnvioOptions, setMelhorEnvioOptions] = useState<FreightOption[]>([]);
  const [selectedMelhorEnvioOption, setSelectedMelhorEnvioOption] = useState<FreightOption | null>(null);
  const [loadingFreight, setLoadingFreight] = useState(false);
  const [freightError, setFreightError] = useState<string | null>(null);
  
  const [address, setAddress] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    recipientCpf: "",
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({ email: "", password: "", name: "", phone: "" });

  const [activeZones, setActiveZones] = useState<ServiceDeliveryZone[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<any>(null);

  // Load zones and settings from backend
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [zones, settings] = await Promise.all([
          deliveryService.getActiveZones(),
          deliveryService.getSettings()
        ]);
        if (!mounted) return;
        setActiveZones(zones || []);
        setDeliverySettings(settings || null);
      } catch (err) {
        console.error('Erro ao carregar zonas/configurações de entrega', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Check if motoboy delivery is available for the customer's location
  const availableMotoboyZones = useMemo(() => {
    if (!address.neighborhood || !address.city) return [];

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9\s]/g, "");

    const customerNeighborhood = normalize(address.neighborhood);
    const customerCity = normalize(address.city);

    return activeZones.filter((zone: any) => {
      if (!zone.is_active && !zone.isActive) return false;

      const neighborhoods: string[] = zone.neighborhoods || zone.neighborhoods_text || [];

      return neighborhoods.some((n) => {
        const zoneNeighborhood = normalize(n);
        return (
          zoneNeighborhood === customerNeighborhood ||
          zoneNeighborhood === customerCity ||
          customerNeighborhood.includes(zoneNeighborhood) ||
          zoneNeighborhood.includes(customerNeighborhood)
        );
      });
    });
  }, [address.neighborhood, address.city, activeZones]);

  const hasMotoboyOption = availableMotoboyZones.length > 0;

  // Auto-select first motoboy zone when available and none selected
  useEffect(() => {
    if (hasMotoboyOption && !selectedZoneId && shippingMethod === "motoboy") {
      setSelectedZoneId(availableMotoboyZones[0].id);
    }
  }, [hasMotoboyOption, selectedZoneId, shippingMethod, availableMotoboyZones]);

  // Also auto-select when switching to motoboy method
  useEffect(() => {
    if (shippingMethod === "motoboy" && hasMotoboyOption && !selectedZoneId) {
      setSelectedZoneId(availableMotoboyZones[0].id);
    }
  }, [shippingMethod, hasMotoboyOption, selectedZoneId, availableMotoboyZones]);

  const selectedZone = useMemo(() => {
    return activeZones.find((z) => String(z.id) === String(selectedZoneId));
  }, [selectedZoneId, activeZones]);

  // Calculate shipping
  const motoboyShipping = selectedZone?.price || (availableMotoboyZones[0]?.price ?? 0);
  const melhorEnvioShipping = selectedMelhorEnvioOption?.final_price ?? 0;

  const shipping = shippingMethod === "motoboy" && selectedZone
    ? motoboyShipping
    : shippingMethod === "melhor_envio" && selectedMelhorEnvioOption
    ? melhorEnvioShipping
    : 0;

  // Check for free delivery (motoboy only - Melhor Envio doesn't have free delivery)
  const freeThreshold = deliverySettings?.free_delivery_threshold ?? deliverySettings?.freeDeliveryThreshold ?? null;
  const isFreeDelivery = freeThreshold && totalPrice >= Number(freeThreshold) && shippingMethod === "motoboy";

  const finalShipping = isFreeDelivery ? 0 : shipping;
  const total = totalPrice + finalShipping;

  const _recipientCpfDigits = (address.recipientCpf ?? '').replace(/\D/g, '');
  const isValidCpf = _recipientCpfDigits.length === 11 && !/^0+$/.test(_recipientCpfDigits);

  // Calculate Melhor Envio freight when CEP changes
  useEffect(() => {
    const calculateMelhorEnvioFreight = async () => {
      const cleanZip = (address.zipCode ?? '').replace(/\D/g, "");
      if (cleanZip.length !== 8 || items.length === 0) {
        setMelhorEnvioOptions([]);
        setSelectedMelhorEnvioOption(null);
        return;
      }

      setLoadingFreight(true);
      setFreightError(null);

      try {
        // Build products array for freight calculation
        // Using default dimensions if product doesn't have them
        const products = items.map(item => ({
          weight: 0.3, // Default 300g per item
          height: 5,   // Default 5cm
          width: 20,   // Default 20cm
          length: 30,  // Default 30cm
          quantity: item.quantity,
          insurance_value: item.price * item.quantity,
        }));

        const result = await shippingService.calculateFreight(cleanZip, products);

        if (result.error) {
          setFreightError(result.error);
          setMelhorEnvioOptions([]);
        } else {
          setMelhorEnvioOptions(result.carriers || []);
          // Auto-select cheapest option
          if (result.carriers && result.carriers.length > 0) {
            setSelectedMelhorEnvioOption(result.carriers[0]);
          }
        }
      } catch (error: any) {
        console.error('Erro ao calcular frete:', error);
        setFreightError(error.message || 'Erro ao calcular frete');
        setMelhorEnvioOptions([]);
      } finally {
        setLoadingFreight(false);
      }
    };

    calculateMelhorEnvioFreight();
  }, [address.zipCode, items]);

  const handleZipCodeChange = async (zipCode: string) => {
    setAddress({ ...address, zipCode });
    if (zipCode.replace(/\D/g, "").length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setAddress({
            ...address,
            zipCode,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        }
      } catch (error) {
        console.log("CEP não encontrado");
      }
    }
  };

  // Fetch user's saved addresses
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated || !user) {
        setAddresses([]);
        return;
      }
      setLoadingAddresses(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error('Error loading addresses:', error);
        setAddresses([]);
      } else {
        setAddresses(data || []);
        if ((data || []).length > 0) {
          // prefill with default address if any
          const def = (data || []).find((a: any) => a.is_default) || (data || [])[0];
          if (def) setAddress({
            zipCode: def.zip_code || '',
            street: def.street || '',
            number: def.number || '',
            complement: def.complement || '',
            neighborhood: def.neighborhood || '',
            city: def.city || '',
            state: def.state || '',
          });
        }
      }
      setLoadingAddresses(false);
    };
    load();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  const handleRegister = async () => {
    const { email, password, name, phone } = registerData;
    if (!email || !password || !name) {
      toast({ title: 'Preencha nome, email e senha.' });
      return;
    }
    const res = await register(email, password, name, phone);
    if (!res.success) {
      toast({ title: 'Erro ao criar conta', description: res.error });
      return;
    }
    if (res.needsConfirmation) {
      toast({ title: 'Cadastro realizado', description: 'Confirme seu e-mail para continuar.' });
    } else {
      toast({ title: 'Cadastro realizado', description: 'Você foi logado com sucesso.' });
    }
    setShowRegisterForm(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Erro', description: 'Você precisa estar logado.' });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Get the selected address to save with the order
      const selectedAddress = addresses.find(
        (a) => a.zip_code === address.zipCode && a.street === address.street
      ) || addresses[0];

      // 2. Generate order number
      const orderNumber = `2WL-${Date.now().toString(36).toUpperCase()}`;

      // 3. Build notes with shipping info for Melhor Envio
      let orderNotes: string;
      if (shippingMethod === 'motoboy') {
        orderNotes = `Motoboy - ${selectedZone?.name}`;
      } else if (selectedMelhorEnvioOption) {
        // Save complete freight info for Melhor Envio shipment creation
        const freightData = {
          freight: {
            carrier: selectedMelhorEnvioOption.company,
            service: selectedMelhorEnvioOption.name,
            price: selectedMelhorEnvioOption.final_price,
            delivery_time: selectedMelhorEnvioOption.delivery_time,
            service_id: selectedMelhorEnvioOption.id,
          },
          recipient_cpf: (address.recipientCpf ?? '').replace(/\D/g, ''),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            weight: 0.3,  // Default 300g
            height: 5,    // Default 5cm
            width: 20,    // Default 20cm
            length: 30,   // Default 30cm
          })),
        };
        orderNotes = JSON.stringify(freightData);
      } else {
        orderNotes = '';
      }

      // 4. Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          subtotal: totalPrice,
          shipping: finalShipping,
          total: total,
          shipping_address_id: selectedAddress?.id || null,
          notes: orderNotes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 5. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize,
        color: item.selectedColor,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 6. Create Mercado Pago preference
      const mpItems = items.map((item) => ({
        title: `${item.name} - ${item.selectedSize} / ${item.selectedColor}`,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL',
      }));

      // Add shipping as an item
      if (finalShipping > 0) {
        mpItems.push({
          title: shippingMethod === 'motoboy'
            ? `Frete Motoboy - ${selectedZone?.name}`
            : `Frete ${selectedMelhorEnvioOption?.company}`,
          quantity: 1,
          unit_price: finalShipping,
          currency_id: 'BRL',
        });
      }

      const preference = await paymentService.createPreference({
        orderId: order.id,
        amount: total,
        items: mpItems,
        externalReference: order.id,
        backUrls: {
          success: `${window.location.origin}/pagamento/sucesso?order_id=${order.id}`,
          failure: `${window.location.origin}/pagamento/falha?order_id=${order.id}`,
          pending: `${window.location.origin}/pagamento/pendente?order_id=${order.id}`,
        },
      });

      // 6. Redirect to Mercado Pago checkout
      // Use init_point for production or sandbox_init_point for sandbox
      const checkoutUrl = preference.init_point || preference.sandbox_init_point;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não disponível');
      }

    } catch (error: any) {
      console.error('Erro ao processar pedido:', error);
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error);
      toast({
        title: 'Erro ao processar pedido',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">
            Adicione produtos ao carrinho para continuar com a compra.
          </p>
          <Button asChild>
            <Link to="/catalogo">Ver Produtos</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Faça login para continuar</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para finalizar a compra.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Button asChild>
              <Link to="/login">Fazer Login</Link>
            </Button>
            <Button variant="secondary" onClick={() => setShowRegisterForm(s => !s)}>
              {showRegisterForm ? 'Fechar Cadastro' : 'Criar Conta'}
            </Button>
          </div>

          {showRegisterForm && (
            <Card>
              <CardHeader>
                <CardTitle>Cadastro rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRegister}>Criar Conta</Button>
                  <Button variant="outline" asChild>
                    <Link to="/cadastro">Ir para cadastro completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/catalogo">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  1
                </div>
                <span className="font-medium">Endereço e Entrega</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  2
                </div>
                <span className="font-medium">Revisar e Pagar</span>
              </div>
            </div>

            {/* Step 1: Address */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label>CEP</Label>
                      <Input
                        value={address.zipCode ?? ''}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label>Rua</Label>
                      <Input
                        value={address.street ?? ''}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Número</Label>
                        <Input
                          value={address.number ?? ''}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Complemento</Label>
                        <Input
                          value={address.complement ?? ''}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Apto, Bloco..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input
                        value={address.neighborhood ?? ''}
                        onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cidade</Label>
                        <Input
                          value={address.city ?? ''}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <Input
                          value={address.state ?? ''}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>CPF do Destinatário</Label>
                      <Input
                        value={address.recipientCpf ?? ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value
                            .replace(/(\d{3})(\d)/, '$1.$2')
                            .replace(/(\d{3})(\d)/, '$1.$2')
                            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                          setAddress({ ...address, recipientCpf: formatted });
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                        <p className="text-xs text-muted-foreground mt-1">Necessário para envio via Correios/Transportadoras</p>
                        {/* Validation message when transportadora selected */}
                        {shippingMethod === 'melhor_envio' && !isValidCpf && (
                          <p className="text-sm text-destructive mt-2">Preencha um CPF válido do destinatário para prosseguir com envio por transportadora.</p>
                        )}
                    </div>
                  </div>

                  {/* User saved addresses */}
                  {loadingAddresses ? (
                    <p>Carregando endereços...</p>
                  ) : addresses && addresses.length > 0 ? (
                    <div className="mb-4">
                      <Label className="mb-2">Endereços cadastrados</Label>
                      <div className="space-y-2">
                        {addresses.map((a) => (
                          <div key={a.id} className={`p-2 border rounded cursor-pointer ${address.zipCode === a.zip_code ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'}`} onClick={() => setAddress({ zipCode: a.zip_code, street: a.street, number: a.number, complement: a.complement, neighborhood: a.neighborhood, city: a.city, state: a.state })}>
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{a.street}, {a.number}{a.complement ? ` - ${a.complement}` : ''}</p>
                                <p className="text-xs text-muted-foreground">{a.neighborhood} - {a.city} / {a.state} • CEP: {a.zip_code}</p>
                              </div>
                              <div className="text-sm">{a.is_default ? 'Padrão' : ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <Button asChild variant="ghost">
                          <Link to="/minha-conta/enderecos">Gerenciar endereços</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Você ainda não possui endereços cadastrados. É necessário cadastrar um endereço para prosseguir com a compra.</p>
                      <div className="mt-2">
                        <Button asChild>
                          <Link to="/minha-conta/enderecos">Cadastrar Endereço</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Shipping Method Selection */}
                  {address.city && (
                    <div className="pt-4 border-t">
                      <Label className="text-base font-semibold mb-3 block">Método de Entrega</Label>
                      <RadioGroup value={shippingMethod} onValueChange={(value: "motoboy" | "melhor_envio") => setShippingMethod(value)}>
                        {/* Motoboy Option */}
                        {hasMotoboyOption && (deliverySettings?.is_motoboy_enabled ?? deliverySettings?.isMotoboyEnabled ?? true) && (
                          <div
                            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 mb-3 ${
                              shippingMethod === "motoboy" ? "border-primary/50 bg-primary/5" : ""
                            }`}
                            onClick={() => setShippingMethod("motoboy")}
                          >
                            <RadioGroupItem value="motoboy" id="motoboy" className="mt-1" />
                            <Label htmlFor="motoboy" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-2">
                                <Bike className="h-5 w-5 text-primary" />
                                <span className="font-medium">Entrega via Motoboy</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Disponível para sua região!
                                </span>
                              </div>
                              {availableMotoboyZones.map((zone) => (
                                <div
                                  key={zone.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedZoneId(zone.id);
                                    setShippingMethod("motoboy");
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-md mb-1 cursor-pointer transition-colors ${
                                    selectedZoneId === zone.id && shippingMethod === "motoboy" ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                                  }`}
                                >
                                  <div>
                                    <p className="text-sm font-medium">{zone.name}</p>
                                    <p className="text-xs text-muted-foreground">{zone.estimatedTime}</p>
                                  </div>
                                  <div className="text-right">
                                    {isFreeDelivery ? (
                                      <div>
                                        <span className="text-sm line-through text-muted-foreground">R$ {zone.price.toFixed(2)}</span>
                                        <span className="text-sm font-medium text-green-600 ml-2">Grátis</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm font-medium">R$ {zone.price.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {freeThreshold && !isFreeDelivery && (
                                <p className="text-xs text-muted-foreground mt-2">Frete grátis para pedidos acima de R$ {Number(freeThreshold).toFixed(2)}</p>
                              )}
                            </Label>
                          </div>
                        )}

                        {/* Melhor Envio Options (Correios/Jadlog) */}
                        <div
                          className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                            shippingMethod === "melhor_envio" ? "border-primary/50 bg-primary/5" : ""
                          }`}
                          onClick={() => melhorEnvioOptions.length > 0 && setShippingMethod("melhor_envio")}
                        >
                          <RadioGroupItem
                            value="melhor_envio"
                            id="melhor_envio"
                            className="mt-1"
                            disabled={melhorEnvioOptions.length === 0 && !loadingFreight}
                          />
                          <Label htmlFor="melhor_envio" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-5 w-5 text-primary" />
                              <span className="font-medium">Envio por Transportadora</span>
                              <span className="text-xs text-muted-foreground">(Correios / Jadlog)</span>
                            </div>

                            {loadingFreight ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Calculando frete...
                              </div>
                            ) : freightError ? (
                              <p className="text-sm text-destructive py-2">{freightError}</p>
                            ) : melhorEnvioOptions.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">
                                {(address.zipCode ?? '').replace(/\D/g, "").length === 8
                                  ? "Nenhuma opção disponível para este CEP"
                                  : "Digite o CEP para calcular o frete"}
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {melhorEnvioOptions.map((option) => (
                                  <div
                                    key={option.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMelhorEnvioOption(option);
                                      setShippingMethod("melhor_envio");
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                                      selectedMelhorEnvioOption?.id === option.id && shippingMethod === "melhor_envio"
                                        ? "bg-primary/10 border border-primary/30"
                                        : "hover:bg-muted/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {option.company_logo && (
                                        <img
                                          src={option.company_logo}
                                          alt={option.company}
                                          className="h-6 w-auto object-contain"
                                        />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium">
                                          {option.company} - {option.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {option.delivery_time} {option.delivery_time === 1 ? 'dia útil' : 'dias úteis'}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-sm font-medium">
                                      R$ {option.final_price.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Label>
                        </div>

                        {/* No options available message */}
                        {!hasMotoboyOption && melhorEnvioOptions.length === 0 && !loadingFreight && (
                          <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                            Nenhuma opção de entrega disponível para seu endereço.
                          </div>
                        )}
                      </RadioGroup>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    onClick={() => setStep(2)}
                    disabled={
                      addresses.length === 0 ||
                      (shippingMethod === "motoboy" && !selectedZoneId) ||
                      (shippingMethod === "melhor_envio" && !selectedMelhorEnvioOption) ||
                      (shippingMethod === "melhor_envio" && (address.recipientCpf ?? '').replace(/\D/g, '').length !== 11)
                    }
                  >
                    Revisar Pedido
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Review & Pay */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Confirmar Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                    <p className="text-muted-foreground">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                      <br />
                      {address.neighborhood} - {address.city}, {address.state}
                      <br />
                      CEP: {address.zipCode}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Método de Entrega</h3>
                    <p className="text-muted-foreground flex items-center gap-2">
                      {shippingMethod === "motoboy" ? (
                        <>
                          <Bike className="h-4 w-4" />
                          Motoboy - {selectedZone?.name} ({selectedZone?.estimatedTime})
                          {isFreeDelivery && <span className="text-green-600 font-medium">Frete Grátis</span>}
                        </>
                      ) : shippingMethod === "melhor_envio" && selectedMelhorEnvioOption ? (
                        <>
                          <Package className="h-4 w-4" />
                          {selectedMelhorEnvioOption.company} - {selectedMelhorEnvioOption.name} ({selectedMelhorEnvioOption.delivery_time} dias úteis)
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4" />
                          Transportadora
                        </>
                      )}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.selectedSize} • {item.selectedColor} • Qtd: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mercado Pago info */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Pagamento via Mercado Pago</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Ao continuar, você será redirecionado para o Mercado Pago onde poderá escolher sua forma de pagamento: Cartão de Crédito, PIX, Boleto e mais.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-[#009ee3] hover:bg-[#0087c9]"
                      disabled={isProcessing || addresses.length === 0}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        `Pagar R$ ${total.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedSize} • Qtd: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Frete
                      {shippingMethod === "motoboy" ? (
                        <Bike className="h-3 w-3" />
                      ) : shippingMethod === "melhor_envio" ? (
                        <Package className="h-3 w-3" />
                      ) : (
                        <Truck className="h-3 w-3" />
                      )}
                    </span>
                    {isFreeDelivery ? (
                      <div>
                        <span className="line-through text-muted-foreground text-xs mr-1">
                          R$ {shipping.toFixed(2)}
                        </span>
                        <span className="text-green-600 font-medium">Grátis</span>
                      </div>
                    ) : (
                      <span>R$ {finalShipping.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Pagamento 100% seguro</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
