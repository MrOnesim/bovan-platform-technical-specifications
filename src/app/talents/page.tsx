import { db } from "@/db";
import {
  countries,
  talentProfiles,
  talentSkills,
  skills,
  users,
} from "@/db/schema";
import { eq, and, sql, desc, like, or } from "drizzle-orm";
import { TalentCard, type TalentCardData } from "@/components/TalentCard";
import { User, Search, Filter, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  country?: string;
  availability?: string;
  skill?: string;
}

async function getTalents(params: SearchParams) {
  const filters = [eq(talentProfiles.isSpontaneous, true)];
  if (params.country) {
    const [c] = await db
      .select()
      .from(countries)
      .where(eq(countries.iso2, params.country.toUpperCase()))
      .limit(1);
    if (c) {
      filters.push(eq(users.countryId, c.id));
    }
  }
  if (params.availability) {
    filters.push(
      eq(
        talentProfiles.availability,
        params.availability as
          | "AVAILABLE"
          | "OPEN_TO_OPPORTUNITIES"
          | "EMPLOYED"
          | "NOT_AVAILABLE"
      )
    );
  }
  if (params.q) {
    const q = `%${params.q}%`;
    filters.push(
      or(
        like(talentProfiles.headline, q),
        like(talentProfiles.profession, q),
        like(users.firstName, q),
        like(users.lastName, q)
      )!
    );
  }
  if (params.skill) {
    const skillSubquery = db
      .select({ id: talentProfiles.id })
      .from(talentProfiles)
      .innerJoin(talentSkills, eq(talentSkills.talentId, talentProfiles.id))
      .innerJoin(skills, eq(skills.id, talentSkills.skillId))
      .where(
        and(
          eq(skills.slug, params.skill.toLowerCase().replace(/\s+/g, "-")),
          eq(talentProfiles.isSpontaneous, true)
        )
      );
    filters.push(
      sql`${talentProfiles.id} IN (${skillSubquery})`
    );
  }

  const rows = await db
    .select({
      id: talentProfiles.id,
      slug: talentProfiles.slug,
      headline: talentProfiles.headline,
      profession: talentProfiles.profession,
      availability: talentProfiles.availability,
      yearsExperience: talentProfiles.yearsExperience,
      experienceLevel: talentProfiles.experienceLevel,
      firstName: users.firstName,
      lastName: users.lastName,
      avatarUrl: users.avatarUrl,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
      city: sql<string | null>`(SELECT name FROM cities WHERE id = ${users.cityId})`,
    })
    .from(talentProfiles)
    .innerJoin(users, eq(users.id, talentProfiles.userId))
    .leftJoin(countries, eq(countries.id, users.countryId))
    .where(and(...filters))
    .orderBy(desc(talentProfiles.viewsCount))
    .limit(48);

  return rows;
}

async function getAllCountries() {
  return db
    .select({
      iso2: countries.iso2,
      nameFr: countries.nameFr,
      flag: countries.flag,
    })
    .from(countries)
    .orderBy(countries.nameFr);
}

async function getTopSkills() {
  return db
    .select({
      name: skills.name,
      slug: skills.slug,
      count: sql<number>`count(*)::int`,
    })
    .from(talentSkills)
    .innerJoin(skills, eq(skills.id, talentSkills.skillId))
    .groupBy(skills.name, skills.slug)
    .orderBy(desc(sql`count(*)`))
    .limit(20);
}

export default async function TalentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [talents, allCountries, topSkills] = await Promise.all([
    getTalents(params),
    getAllCountries(),
    getTopSkills(),
  ]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 chip-orange bg-white/10 text-[#ffb352] ring-white/20 mb-4">
              <Users className="w-3.5 h-3.5" />
              {talents.length} talents visibles
            </div>
            <h1 className="heading-1 text-white">
              Les talents
              <br />
              <span className="text-[#f47b00]">africains.</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-xl text-lg">
              Découvrez les profils qui se rendent visibles, sans attendre une
              offre. Candidatures spontanées, compétences vérifiées,
              disponibilités affichées.
            </p>
          </div>
        </div>
      </section>

      <section className="container-bovan py-10">
        <form className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
              <input
                name="q"
                type="text"
                defaultValue={params.q}
                placeholder="Rechercher un métier, une compétence, un nom..."
                className="input pl-10"
              />
            </div>
            <select
              name="country"
              defaultValue={params.country || ""}
              className="select"
            >
              <option value="">Tous les pays</option>
              {allCountries.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.flag} {c.nameFr}
                </option>
              ))}
            </select>
            <select
              name="availability"
              defaultValue={params.availability || ""}
              className="select"
            >
              <option value="">Toutes les disponibilités</option>
              <option value="AVAILABLE">🟢 Disponible</option>
              <option value="OPEN_TO_OPPORTUNITIES">
                Ouvert aux opportunités
              </option>
              <option value="EMPLOYED">En poste</option>
            </select>
          </div>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5">
              {topSkills.slice(0, 8).map((s) => (
                <Link
                  key={s.slug}
                  href={`/talents?skill=${s.slug}`}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    params.skill === s.slug
                      ? "bg-[#f47b00] text-white border-[#f47b00]"
                      : "border-[#e5e5e5] text-[#525252] hover:border-[#f47b00] hover:text-[#f47b00]"
                  }`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
            <button type="submit" className="btn-primary text-sm py-2">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          </div>
        </form>

        {talents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#525252]">
              Aucun talent ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {talents.map((t) => (
              <TalentCard key={t.id} talent={t as TalentCardData} />
            ))}
          </div>
        )}
      </section>

      <section className="container-bovan pb-20">
        <div className="bg-gradient-to-r from-[#f47b00] to-[#c56200] rounded-3xl p-8 md:p-12 text-white text-center">
          <User className="w-8 h-8 mx-auto mb-4" />
          <h3 className="heading-3 text-white">Vous êtes un talent ?</h3>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            Rendez votre profil visible. Sans attendre qu&apos;une entreprise vous
            trouve, montrez-lui que vous existez.
          </p>
          <Link
            href="/auth/register?role=talent"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[#0a0a0a] text-white font-semibold hover:bg-[#262626] transition-colors"
          >
            Créer mon profil
          </Link>
        </div>
      </section>
    </div>
  );
}
