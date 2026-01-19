import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format phone number from (12) 98149-3220 to 5512981493220
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55')) return cleaned;
  return `55${cleaned}`;
}

// Get status message in Portuguese for WhatsApp
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    'processing': '✅ Seu pedido está sendo preparado com muito carinho e atenção aos detalhes.\nNossa equipe já está trabalhando para garantir a melhor qualidade possível.',
    'confirmed': '✅ Seu pedido foi confirmado e está sendo preparado!',
    'shipped': '🚚 Seu pedido foi enviado e já está a caminho!\nEsperamos que ele chegue rapidamente e supere suas expectativas.',
    'delivered': '🎉 Seu pedido foi entregue com sucesso!\nEsperamos que você adore o produto tanto quanto nós gostamos de produzi-lo.',
    'cancelled': '❌ Seu pedido foi cancelado.\nSe precisar de ajuda, estamos à disposição!',
  };
  return messages[status] || `Status atualizado: ${status}`;
}

// Get email subject based on status
function getEmailSubject(status: string, orderNumber: string): string {
  const subjects: Record<string, string> = {
    'processing': `🎉 Pagamento confirmado! Pedido #${orderNumber}`,
    'confirmed': `✅ Pedido #${orderNumber} confirmado`,
    'shipped': `🚚 Seu pedido #${orderNumber} foi enviado!`,
    'delivered': `📦 Pedido #${orderNumber} entregue com sucesso!`,
    'cancelled': `❌ Pedido #${orderNumber} cancelado`,
  };
  return subjects[status] || `Atualização do pedido #${orderNumber}`;
}

