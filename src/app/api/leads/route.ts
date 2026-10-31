import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { clientIp, consumeSubmission } from "@/lib/rate-limit";

export const runtime = "nodejs";

/* Leads are stored in the database. Email notifications are intentionally
   disabled until a provider and recipient are configured. */

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  business: z.string().trim().min(2, "Indiquez votre activité.").max(160),
  email: z.string().trim().email("Adresse email invalide.").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  packageLabel: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Décrivez votre besoin en quelques mots.").max(2000),
  source: z.string().trim().max(40).optional(),
  // Honeypot: a real visitor never fills a field that is hidden from them.
  // Deliberately unconstrained here: an over-long value must still be answered
  // with a silent success, not a validation error that reveals the trap.
  website: z.string().optional(),
});

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Silent success: telling a bot it was detected only helps it adapt.
  if (data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ip = clientIp(req);
  const gate = consumeSubmission(ip, data.email);
  if (!gate.allowed) {
    return NextResponse.json(
      { error: "Trop de demandes envoyées. Réessayez plus tard ou écrivez-nous directement." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } }
    );
  }

  try {
    const [row] = await db
      .insert(inquiries)
      .values({
        name: data.name,
        business: data.business,
        email: data.email,
        phone: data.phone || null,
        packageLabel: data.packageLabel || null,
        message: data.message,
        source: data.source || "site",
        ipHash: ip === "unknown" ? null : hashIp(ip),
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      })
      .returning({ id: inquiries.id });

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (e) {
    console.error("[leads] insertion failed", e);
    return NextResponse.json(
      { error: "Votre demande n'a pas pu être enregistrée. Réessayez dans un instant." },
      { status: 500 }
    );
  }
}
