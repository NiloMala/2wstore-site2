import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Edge Function started');

    // Get the request body first
    const { orderId, amount, items, back_urls, notification_url, external_reference } = await req.json();
    console.log('Request body received:', { orderId, amount });

    // Create Supabase client WITHOUT user auth for public operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // For now, use a default email (can be enhanced later with user auth)
    const userEmail = 'customer@2wlstore.com';
    console.log('Using email:', userEmail);

    // Get Mercado Pago configuration from database
    console.log('Querying payment_settings...');
    const { data: config, error: configError } = await supabaseClient
      .from('payment_settings')
      .select('access_token, is_sandbox')
      .eq('gateway', 'mercado_pago')
      .eq('is_active', true)
      .single();

    console.log('Query result - Config:', config ? 'Found' : 'Not found', 'Error:', configError);

    if (configError || !config) {
      console.error('Config error:', configError);
      throw new Error('Mercado Pago not configured: ' + (configError?.message || 'No config found'));
    }

    if (!config.access_token) {
      throw new Error('Mercado Pago access_token not configured');
    }

    console.log('Access token found, is_sandbox:', config.is_sandbox);

    const accessToken = config.access_token;
    const mpApiUrl = config.is_sandbox
      ? 'https://api.mercadopago.com/checkout/preferences'
      : 'https://api.mercadopago.com/checkout/preferences';

    // Create preference in Mercado Pago
    const externalRef = String(external_reference || orderId);
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`;

    const preference = {
      items: items || [{
        title: `Pedido #${externalRef.substring(0, 8)}`,
        quantity: 1,
        unit_price: Number(amount),
        currency_id: 'BRL'
      }],
      payer: {
        email: userEmail
      },
      back_urls: back_urls || {
        success: `${req.headers.get('origin')}/payment/success`,
        failure: `${req.headers.get('origin')}/payment/failure`,
        pending: `${req.headers.get('origin')}/payment/pending`
      },
      notification_url: webhookUrl,
      external_reference: externalRef,
      statement_descriptor: '2WL Store',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      }
    };

    console.log('Webhook URL:', webhookUrl);

    console.log('Calling Mercado Pago API...');
    console.log('Preference:', JSON.stringify(preference, null, 2));

    const mpResponse = await fetch(mpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    });

    console.log('Mercado Pago response status:', mpResponse.status);

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Mercado Pago API Error:', JSON.stringify(errorData, null, 2));
      throw new Error(`Mercado Pago API error: ${JSON.stringify(errorData)}`);
    }

    const mpData = await mpResponse.json();
    console.log('Mercado Pago preference created successfully, ID:', mpData.id);

    // Store payment record in database (optional - don't fail if table doesn't exist)
    try {
      await supabaseClient
        .from('payments')
        .insert({
          order_id: orderId,
          gateway: 'mercado_pago',
          transaction_id: mpData.id,
          amount: amount,
          currency: 'BRL',
          status: 'pending',
          payment_data: mpData
        });
    } catch (dbError) {
      console.warn('Could not store payment in database:', dbError);
      // Continue anyway - the payment was created in Mercado Pago
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        init_point: config.is_sandbox ? mpData.sandbox_init_point : mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in create-mp-preference:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.toString() : String(error);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
