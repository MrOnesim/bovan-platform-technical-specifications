import { db } from "@/db";
import { and, eq, desc } from "drizzle-orm";
import {
  applications,
  conversations,
  reviews,
  opportunities,
} from "@/db/schema";

export async function canReviewAsCompany(
  companyId: string,
  talentId: string
): Promise<boolean> {
  const [app] = await db
    .select()
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .where(
      and(
        eq(applications.talentId, talentId),
        eq(opportunities.companyId, companyId)
      )
    )
    .limit(1);

  if (app) return true;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.companyId, companyId),
        eq(conversations.talentId, talentId)
      )
    )
    .limit(1);

  return Boolean(conv);
}

export async function canReviewAsTalent(
  talentId: string,
  companyId: string
): Promise<boolean> {
  const [app] = await db
    .select()
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .where(
      and(
        eq(applications.talentId, talentId),
        eq(opportunities.companyId, companyId)
      )
    )
    .limit(1);

  if (app) return true;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.companyId, companyId),
        eq(conversations.talentId, talentId)
      )
    )
    .limit(1);

  return Boolean(conv);
}

export async function getApprovedReviews(targetType: "TALENT" | "COMPANY", targetId: string) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      authorId: reviews.authorId,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.targetType, targetType),
        eq(reviews.targetId, targetId),
        eq(reviews.status, "APPROVED")
      )
    )
    .orderBy(desc(reviews.createdAt));
}
