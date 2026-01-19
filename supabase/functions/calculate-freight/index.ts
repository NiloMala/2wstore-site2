import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  weight: number;      // kg
  height: number;      // cm
  width: number;       // cm
  length: number;      // cm
  quantity: number;
  insurance_value?: number;
}

interface FreightRequest {
  to_postal_code: string;
  products: Product[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Buscar configuração do Melhor Envio
    const { data: config, error: configError } = await supabaseClient
      .from('shipping_settings')
      .select('api_token, origin_postal_code, is_sandbox')
      .eq('provider', 'melhor_envio')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('Melhor Envio não configurado');
    }

    const { to_postal_code, products }: FreightRequest = await req.json();

    if (!to_postal_code || !products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'CEP de destino e produtos são obrigatórios' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Remover caracteres não numéricos do CEP
    const cleanPostalCode = to_postal_code.replace(/\D/g, '');
    const cleanOriginPostalCode = config.origin_postal_code.replace(/\D/g, '');

    if (cleanPostalCode.length !== 8) {
      return new Response(
        JSON.stringify({ error: 'CEP de destino inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Preparar payload para Melhor Envio
    const payload = {
      from: {
        postal_code: cleanOriginPostalCode
      },
      to: {
        postal_code: cleanPostalCode
      },
      products: products.map(p => ({
        id: crypto.randomUUID(),
        width: p.width,
        height: p.height,
        length: p.length,
        weight: p.weight,
        insurance_value: p.insurance_value || 0,
        quantity: p.quantity
      }))
    };

    console.log('Melhor Envio Request:', JSON.stringify(payload, null, 2));

    // Chamar API do Melhor Envio
    const melhorEnvioUrl = config.is_sandbox
      ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate'
      : 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

    const response = await fetch(melhorEnvioUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_token}`,
        'User-Agent': '2WL Store (2wlstore.com)'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Melhor Envio Error:', response.status, errorText);

      // Se for erro 400 ou erro relacionado a CEP, retornar erro mais amigável
      if (response.status === 400 || errorText.toLowerCase().includes('cep') || errorText.toLowerCase().includes('postal')) {
        return new Response(
          JSON.stringify({ error: 'CEP de destino inválido ou não encontrado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      throw new Error(`Erro ao calcular frete: ${response.status} - ${errorText}`);
    }

    const carriers = await response.json();
    console.log('Melhor Envio Response:', JSON.stringify(carriers, null, 2));

    // Filtrar apenas as transportadoras e modalidades desejadas
    const allowedServices = [
      { company: 'Correios', service: 'SEDEX' },      // Correios rápida
      { company: 'Correios', service: 'PAC' },        // Correios normal
      { company: 'Jadlog', service: '.Package' },     // Jadlog normal
      { company: 'Jadlog', service: '.Com' }          // Jadlog rápida
    ];

    // Formatar e filtrar resposta
    const formattedCarriers = carriers
      .filter((c: any) => {
        // Remover erros
        if (c.error !== null && c.error !== undefined) return false;

        // Verificar se está na lista de serviços permitidos
        const companyName = c.company?.name || '';
        const serviceName = c.name || '';

        return allowedServices.some(allowed =>
          companyName.toLowerCase().includes(allowed.company.toLowerCase()) &&
          serviceName.toLowerCase().includes(allowed.service.toLowerCase())
        );
      })
      .map((carrier: any) => ({
        id: carrier.id,
        name: carrier.name,
        company: carrier.company.name,
        company_logo: carrier.company.picture,
        price: parseFloat(carrier.price) || 0,
        discount: parseFloat(carrier.discount) || 0,
        final_price: parseFloat(carrier.custom_price || carrier.price) || 0,
        delivery_time: parseInt(carrier.delivery_time) || 0,
        delivery_range: carrier.delivery_range,
        currency: 'BRL',
        packages: carrier.packages || []
      }))
      .sort((a: any, b: any) => a.final_price - b.final_price);

    return new Response(
      JSON.stringify({ carriers: formattedCarriers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Calculate Freight Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
