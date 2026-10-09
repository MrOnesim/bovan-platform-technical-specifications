import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1).max(4000),
});

/** Confirms the session owns this conversation. Returns the conversation or a
    ready-to-return error response. */
async function authorise(id: string, session: Awaited<ReturnType<typeof getCurrentUser>>) {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conv) {
    return { error: NextResponse.json({ error: "Conversation introuvable." }, { status: 404 }) };
  }

  const isCompany = session?.user.role === "COMPANY" && session.company?.id === conv.companyId;
  const isTalent = session?.user.role === "TALENT" && session.talent?.id === conv.talentId;

  if (!isCompany && !isTalent) {
    return { error: NextResponse.json({ error: "Accès refusé." }, { status: 403 }) };
  }

  return { conv };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  try {
    const auth = await authorise(id, session);
    if (auth.error) return auth.error;

    const msgs = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
      })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json(msgs);
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les messages." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  try {
    // Validate before touching the database so a malformed or hostile body
    // never reaches the insert.
    const { content } = postSchema.parse(await req.json());

    const auth = await authorise(id, session);
    if (auth.error) return auth.error;

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId: id,
        senderId: session.user.id,
        content,
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, id));

    return NextResponse.json(msg);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Message non envoyé. Réessayez." },
      { status: 500 }
    );
  }
}