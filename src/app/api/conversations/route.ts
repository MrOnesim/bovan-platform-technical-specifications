import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages, talentProfiles, companies, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    let convs;

    if (session.user.role === "COMPANY" && session.company) {
      convs = await db
        .select({
          id: conversations.id,
          lastMessageAt: conversations.lastMessageAt,
          talentName: users.firstName,
          talentLastName: users.lastName,
          talentSlug: talentProfiles.slug,
          talentAvatar: users.avatarUrl,
          lastMessage: messages.content,
        })
        .from(conversations)
        .innerJoin(talentProfiles, eq(talentProfiles.id, conversations.talentId))
        .innerJoin(users, eq(users.id, talentProfiles.userId))
        .leftJoin(
          messages,
          eq(messages.conversationId, conversations.id)
        )
        .where(eq(conversations.companyId, session.company.id))
        .orderBy(desc(conversations.lastMessageAt));
    } else if (session.user.role === "TALENT" && session.talent) {
      convs = await db
        .select({
          id: conversations.id,
          lastMessageAt: conversations.lastMessageAt,
          companyName: companies.name,
          companySlug: companies.slug,
          companyLogo: companies.logo,
          lastMessage: messages.content,
        })
        .from(conversations)
        .innerJoin(companies, eq(companies.id, conversations.companyId))
        .leftJoin(
          messages,
          eq(messages.conversationId, conversations.id)
        )
        .where(eq(conversations.talentId, session.talent.id))
        .orderBy(desc(conversations.lastMessageAt));
    } else {
      return NextResponse.json({ error: "Role non reconnu" }, { status: 403 });
    }

    // Group by conversation ID to get only the last message
    const uniqueConvs = Array.from(new Map(convs.map((c) => [c.id, c])).values());

    return NextResponse.json(uniqueConvs);
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les conversations." },
      { status: 500 }
    );
  }
}