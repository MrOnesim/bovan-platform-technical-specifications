/* Email notification for booking inquiries.
   Uses Resend's HTTP API through fetch, so there is no SDK to install and no
   build-time dependency. When the two environment variables are absent the
   lead is still persisted: the database is the source of truth, email is only
   a convenience. Nothing here may throw, a mail outage must never lose a
   customer request. */

export interface LeadForEmail {
  name: string;
  business: string;
  email: string;
  phone?: string | null;
  packageLabel?: string | null;
  message: string;
  createdAt?: Date;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

export function leadEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_EMAIL);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildText(lead: LeadForEmail): string {
  return [
    "Nouvelle demande de réservation depuis le site OCD.",
    "",
    `Nom : ${lead.name}`,
    `Activité : ${lead.business}`,
    `Email : ${lead.email}`,
    `Téléphone / WhatsApp : ${lead.phone || "Non renseigné"}`,
    `Formule souhaitée : ${lead.packageLabel || "À discuter"}`,
    "",
    "Message :",
    lead.message,
    "",
    "Répondez directement à cet email pour joindre la personne.",
  ].join("\n");
}

function buildHtml(lead: LeadForEmail): string {
  const rows: Array<[string, string]> = [
    ["Nom", lead.name],
    ["Activité", lead.business],
    ["Email", lead.email],
    ["Téléphone / WhatsApp", lead.phone || "Non renseigné"],
    ["Formule souhaitée", lead.packageLabel || "À discuter"],
  ];

  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#716a62;white-space:nowrap">${escapeHtml(
          label
        )}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<div style="font-family:Inter,system-ui,sans-serif;color:#1d1a17;line-height:1.6">
  <h2 style="margin:0 0 4px;font-size:18px">Nouvelle demande de réservation</h2>
  <p style="margin:0 0 16px;color:#716a62;font-size:13px">Envoyée depuis le site OCD.</p>
  <table style="border-collapse:collapse;font-size:14px">${table}</table>
  <p style="margin:20px 0 6px;color:#716a62;font-size:13px">Message</p>
  <p style="margin:0;padding:12px 14px;background:#fbf9f6;border:1px solid #e9e3dc;border-radius:10px;white-space:pre-wrap">${escapeHtml(
    lead.message
  )}</p>
  <p style="margin:20px 0 0;color:#716a62;font-size:13px">Répondez directement à cet email pour joindre la personne.</p>
</div>`;
}

/**
 * Sends the notification. Returns a result instead of throwing so the API can
 * record the failure on the row and still answer 201.
 */
export async function notifyLead(
  lead: LeadForEmail
): Promise<{ sent: boolean; error?: string }> {
  if (!leadEmailConfigured()) {
    return { sent: false, error: "RESEND_API_KEY / LEAD_NOTIFY_EMAIL absents." };
  }

  const subject = `Demande OCD — ${
    lead.packageLabel || lead.business || lead.name
  }`.slice(0, 180);

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_FROM_EMAIL || "OCD <onboarding@resend.dev>",
        to: [process.env.LEAD_NOTIFY_EMAIL],
        reply_to: lead.email,
        subject,
        text: buildText(lead),
        html: buildHtml(lead),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        sent: false,
        error: `Resend ${res.status}: ${detail}`.slice(0, 300),
      };
    }

    return { sent: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return { sent: false, error: message.slice(0, 300) };
  }
}
