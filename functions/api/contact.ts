// Cloudflare Pages Function for contact form

interface Env {
  EMAIL_API_KEY?: string;
  EMAIL_API_URL?: string;
  CONTACT_RECIPIENT_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CRANEMAIL_SMTP_HOST?: string;
  CRANEMAIL_SMTP_USER?: string;
  CRANEMAIL_SMTP_PASS?: string;
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
  replyTo: string | undefined,
  env: Env
): Promise<boolean> {
  if (!env.EMAIL_API_KEY || !env.EMAIL_API_URL) {
    return false;
  }

  try {
    const response = await fetch(env.EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EMAIL_API_KEY}`,
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

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  try {
    const isEmailConfigured = env.EMAIL_API_KEY && env.EMAIL_API_URL;

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

    const recipient = env.CONTACT_RECIPIENT_EMAIL || env.CRANEMAIL_SMTP_USER || 'contact@cheeseflow.com';
    const sender = env.CONTACT_FROM_EMAIL || env.CRANEMAIL_SMTP_USER || 'noreply@cheeseflow.com';

    const success = await sendEmailViaAPI(
      recipient,
      sender,
      `CheeseFlow website inquiry (${locale.toUpperCase()})`,
      bodyLines.join('\n'),
      email,
      env
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
}
