import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talentProfiles, talentSkills, skills, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  headline: z.string().optional(),
  profession: z.string().optional(),
  biography: z.string().optional(),
  availability: z
    .enum(["AVAILABLE", "OPEN_TO_OPPORTUNITIES", "EMPLOYED", "NOT_AVAILABLE"])
    .optional(),
  experienceLevel: z
    .enum(["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE", "INTERN", "ENTRY"])
    .optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  salaryExpectation: z.number().int().nullable().optional(),
  currency: z.string().optional(),
  remotePreference: z.enum(["ON_SITE", "HYBRID", "REMOTE", "ANY"]).optional(),
  countryIso2: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (session.user.role !== "TALENT" || !session.talent) {
    return NextResponse.json(
      { error: "Seuls les talents ont un profil." },
      { status: 403 }
    );
  }

  try {
    const body = schema.parse(await req.json());

    if (body.firstName !== undefined || body.lastName !== undefined || body.avatarUrl !== undefined) {
      await db
        .update(users)
        .set({
          firstName: body.firstName ?? session.user.firstName,
          lastName: body.lastName ?? session.user.lastName,
          avatarUrl: body.avatarUrl === undefined ? session.user.avatarUrl : body.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));
    }

    // Update talent profile
    await db
      .update(talentProfiles)
      .set({
        headline: body.headline,
        profession: body.profession,
        biography: body.biography,
        availability: body.availability,
        experienceLevel: body.experienceLevel,
        yearsExperience: body.yearsExperience,
        salaryExpectation: body.salaryExpectation,
        currency: body.currency,
        remotePreference: body.remotePreference,
        linkedinUrl: body.linkedinUrl,
        githubUrl: body.githubUrl,
        websiteUrl: body.websiteUrl,
        portfolioUrl: body.portfolioUrl,
        updatedAt: new Date(),
      })
      .where(eq(talentProfiles.id, session.talent.id));

    // Update skills
    if (body.skills) {
      await db
        .delete(talentSkills)
        .where(eq(talentSkills.talentId, session.talent.id));
      for (const skillName of body.skills) {
        const slug = slugify(skillName);
        let [skill] = await db
          .select()
          .from(skills)
          .where(eq(skills.slug, slug))
          .limit(1);
        if (!skill) {
          [skill] = await db
            .insert(skills)
            .values({ name: skillName, slug, category: "OTHER" })
            .returning();
        }
        if (skill) {
          await db
            .insert(talentSkills)
            .values({ talentId: session.talent.id, skillId: skill.id, level: 3 });
        }
      }
    }

    // Recompute completion
    const [updated] = await db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.id, session.talent.id))
      .limit(1);
    if (updated) {
      let score = 10;
      if (updated.headline) score += 10;
      if (updated.biography && updated.biography.length > 50) score += 15;
      if (updated.profession) score += 5;
      if (updated.yearsExperience > 0) score += 10;
      if (body.skills && body.skills.length > 0) score += 15;
      if (body.skills && body.skills.length >= 3) score += 10;
      if (updated.linkedinUrl) score += 5;
      if (updated.githubUrl || updated.websiteUrl || updated.portfolioUrl) score += 5;
      if (updated.salaryExpectation) score += 5;
      if (updated.availability) score += 5;
      score = Math.min(score, 100);
      await db
        .update(talentProfiles)
        .set({ completionScore: score })
        .where(eq(talentProfiles.id, session.talent.id));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
