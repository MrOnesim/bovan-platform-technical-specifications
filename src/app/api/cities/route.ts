import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cities, countries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const query = z.object({
  countryIso2: z.string().length(2).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = query.parse({
      countryIso2: searchParams.get("countryIso2") || undefined,
    });

    if (!parsed.countryIso2) {
      return NextResponse.json([]);
    }

    const [c] = await db
      .select()
      .from(countries)
      .where(eq(countries.iso2, parsed.countryIso2.toUpperCase()))
      .limit(1);

    if (!c) {
      return NextResponse.json([]);
    }

    const list = await db
      .select({ id: cities.id, name: cities.name })
      .from(cities)
      .where(eq(cities.countryId, c.id))
      .orderBy(cities.name);

    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}
