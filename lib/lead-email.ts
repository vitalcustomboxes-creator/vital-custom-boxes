import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getGlobals } from '@/lib/content';
import { getLeadArtworkSignedUrl } from '@/lib/r2';
import { SITE_URL } from '@/lib/seo';

type LeadType = 'quote' | 'contact' | 'sample';

const DEFAULT_RECIPIENT = 'vitalcustomboxes@gmail.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EMAIL_LOGO_CONTENT_ID = 'vital-custom-boxes-logo';
let cachedEmailLogo: string | undefined;

const TYPE_COPY: Record<LeadType, { subject: string; heading: string; noun: string }> = {
  quote: {
    subject: 'We received your custom quote request',
    heading: 'Your quote request is in',
    noun: 'quote request',
  },
  contact: {
    subject: 'We received your message',
    heading: 'Thanks for reaching out',
    noun: 'message',
  },
  sample: {
    subject: 'We received your sample request',
    heading: 'Your sample request is in',
    noun: 'sample request',
  },
};

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function label(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

interface LeadSection {
  title: string;
  fields: LeadField[];
}

interface LeadField {
  label: string;
  value: unknown;
  /** Internally generated, escaped markup only. Never accepts form HTML. */
  html?: string;
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function field(
  payload: Record<string, unknown>,
  key: string,
  customLabel?: string,
): { label: string; value: unknown } | null {
  return hasValue(payload[key])
    ? { label: customLabel ?? label(key), value: payload[key] }
    : null;
}

function compactFields(
  fields: Array<LeadField | null>,
): LeadField[] {
  return fields.filter(
    (item): item is LeadField => item !== null,
  );
}

async function artworkField(value: unknown): Promise<LeadField | null> {
  if (!Array.isArray(value) || value.length === 0) return null;

  const links = await Promise.all(
    value.map(async (item) => {
      if (!item || typeof item !== 'object') return escapeHtml(displayValue(item));
      const artwork = item as { key?: unknown; name?: unknown; size?: unknown };
      const name = typeof artwork.name === 'string' ? artwork.name : 'Artwork';
      const size =
        typeof artwork.size === 'number'
          ? ` (${(artwork.size / 1024 / 1024).toFixed(1)} MB)`
          : '';
      if (typeof artwork.key !== 'string') {
        return escapeHtml(`${name}${size}`);
      }
      const url = await getLeadArtworkSignedUrl(artwork.key, name);
      return `<a href="${escapeHtml(url)}" style="color:#1f2937;font-weight:700;text-decoration:underline;text-decoration-color:#f5a800;text-underline-offset:3px">Open ${escapeHtml(name)}</a><span style="color:#6b7280">${escapeHtml(size)}</span>`;
    }),
  );

  return {
    label: 'Artwork',
    value: 'Artwork links',
    html: links.join('<br>'),
  };
}

async function leadSections(
  type: LeadType,
  payload: Record<string, unknown>,
): Promise<LeadSection[]> {
  if (type === 'contact') {
    return [
      {
        title: 'Customer',
        fields: compactFields([
          field(payload, 'name'),
          field(payload, 'company'),
          field(payload, 'email'),
          field(payload, 'phone'),
          field(payload, 'country'),
        ]),
      },
      {
        title: 'Message',
        fields: compactFields([
          field(payload, 'subject'),
          field(payload, 'message'),
        ]),
      },
    ].filter((section) => section.fields.length > 0);
  }

  if (type === 'sample') {
    return [
      {
        title: 'Customer',
        fields: compactFields([
          field(payload, 'name'),
          field(payload, 'company'),
          field(payload, 'email'),
          field(payload, 'phone'),
        ]),
      },
      {
        title: 'Sample request',
        fields: compactFields([
          field(payload, 'productInterest', 'Product interest'),
          field(payload, 'notes'),
        ]),
      },
      {
        title: 'Delivery',
        fields: compactFields([
          field(payload, 'address'),
          field(payload, 'country'),
        ]),
      },
    ].filter((section) => section.fields.length > 0);
  }

  const dimensions = ['length', 'width', 'height']
    .map((key) => payload[key])
    .filter(hasValue);
  const unit = hasValue(payload.unit) ? ` ${displayValue(payload.unit)}` : '';
  const artwork = await artworkField(payload.artwork);

  return [
    {
      title: 'Customer',
      fields: compactFields([
        field(payload, 'name'),
        field(payload, 'company'),
        field(payload, 'email'),
        field(payload, 'phone'),
        field(payload, 'country'),
      ]),
    },
    {
      title: 'Product',
      fields: compactFields([
        field(payload, 'productName', 'Product'),
        !hasValue(payload.productName) ? field(payload, 'product', 'Product') : null,
        field(payload, 'categoryName', 'Category'),
        !hasValue(payload.categoryName) ? field(payload, 'boxType', 'Box type') : null,
        field(payload, 'quantity'),
      ]),
    },
    {
      title: 'Size',
      fields: compactFields([
        dimensions.length
          ? {
              label: 'Dimensions',
              value: `${dimensions.map(displayValue).join(' × ')}${unit}`,
            }
          : null,
      ]),
    },
    {
      title: 'Material & printing',
      fields: compactFields([
        field(payload, 'stock'),
        field(payload, 'color'),
        field(payload, 'surface'),
        field(payload, 'lamination'),
        field(payload, 'finishes'),
      ]),
    },
    {
      title: 'Additional details',
      fields: compactFields([
        field(payload, 'notes'),
        artwork,
        field(payload, 'sourcePath', 'Submitted from'),
      ]),
    },
  ].filter((section) => section.fields.length > 0);
}

function renderLeadSections(sections: LeadSection[]): string {
  return sections
    .map((section) => {
      const rows = section.fields
        .map(
          (item) =>
            `<tr><th align="left" valign="top" style="width:30%;padding:12px;border-bottom:1px solid #e5e7eb;font-size:13px;line-height:1.5;color:#4b5563">${escapeHtml(item.label)}</th><td valign="top" style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:13px;line-height:1.6;color:#1f2937;word-break:break-word">${item.html ?? escapeHtml(displayValue(item.value))}</td></tr>`,
        )
        .join('');

      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:0 0 22px">
        <tr><td style="padding:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9a5d00">${escapeHtml(section.title)}</td></tr>
        <tr><td><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #d1d5db;border-radius:8px;border-collapse:separate;overflow:hidden">${rows}</table></td></tr>
      </table>`;
    })
    .join('');
}

/** Vercel env values are literal; users sometimes paste .env-style quotes. */
function normalizeEnvValue(value: string | undefined): string {
  const trimmed = value?.trim() ?? '';
  const hasWrappingDoubleQuotes =
    trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasWrappingSingleQuotes =
    trimmed.startsWith("'") && trimmed.endsWith("'");

  return hasWrappingDoubleQuotes || hasWrappingSingleQuotes
    ? trimmed.slice(1, -1).trim()
    : trimmed;
}

function maskedEmail(value: string): string {
  const [local = '', domain = ''] = value.split('@');
  if (!domain) return '[invalid email]';
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

function senderDomain(value: string): string {
  const match = value.match(/@([^>\s]+)/);
  return match?.[1] ?? '[unknown domain]';
}

function emailLogoAttachment() {
  if (!cachedEmailLogo) {
    const logoPath = join(process.cwd(), 'public', 'vital-logo-email.png');
    cachedEmailLogo = readFileSync(logoPath).toString('base64');
    console.info('[lead-email] inline logo loaded', {
      encodedBytes: cachedEmailLogo.length,
    });
  }

  return {
    content: cachedEmailLogo,
    filename: 'vital-custom-boxes-logo.png',
    content_id: EMAIL_LOGO_CONTENT_ID,
  };
}

function emailShell(content: string): string {
  const globals = getGlobals();
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">A message from Vital Custom Boxes.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#ffffff">
    <tr><td align="center" style="padding:0 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#ffffff">
        <tr>
          <td align="center" style="padding:32px 20px 24px;border-bottom:3px solid #f5a800">
            <a href="${SITE_URL}" style="text-decoration:none">
              <img src="cid:${EMAIL_LOGO_CONTENT_ID}" width="210" alt="Vital Custom Boxes" style="display:block;width:210px;max-width:100%;height:auto;border:0;background:#ffffff">
            </a>
          </td>
        </tr>
        <tr><td style="padding:38px 24px 32px">${content}</td></tr>
        <tr>
          <td style="padding:0 24px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">
              <tr>
                <td style="padding:22px 0">
                  <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1f2937">Vital Custom Boxes</p>
                  <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#4b5563">Sales &amp; packaging support</p>
                  <p style="margin:0 0 6px;font-size:13px;line-height:1.5"><a href="${globals.phoneHref}" style="color:#1f2937;text-decoration:underline;text-decoration-color:#f5a800;text-underline-offset:3px">${escapeHtml(globals.phone)}</a></p>
                  <p style="margin:0 0 6px;font-size:13px;line-height:1.5"><a href="mailto:${escapeHtml(globals.email)}" style="color:#1f2937;text-decoration:underline;text-decoration-color:#f5a800;text-underline-offset:3px">${escapeHtml(globals.email)}</a></p>
                  <p style="margin:0;font-size:13px;line-height:1.5;color:#4b5563">${escapeHtml(globals.address)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:22px 24px 30px;color:#6b7280;font-size:11px;line-height:1.5">
            © ${year} Vital Custom Boxes &nbsp;·&nbsp; You received this email after a website submission.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function deliver(
  apiKey: string,
  delivery: 'owner' | 'customer',
  recipient: string,
  message: Record<string, unknown>,
): Promise<void> {
  const startedAt = Date.now();
  console.info('[lead-email] Resend request started', {
    delivery,
    recipient: maskedEmail(recipient),
  });

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    console.error('[lead-email] Resend request rejected', {
      delivery,
      status: response.status,
      durationMs: Date.now() - startedAt,
      response: responseBody.slice(0, 500),
    });
    throw new Error(
      `Resend ${delivery} delivery returned ${response.status}: ${responseBody.slice(0, 500)}`,
    );
  }

  let messageId = '[not returned]';
  try {
    const parsed = JSON.parse(responseBody) as { id?: string };
    messageId = parsed.id ?? messageId;
  } catch {
    // A successful non-JSON response is still a successful delivery request.
  }

  console.info('[lead-email] Resend request accepted', {
    delivery,
    status: response.status,
    messageId,
    durationMs: Date.now() - startedAt,
  });
}

/**
 * Send both the internal owner notification and a branded acknowledgement to
 * the customer. Email is env-activated so tests never make network calls.
 */
export async function sendLeadEmail(
  type: LeadType,
  payload: Record<string, unknown>,
): Promise<void> {
  const apiKey = normalizeEnvValue(process.env.RESEND_API_KEY);
  const from = normalizeEnvValue(process.env.RESEND_FROM_EMAIL);

  console.info(`[lead:${type}] email workflow started`, {
    hasResendApiKey: Boolean(apiKey),
    hasResendFromEmail: Boolean(from),
    hasLeadNotificationEmail: Boolean(process.env.LEAD_NOTIFICATION_EMAIL),
    senderDomain: from ? senderDomain(from) : '[missing]',
  });

  if (!apiKey || !from) {
    console.error(`[lead:${type}] email workflow skipped`, {
      reason: 'Missing RESEND_API_KEY or RESEND_FROM_EMAIL',
      hasResendApiKey: Boolean(apiKey),
      hasResendFromEmail: Boolean(from),
    });
    return;
  }

  const globals = getGlobals();
  const owner =
    normalizeEnvValue(process.env.LEAD_NOTIFICATION_EMAIL) || DEFAULT_RECIPIENT;
  const customerEmail =
    typeof payload.email === 'string' ? payload.email.trim() : '';
  const customerName =
    typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : 'there';
  const copy = TYPE_COPY[type];

  const groupedDetails = renderLeadSections(await leadSections(type, payload));

  await deliver(apiKey, 'owner', owner, {
    from,
    to: [owner],
    attachments: [emailLogoAttachment()],
    ...(customerEmail ? { reply_to: customerEmail } : {}),
    subject: `New ${type} submission — Vital Custom Boxes`,
    html: emailShell(`
      <p style="margin:0 0 9px;font-size:12px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#b86f00">New website lead</p>
      <h1 style="margin:0 0 10px;font-size:28px;line-height:1.25;color:#1f2937">New ${escapeHtml(type)} submission</h1>
      <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#4b5563">Review the customer, product, and production requirements below.</p>
      ${groupedDetails}
      <p style="margin:22px 0 0;padding-left:12px;border-left:3px solid #f5a800;font-size:13px;line-height:1.6;color:#4b5563"><strong style="color:#1f2937">Next action:</strong> Reply to this email to contact the customer directly.</p>
    `),
  });

  if (!customerEmail) {
    console.warn(`[lead:${type}] customer confirmation skipped`, {
      reason: 'Submission did not contain an email address',
    });
    return;
  }

  await deliver(apiKey, 'customer', customerEmail, {
    from,
    to: [customerEmail],
    attachments: [emailLogoAttachment()],
    reply_to: globals.email,
    subject: `${copy.subject} — Vital Custom Boxes`,
    html: emailShell(`
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4b5563">Dear ${escapeHtml(customerName)},</p>
      <h1 style="margin:0 0 18px;font-size:30px;line-height:1.25;color:#1f2937">${escapeHtml(copy.heading)}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563">Thank you for reaching out to <strong style="color:#1f2937">Vital Custom Boxes</strong>. We have received your ${escapeHtml(copy.noun)}.</p>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#4b5563">Our packaging team is reviewing your details. You can expect a response within <strong style="color:#1f2937">one business day</strong>.</p>
      <p style="margin:0 0 26px;padding-left:14px;border-left:3px solid #f5a800;font-size:14px;line-height:1.7;color:#4b5563">Need to add information? Reply directly to this email and your message will reach our sales team.</p>
      <table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:6px;background:#f5a800"><a href="${SITE_URL}/shop/" style="display:inline-block;padding:13px 22px;font-size:14px;font-weight:700;color:#1f2937;text-decoration:none">Explore packaging</a></td></tr></table>
    `),
  });

  console.info(`[lead:${type}] email workflow completed`, {
    ownerNotification: 'accepted',
    customerConfirmation: 'accepted',
  });
}
