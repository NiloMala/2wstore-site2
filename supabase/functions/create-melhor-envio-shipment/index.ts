import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do pedido
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError) {
      console.error('Order fetch error:', orderError);
      throw new Error(`Erro ao buscar pedido: ${orderError.message}`);
    }

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    console.log('Order found:', order.order_number);

    // Buscar endereço de entrega
    if (!order.shipping_address_id) {
      throw new Error('Pedido não possui endereço de entrega');
    }

    const { data: shippingAddress, error: addressError } = await supabaseClient
      .from('addresses')
      .select('street, number, complement, neighborhood, city, state, zip_code')
      .eq('id', order.shipping_address_id)
      .single();

    if (addressError) {
      console.error('Address fetch error:', addressError);
      throw new Error(`Erro ao buscar endereço: ${addressError.message}`);
    }

    if (!shippingAddress) {
      throw new Error('Endereço de entrega não encontrado');
    }

    console.log('Shipping address found:', shippingAddress.city, shippingAddress.state);

    // Buscar dados do usuário via auth.users
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail = 'cliente@email.com';
    let customerCpf = '';

    if (order.user_id) {
      const { data: userData } = await supabaseClient.auth.admin.getUserById(order.user_id);
      if (userData?.user) {
        customerEmail = userData.user.email || 'cliente@email.com';
        customerName = userData.user.user_metadata?.name ||
                       userData.user.user_metadata?.full_name ||
                       userData.user.email?.split('@')[0] ||
                       'Cliente';
        customerPhone = (userData.user.user_metadata?.phone || userData.user.phone || '').replace(/\D/g, '');
        customerCpf = (userData.user.user_metadata?.cpf || '').replace(/\D/g, '');
      }
    }

    console.log('Customer:', customerName, 'Email:', customerEmail);

    // Verificar se já tem envio criado no Melhor Envio
    if (order.melhor_envio_shipment_id) {
      console.log('Pedido já possui envio no Melhor Envio:', order.melhor_envio_shipment_id);
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Pedido já possui envio criado no Melhor Envio',
          shipment_id: order.melhor_envio_shipment_id,
          shipment_protocol: order.melhor_envio_protocol
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Verificar se já tem tracking code (fallback)
    if (order.tracking_code) {
      console.log('Pedido já possui código de rastreamento:', order.tracking_code);
      return new Response(
        JSON.stringify({ ok: true, message: 'Pedido já possui envio criado', tracking_code: order.tracking_code }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Parse notes para pegar informações do frete
    let notes: any = null;
    let freight: any = null;

    try {
      notes = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
      freight = notes?.freight;
    } catch (parseError) {
      // Se não conseguir fazer parse, provavelmente é um pedido Motoboy (notes é string simples)
      console.log('Notes is not JSON, likely a Motoboy order:', order.notes);
    }

    // Se não tem informações de frete do Melhor Envio, é um pedido Motoboy
    if (!freight || !freight.carrier) {
      console.log('Order does not use Melhor Envio shipping, skipping shipment creation');
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Pedido não utiliza Melhor Envio (provavelmente Motoboy)',
          skipped: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Usar CPF do notes se disponível (preenchido no checkout)
    if (notes?.recipient_cpf) {
      customerCpf = notes.recipient_cpf.replace(/\D/g, '');
      console.log('Using CPF from order notes:', customerCpf);
    }

    // Validações importantes
    if (!customerCpf || customerCpf.length !== 11) {
      throw new Error('CPF do destinatário inválido ou não informado. É obrigatório ter um CPF válido para criar envios no Melhor Envio.');
    }

    if (!customerPhone || customerPhone.length < 10) {
      throw new Error('Telefone do destinatário inválido ou não informado. É obrigatório ter um telefone válido para criar envios no Melhor Envio.');
    }

    // Buscar configuração do Melhor Envio
    const { data: config, error: configError } = await supabaseClient
      .from('shipping_settings')
      .select('*')
      .eq('provider', 'melhor_envio')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('Melhor Envio não configurado. Configure as credenciais do Melhor Envio nas configurações de entrega.');
    }

    // Validar dados de origem
    if (!config.origin_postal_code || !config.origin_name) {
      throw new Error('Dados de origem (loja) incompletos. Configure o endereço da loja nas configurações de entrega.');
    }

    // Validar telefone da loja
    const originPhone = (config.origin_phone || '').replace(/\D/g, '');
    if (!originPhone || originPhone.length < 10) {
      throw new Error('Telefone da loja inválido ou não configurado. Configure um telefone válido (com DDD) nas configurações de entrega.');
    }

    // Preparar endereço do destinatário
    const cleanZipCode = (shippingAddress.zip_code || '').replace(/\D/g, '');
    
    if (cleanZipCode.length !== 8) {
      throw new Error('CEP do destinatário inválido');
    }

    // Normalizar estado para sigla (apenas 2 caracteres)
    const normalizeState = (state: string): string => {
      const stateMap: Record<string, string> = {
        'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amazonas': 'AM',
        'bahia': 'BA', 'ceará': 'CE', 'distrito federal': 'DF', 'espírito santo': 'ES',
        'goiás': 'GO', 'maranhão': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
        'minas gerais': 'MG', 'pará': 'PA', 'paraíba': 'PB', 'paraná': 'PR',
        'pernambuco': 'PE', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
        'rio grande do sul': 'RS', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
        'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO'
      };
      
      const normalized = state.toLowerCase().trim();
      return stateMap[normalized] || state.substring(0, 2).toUpperCase();
    };

    const destinationState = normalizeState(shippingAddress.state || '');
    const originState = normalizeState(config.origin_state || '');

    console.log('Destination state normalized:', destinationState);
    console.log('Origin state normalized:', originState);
    console.log('Raw destination state:', shippingAddress.state);
    console.log('Raw origin state:', config.origin_state);

    // Buscar serviços disponíveis do Melhor Envio para pegar o service_id correto
    const melhorEnvioUrl = config.is_sandbox
      ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate'
      : 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

    // Calcular frete novamente para pegar o service_id correto
    const calculatePayload = {
      from: {
        postal_code: config.origin_postal_code.replace(/\D/g, '')
      },
      to: {
        postal_code: cleanZipCode
      },
      products: notes.items.map((item: any) => ({
        id: item.id,
        width: item.width || 10,
        height: item.height || 10,
        length: item.length || 10,
        weight: item.weight || 0.5,
        insurance_value: item.price || 0,
        quantity: item.quantity || 1
      }))
    };

    const calculateResponse = await fetch(melhorEnvioUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_token}`,
        'User-Agent': '2WL Store (2wlstore.com)'
      },
      body: JSON.stringify(calculatePayload)
    });

    if (!calculateResponse.ok) {
      const errorText = await calculateResponse.text();
      throw new Error(`Erro ao calcular frete para envio: ${errorText}`);
    }

    const carriers = await calculateResponse.json();
    
    // Encontrar o serviço correspondente ao frete selecionado
    const selectedService = carriers.find((c: any) => 
      c.company?.name === freight.carrier && c.name === freight.service
    );

    if (!selectedService || !selectedService.id) {
      throw new Error('Serviço de frete não encontrado');
    }

    // Preparar payload para criar o envio no Melhor Envio
    const cartPayload = {
      service: selectedService.id,
      from: {
        name: config.origin_name || 'Loja',
        phone: originPhone,
        email: config.origin_email || 'contato@loja.com',
        document: config.origin_document?.replace(/\D/g, '') || '',
        address: config.origin_address || '',
        complement: config.origin_complement || '',
        number: config.origin_number || 'S/N',
        district: config.origin_neighborhood || '',
        city: config.origin_city || '',
        state_abbr: originState,
        postal_code: config.origin_postal_code.replace(/\D/g, '')
      },
      to: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        document: customerCpf,
        address: shippingAddress.street || '',
        complement: shippingAddress.complement || '',
        number: shippingAddress.number || 'S/N',
        district: shippingAddress.neighborhood || '',
        city: shippingAddress.city || '',
        state_abbr: destinationState,
        postal_code: cleanZipCode
      },
      products: notes.items.map((item: any) => ({
        name: item.name || 'Produto',
        quantity: item.quantity || 1,
        unitary_value: item.price || 0
      })),
      volumes: notes.items.map((item: any) => ({
        height: item.height || 10,
        width: item.width || 10,
        length: item.length || 10,
        weight: item.weight || 0.5
      })),
      options: {
        insurance_value: order.subtotal,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true,  // Definir como não comercial se não houver NF-e
        invoice: {
          key: order.invoice_number || ''  // Deixar vazio se não tiver nota fiscal modelo 55
        }
      }
    };

    console.log('Melhor Envio Cart Payload:', JSON.stringify(cartPayload, null, 2));
    console.log('CRITICAL - Destination state_abbr:', cartPayload.to.state_abbr);
    console.log('CRITICAL - Origin state_abbr:', cartPayload.from.state_abbr);
    console.log('CRITICAL - Destination postal_code:', cartPayload.to.postal_code);

    // Adicionar ao carrinho do Melhor Envio
    const cartUrl = config.is_sandbox
      ? 'https://sandbox.melhorenvio.com.br/api/v2/me/cart'
      : 'https://melhorenvio.com.br/api/v2/me/cart';

    const cartResponse = await fetch(cartUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_token}`,
        'User-Agent': '2WL Store (2wlstore.com)'
      },
      body: JSON.stringify(cartPayload)
    });

    if (!cartResponse.ok) {
      const errorText = await cartResponse.text();
      console.error('Erro ao adicionar ao carrinho:', errorText);
      console.error('Status:', cartResponse.status);
      console.error('Payload que foi enviado:', JSON.stringify(cartPayload, null, 2));
      throw new Error(`Erro ao criar envio no Melhor Envio: ${errorText}`);
    }

    const cartData = await cartResponse.json();
    console.log('Cart Response:', JSON.stringify(cartData, null, 2));

    const shipmentId = cartData.id;
    const shipmentProtocol = cartData.protocol; // Código do envio (ex: ORD-202601125977997)

    console.log('Envio adicionado ao carrinho do Melhor Envio com ID:', shipmentId);
    console.log('Protocol do envio:', shipmentProtocol);
    console.log('Acesse o painel do Melhor Envio para pagar e gerar a etiqueta');

    // Atualizar pedido com ID e protocol do envio
    await supabaseClient
      .from('orders')
      .update({
        melhor_envio_shipment_id: shipmentId,
        melhor_envio_protocol: shipmentProtocol,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Envio criado no carrinho do Melhor Envio',
        shipment_id: shipmentId,
        shipment_protocol: shipmentProtocol,
        next_steps: 'Acesse o painel do Melhor Envio para pagar e gerar a etiqueta'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Create Shipment Error:', error);
    
    // Melhorar mensagem de erro para o frontend
    let errorMessage = 'Erro desconhecido ao criar envio';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('Detailed error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
