import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, talentProfiles, opportunities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  opportunityId: z.string().uuid(),
  coverLetter: z.string().max(3000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour postuler." },
      { status: 401 }
    );
  }
  if (session.user.role !== "TALENT" || !session.talent) {
    return NextResponse.json(
      { error: "Seuls les talents peuvent postuler." },
      { status: 403 }
    );
  }

  try {
    const body = schema.parse(await req.json());
    const [opp] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, body.opportunityId))
      .limit(1);
    if (!opp) {
      return NextResponse.json(
        { error: "Opportunité introuvable." },
        { status: 404 }
      );
    }
    if (opp.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Cette opportunité n'est pas ouverte." },
        { status: 400 }
      );
    }

    // Check for duplicate
    const [existing] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.opportunityId, body.opportunityId),
          eq(applications.talentId, session.talent.id)
        )
      )
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { error: "Vous avez déjà postulé à cette opportunité." },
        { status: 400 }
      );
    }

    const [app] = await db
      .insert(applications)
      .values({
        opportunityId: body.opportunityId,
        talentId: session.talent.id,
        coverLetter: body.coverLetter,
        status: "SUBMITTED",
      })
      .returning();

    return NextResponse.json({ ok: true, applicationId: app.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
