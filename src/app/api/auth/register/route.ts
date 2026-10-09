import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, talentProfiles, companies, countries, cities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["TALENT", "COMPANY"]),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
  countryIso2: z.string().length(2).optional(),
  cityName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (existing.length) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    let countryId: string | undefined;
    let cityId: string | undefined;
    if (data.countryIso2) {
      const [c] = await db
        .select()
        .from(countries)
        .where(eq(countries.iso2, data.countryIso2))
        .limit(1);
      if (c) {
        countryId = c.id;
        if (data.cityName) {
          const [city] = await db
            .select()
            .from(cities)
            .where(eq(cities.countryId, countryId))
            .limit(50);
          // We'll just create a city record if not found
          const found = await db
            .select()
            .from(cities)
            .where(eq(cities.name, data.cityName))
            .limit(1);
          if (found[0]) {
            cityId = found[0].id;
          } else {
            const [nc] = await db
              .insert(cities)
              .values({ name: data.cityName, countryId })
              .returning();
            cityId = nc.id;
          }
        }
      }
    }

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: hashPassword(data.password),
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        countryId,
        cityId,
      })
      .returning();

    if (data.role === "TALENT") {
      const slug =
        (data.firstName && data.lastName
          ? `${data.firstName}-${data.lastName}`
          : data.email.split("@")[0]
        )
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      const finalSlug = `${slug}-${user.id.slice(0, 6)}`;
      await db.insert(talentProfiles).values({
        userId: user.id,
        slug: finalSlug,
        headline: "Nouveau talent OCD",
        profession: "À définir",
        availability: "OPEN_TO_OPPORTUNITIES",
        completionScore: 10,
        isSpontaneous: true,
      });
    } else if (data.role === "COMPANY" && data.companyName) {
      const slug = data.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await db.insert(companies).values({
        ownerId: user.id,
        name: data.companyName,
        slug: `${slug}-${user.id.slice(0, 6)}`,
        email: data.email,
        countryId,
        cityId,
        verification: "PENDING",
      });
    }

    const { token } = await createSession(user.id);

    const res = NextResponse.json({ ok: true, userId: user.id });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
