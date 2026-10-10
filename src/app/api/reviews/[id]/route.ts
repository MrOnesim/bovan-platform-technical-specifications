import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = schema.parse(await req.json());
    const [r] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!r) {
      return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
    }

    await db
      .update(reviews)
      .set({
        status: body.action === "approve" ? "APPROVED" : "REJECTED",
        moderatedAt: new Date(),
      })
      .where(eq(reviews.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
