import type { APIRoute } from 'astro';

export const prerender = false;

// For Cloudflare Workers, we need to use an HTTP-based email service
// Options: Resend, SendGrid, Mailgun, or a custom SMTP-to-HTTP gateway
const {
  EMAIL_API_KEY, // API key for email service (Resend, SendGrid, etc.)
  EMAIL_API_URL, // API endpoint URL (e.g., 'https://api.resend.com/emails')
  CONTACT_RECIPIENT_EMAIL,
  CONTACT_FROM_EMAIL,
  // Fallback to SMTP credentials if using a gateway
  CRANEMAIL_SMTP_HOST,
  CRANEMAIL_SMTP_USER,
  CRANEMAIL_SMTP_PASS,
} = import.meta.env;

// Check if email service is configured
const isEmailConfigured = EMAIL_API_KEY && EMAIL_API_URL;

if (!isEmailConfigured && (!CRANEMAIL_SMTP_HOST || !CRANEMAIL_SMTP_USER || !CRANEMAIL_SMTP_PASS)) {
  console.warn(
    '[contact API] Missing email service configuration. Form submissions will fail.'
  );
}

const respond = (request: Request, url: string, success = true, message?: string) => {
  const acceptsHtml = (request.headers.get('accept') || '').includes('text/html');

  if (acceptsHtml) {
    const redirectUrl = new URL(url, request.url);
    redirectUrl.searchParams.set('contact', success ? 'success' : 'error');
    if (!success && message) {
      redirectUrl.searchParams.set('reason', message);
    }
    return Response.redirect(redirectUrl.toString(), success ? 303 : 302);
  }

  return new Response(
    JSON.stringify({
      ok: success,
      message: message ?? (success ? 'Message sent' : 'Unable to send message'),
    }),
    {
      status: success ? 200 : 500,
      headers: { 'content-type': 'application/json' },
    }
  );
};

async function sendEmailViaAPI(
  to: string,
  from: string,
  subject: string,
  text: string,
  replyTo?: string
): Promise<boolean> {
  if (!isEmailConfigured) {
    return false;
  }

  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: replyTo,
        subject,
        text,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[contact API] Failed to send email via API', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isEmailConfigured) {
      return new Response('Email service is not configured', { status: 500 });
    }

    const formData = await request.formData();
    const firstName = (formData.get('firstName') ?? '').toString().trim();
    const lastName = (formData.get('lastName') ?? '').toString().trim();
    const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const name = (formData.get('name') ?? '').toString().trim() || fallbackName || 'Unknown';
    const email = (formData.get('email') ?? '').toString().trim();
    const message = (formData.get('message') ?? '').toString().trim();
    const locale = (formData.get('locale') ?? 'en').toString().toLowerCase();

    if (!email || !message) {
      return new Response('Email and message are required', { status: 400 });
    }

    const referer = request.headers.get('referer') ?? '/';
    const bodyLines = [
      `Locale: ${locale}`,
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
      '',
      `Source: ${referer}`,
    ];

    const recipient = CONTACT_RECIPIENT_EMAIL || CRANEMAIL_SMTP_USER || 'contact@cheeseflow.com';
    const sender = CONTACT_FROM_EMAIL || CRANEMAIL_SMTP_USER || 'noreply@cheeseflow.com';

    const success = await sendEmailViaAPI(
      recipient,
      sender,
      `CheeseFlow website inquiry (${locale.toUpperCase()})`,
      bodyLines.join('\n'),
      email
    );

    if (!success) {
      return respond(request, referer, false, 'send_failed');
    }

    return respond(request, referer, true);
  } catch (error) {
    console.error('[contact API] Failed to send email', error);
    const referer = request.headers.get('referer') ?? '/';
    return respond(request, referer, false, 'send_failed');
  }
};

