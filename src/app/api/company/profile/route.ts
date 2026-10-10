import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  employeeCount: z.number().int().positive().nullable().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  logo: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (session.user.role !== "COMPANY" || !session.company) {
    return NextResponse.json({ error: "Accès réservé aux entreprises." }, { status: 403 });
  }

  try {
    const body = schema.parse(await req.json());
    const updates: any = { updatedAt: new Date() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.industry !== undefined) updates.industry = body.industry;
    if (body.description !== undefined) updates.description = body.description;
    if (body.website !== undefined) updates.website = body.website;
    if (body.email !== undefined) updates.email = body.email || session.company.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.employeeCount !== undefined) updates.employeeCount = body.employeeCount;
    if (body.foundedYear !== undefined) updates.foundedYear = body.foundedYear;
    if (body.logo !== undefined) updates.logo = body.logo;

    await db.update(companies).set(updates).where(eq(companies.id, session.company.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
