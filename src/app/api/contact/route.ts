import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages, talentProfiles, companies, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  talentId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté en tant qu'entreprise pour contacter un talent." },
      { status: 401 }
    );
  }
  if (session.user.role !== "COMPANY" || !session.company) {
    return NextResponse.json(
      { error: "Seules les entreprises peuvent initier une conversation." },
      { status: 403 }
    );
  }

  try {
    const body = schema.parse(await req.json());
    const [talent] = await db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.id, body.talentId))
      .limit(1);
    if (!talent) {
      return NextResponse.json({ error: "Talent introuvable." }, { status: 404 });
    }

    // Find or create conversation
    let [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.companyId, session.company.id),
          eq(conversations.talentId, talent.id)
        )
      )
      .limit(1);

    if (!conv) {
      [conv] = await db
        .insert(conversations)
        .values({
          companyId: session.company.id,
          talentId: talent.id,
        })
        .returning();
    }

    if (!conv) {
      return NextResponse.json(
        { error: "Erreur de création de conversation." },
        { status: 500 }
      );
    }

    await db.insert(messages).values({
      conversationId: conv.id,
      senderId: session.user.id,
      content: body.message,
    });

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conv.id));

    return NextResponse.json({ ok: true, conversationId: conv.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
