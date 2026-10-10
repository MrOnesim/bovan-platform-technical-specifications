import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { canReviewAsCompany, canReviewAsTalent } from "@/lib/reviews";

const schema = z.object({
  targetType: z.enum(["TALENT", "COMPANY"]),
  targetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());

    let allowed = false;
    if (session.user.role === "COMPANY" && session.company) {
      allowed = await canReviewAsCompany(session.company.id, body.targetId);
    } else if (session.user.role === "TALENT" && session.talent) {
      allowed = await canReviewAsTalent(session.talent.id, body.targetId);
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas laisser un avis pour cette entité (interaction requise)." },
        { status: 403 }
      );
    }

    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.authorId, session.user.id),
          eq(reviews.targetType, body.targetType),
          eq(reviews.targetId, body.targetId)
        )
      )
      .limit(1);

    if (existing.length) {
      return NextResponse.json(
        { error: "Vous avez déjà laissé un avis pour cette entité." },
        { status: 400 }
      );
    }

    await db.insert(reviews).values({
      authorId: session.user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      rating: body.rating,
      comment: body.comment || null,
      status: "PENDING",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