// Generate HTML email content
function generateEmailHTML(
  status: string,
  customerName: string,
  orderNumber: string,
  total: number,
  trackingNumber: string | null,
  siteUrl: string
): string {
  const statusColors: Record<string, string> = {
    'processing': '#10B981',
    'confirmed': '#10B981',
    'shipped': '#3B82F6',
    'delivered': '#8B5CF6',
    'cancelled': '#EF4444',
  };

  const statusTitles: Record<string, string> = {
    'processing': 'Pagamento Confirmado! 🎉',
    'confirmed': 'Pedido Confirmado! ✅',
    'shipped': 'Pedido Enviado! 🚚',
    'delivered': 'Pedido Entregue! 📦',
    'cancelled': 'Pedido Cancelado ❌',
  };

  const statusMessages: Record<string, string> = {
    'processing': `
      <p>Recebemos seu pagamento e seu pedido já está sendo preparado com muito carinho!</p>
      <p>Nossa equipe está trabalhando para garantir que tudo chegue perfeito até você.</p>
    `,
    'confirmed': `
      <p>Seu pedido foi confirmado e está em preparação!</p>
      <p>Em breve você receberá uma atualização com o código de rastreio.</p>
    `,
    'shipped': `
      <p>Ótimas notícias! Seu pedido foi enviado e já está a caminho!</p>
      ${trackingNumber ? `<p><strong>Código de Rastreio:</strong> ${trackingNumber}</p>` : ''}
      <p>Você pode acompanhar a entrega pelo site dos Correios ou da transportadora.</p>
    `,
    'delivered': `
      <p>Seu pedido foi entregue com sucesso! 🎉</p>
      <p>Esperamos que você adore seus produtos tanto quanto nós adoramos produzi-los.</p>
      <p>Se puder, depois conta pra gente o que achou! Sua opinião é muito importante.</p>
    `,
    'cancelled': `
      <p>Infelizmente seu pedido foi cancelado.</p>
      <p>Se você não solicitou o cancelamento ou precisa de ajuda, entre em contato conosco.</p>
    `,
  };

  const color = statusColors[status] || '#6B7280';
  const title = statusTitles[status] || 'Atualização do Pedido';
  const message = statusMessages[status] || '<p>Seu pedido teve uma atualização de status.</p>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">2WL STORE</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Seu estilo, nossa paixão</p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 30px 40px 0 40px; text-align: center;">
              <span style="display: inline-block; background-color: ${color}; color: #ffffff; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
                ${title}
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">
                Olá, <strong>${customerName}</strong>!
              </p>

              <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${message}
              </div>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; margin: 30px 0; padding: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Número do Pedido</span><br>
                          <span style="color: #1f2937; font-size: 18px; font-weight: 600;">#${orderNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px;">
                          <span style="color: #6b7280; font-size: 14px;">Valor Total</span><br>
                          <span style="color: #1f2937; font-size: 18px; font-weight: 600;">R$ ${total.toFixed(2).replace('.', ',')}</span>
                        </td>
                      </tr>
                      ${trackingNumber && status === 'shipped' ? `
                      <tr>
                        <td style="padding-top: 12px; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Código de Rastreio</span><br>
                          <span style="color: #2563eb; font-size: 18px; font-weight: 600;">${trackingNumber}</span>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${siteUrl}/minha-conta" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Acompanhar Pedido
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 30px 40px; text-align: center;">
              <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 14px;">
                Obrigado por escolher a 2WL Store! 💙
              </p>
              <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
                Dúvidas? Entre em contato pelo WhatsApp ou responda este email.
              </p>
              <p style="color: rgba(255,255,255,0.4); margin: 16px 0 0 0; font-size: 11px;">
                © 2026 2WL Store. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Send email via Resend
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'pedidos@2wlstore.com';

  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `2WL Store <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending notifications
    const { data: notifications, error: notifError } = await supabase
      .from('order_status_notifications')
      .select('*')
      .is('notified_at', null)
      .order('created_at', { ascending: true })
      .limit(10);

    if (notifError) throw notifError;

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://2wlstore.com';
    const results = [];

    for (const notification of notifications) {
      try {
        // Get order details with user email
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            order_number,
            status,
            total,
            tracking_code,
            shipping_phone,
            shipping_first_name,
            shipping_last_name,
            shipping_email,
            user_id,
            users:user_id (
              email
            )
          `)
          .eq('id', notification.order_id)
          .single();

        if (orderError || !order) {
          await supabase
            .from('order_status_notifications')
            .update({
              notified_at: new Date().toISOString(),
              error: 'Order not found'
            })
            .eq('id', notification.id);
          continue;
        }

        const customerName = order.shipping_first_name || 'Cliente';
        const customerEmail = order.shipping_email || order.users?.email;
        let emailSent = false;
        let whatsappSent = false;

        // =====================
        // SEND EMAIL
        // =====================
        if (customerEmail) {
          const emailSubject = getEmailSubject(notification.new_status, order.order_number);
          const emailHTML = generateEmailHTML(
            notification.new_status,
            customerName,
            order.order_number,
            order.total,
            order.tracking_code,
            siteUrl
          );

          emailSent = await sendEmail(customerEmail, emailSubject, emailHTML);
          console.log(`Email ${emailSent ? 'sent' : 'failed'} to ${customerEmail}`);
        }

        // =====================
        // SEND WHATSAPP
        // =====================
        if (order.shipping_phone) {
          const formattedPhone = formatPhoneNumber(order.shipping_phone);
          const statusMessage = getStatusMessage(notification.new_status);

          let message = `*2WL Store – Atualização de Pedido*\n\n`;
          message += `Olá, ${customerName.toUpperCase()}! `;

          if (notification.new_status === 'processing') {
            message += `😊\nObrigado por comprar com a 2WL Store.\n\n`;
          } else if (notification.new_status === 'shipped') {
            message += `🎉\nTemos uma ótima notícia!\n\n`;
          } else if (notification.new_status === 'delivered') {
            message += `😄\nMissão cumprida!\n\n`;
          } else {
            message += `\n`;
          }

          message += `${statusMessage}\n\n`;
          message += `📦 *Pedido:* ${order.order_number}\n`;
          message += `💰 *Valor:* R$ ${order.total.toFixed(2).replace('.', ',')}\n\n`;

          if (order.tracking_code && notification.new_status === 'shipped') {
            message += `🔍 *Código de rastreio:* ${order.tracking_code}\n\n`;
          }

          if (notification.new_status === 'delivered') {
            message += `Se puder, depois conta pra gente o que achou 😉\n`;
            message += `Sua opinião é muito importante para a 2WL Store.\n\n`;
            message += `Acesse sua conta aqui:\n`;
          } else if (notification.new_status === 'processing') {
            message += `Você pode acompanhar todas as atualizações pelo link abaixo:\n`;
          } else {
            message += `Acompanhe o status do seu pedido pelo link:\n`;
          }

          message += `👉 ${siteUrl}/minha-conta`;

          if (notification.new_status === 'processing') {
            message += `\n\nQualquer dúvida, estamos por aqui. 🚀`;
          } else if (notification.new_status !== 'cancelled' && notification.new_status !== 'delivered') {
            message += `\n\nObrigado por escolher a 2WL Store 💙`;
          }

          const webhookUrl = Deno.env.get('WHATSAPP_WEBHOOK_URL');

          if (webhookUrl) {
            const webhookPayload = {
              phone: formattedPhone,
              message: message,
              order_id: order.order_number,
              status: notification.new_status,
              tracking_number: order.tracking_code || null
            };

            try {
              const webhookResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload),
              });

              if (webhookResponse.ok) {
                whatsappSent = true;
              }
            } catch (error) {
              console.error('WhatsApp webhook error:', error);
            }
          }
        }

        // Mark notification based on results
        if (emailSent || whatsappSent) {
          await supabase
            .from('order_status_notifications')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', notification.id);

          results.push({
            notification_id: notification.id,
            order_number: order.order_number,
            email_sent: emailSent,
            whatsapp_sent: whatsappSent,
            status: 'sent'
          });
        } else {
          await supabase
            .from('order_status_notifications')
            .update({
              notified_at: new Date().toISOString(),
              error: 'No contact available or all notifications failed'
            })
            .eq('id', notification.id);

          results.push({
            notification_id: notification.id,
            status: 'failed',
            error: 'No notifications sent'
          });
        }

      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);

        await supabase
          .from('order_status_notifications')
          .update({
            notified_at: new Date().toISOString(),
            error: error.message
          })
          .eq('id', notification.id);

        results.push({
          notification_id: notification.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
