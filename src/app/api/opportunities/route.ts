import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunities, countries, skills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(10000),
  location: z.string().optional(),
  countryIso2: z.string().optional(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "FREELANCE",
    "INTERNSHIP",
    "CONTRACT",
    "VOLUNTEER",
    "PROJECT",
    "REMOTE",
  ]),
  experienceLevel: z.enum([
    "JUNIOR",
    "MID",
    "SENIOR",
    "LEAD",
    "EXECUTIVE",
    "INTERN",
    "ENTRY",
  ]),
  salaryMin: z.number().int().nullable().optional(),
  salaryMax: z.number().int().nullable().optional(),
  currency: z.string().optional(),
  remote: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté." },
      { status: 401 }
    );
  }
  if (session.user.role !== "COMPANY" || !session.company) {
    return NextResponse.json(
      { error: "Seules les entreprises peuvent publier." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    let countryId: string | undefined;
    if (data.countryIso2) {
      const [c] = await db
        .select()
        .from(countries)
        .where(eq(countries.iso2, data.countryIso2))
        .limit(1);
      countryId = c?.id;
    }

    // Upsert skills
    for (const skillName of data.skills) {
      const slug = slugify(skillName);
      const [existing] = await db
        .select()
        .from(skills)
        .where(eq(skills.slug, slug))
        .limit(1);
      if (!existing) {
        await db
          .insert(skills)
          .values({ name: skillName, slug, category: "OTHER" });
      }
    }

    let baseSlug = slugify(`${session.company.slug}-${data.title}`);
    let slug = baseSlug;
    let i = 1;
    while (true) {
      const [existing] = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.slug, slug))
        .limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${i++}`;
    }

    const [opp] = await db
      .insert(opportunities)
      .values({
        companyId: session.company.id,
        title: data.title,
        slug,
        description: data.description,
        location: data.location,
        countryId,
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        currency: data.currency || "USD",
        remote: data.remote,
        status: "PUBLISHED",
        publishedAt: new Date(),
        skills: data.skills,
      })
      .returning();

    return NextResponse.json({ ok: true, slug: opp.slug, id: opp.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur." }, { status: 500 });
  }
}
