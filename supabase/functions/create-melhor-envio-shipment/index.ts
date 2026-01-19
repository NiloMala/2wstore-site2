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
    const notes = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
    const freight = notes?.freight;

    if (!freight || !freight.carrier) {
      throw new Error('Informações de frete não encontradas no pedido');
    }

    // Buscar configuração do Melhor Envio
    const { data: config, error: configError } = await supabaseClient
      .from('shipping_settings')
      .select('*')
      .eq('provider', 'melhor_envio')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('Melhor Envio não configurado');
    }

    // Preparar endereço do destinatário
    const cleanZipCode = (shippingAddress.zip_code || '').replace(/\D/g, '');
    
    if (cleanZipCode.length !== 8) {
      throw new Error('CEP do destinatário inválido');
    }

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
        phone: config.origin_phone?.replace(/\D/g, '') || '',
        email: config.origin_email || 'contato@loja.com',
        document: config.origin_document?.replace(/\D/g, '') || '',
        address: config.origin_address || '',
        complement: config.origin_complement || '',
        number: config.origin_number || 'S/N',
        district: config.origin_neighborhood || '',
        city: config.origin_city || '',
        state_abbr: config.origin_state || '',
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
        state_abbr: shippingAddress.state || '',
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
