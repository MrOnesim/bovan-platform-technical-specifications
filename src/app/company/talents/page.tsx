import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { companies, talentProfiles, users, countries, talentSkills, skills } from "@/db/schema";
import { eq, desc, sql, and, like, or } from "drizzle-orm";
import { CompanySidebar } from "@/components/CompanySidebar";
import { TalentCard, type TalentCardData } from "@/components/TalentCard";
import { EmptyState } from "@/components/EmptyState";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  country?: string;
  availability?: string;
}

async function getTalents(params: SearchParams) {
  const filters = [eq(talentProfiles.isSpontaneous, true)];
  if (params.country) {
    const [c] = await db
      .select()
      .from(countries)
      .where(eq(countries.iso2, params.country.toUpperCase()))
      .limit(1);
    if (c) filters.push(eq(users.countryId, c.id));
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
  return db
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
}

export default async function CompanyTalentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) redirect("/");

  const params = await searchParams;
  const [talents, allCountries, company] = await Promise.all([
    getTalents(params),
    db.select({ iso2: countries.iso2, nameFr: countries.nameFr, flag: countries.flag }).from(countries).orderBy(countries.nameFr),
    db.select().from(companies).where(eq(companies.id, session.company.id)).limit(1),
  ]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <CompanySidebar
            active="talents"
            companyName={company[0]?.name || ""}
            companyLogo={company[0]?.logo || null}
          />
          <div className="space-y-6">
            <div>
              <h1 className="page-title">
                Chercher des talents
              </h1>
              <p className="text-[#525252] mt-1">
                Découvrez les profils qui se rendent visibles sur OCD.
              </p>
            </div>

            <form className="bg-white p-4 rounded-2xl border border-[#e5e5e5]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1 relative">
                  <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <input
                    name="q"
                    type="search"
                    aria-label="Rechercher un talent par métier, compétence ou nom"
                    defaultValue={params.q}
                    placeholder="Métier, compétence, nom…"
                    className="input pl-10"
                  />
                </div>
                <select
                  name="country"
                  aria-label="Pays"
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
                  aria-label="Disponibilité"
                  defaultValue={params.availability || ""}
                  className="select"
                >
                  <option value="">Toutes disponibilités</option>
                  <option value="AVAILABLE">🟢 Disponible</option>
                  <option value="OPEN_TO_OPPORTUNITIES">
                    Ouvert aux opportunités
                  </option>
                </select>
              </div>
              <button type="submit" className="btn-primary mt-3 text-sm py-2">
                Rechercher
              </button>
            </form>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {talents.length === 0 ? (
                <EmptyState
                  filtered
                  title="Aucun talent ne correspond"
                  description={
                    params.q || params.country || params.availability
                      ? "Aucun profil ne correspond à votre recherche. Élargissez vos critères ou réinitialisez les filtres."
                      : "Les talents qui rendent leur profil visible apparaîtront ici."
                  }
                />
              ) : (
                talents.map((t) => (
                  <TalentCard key={t.id} talent={t as TalentCardData} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
