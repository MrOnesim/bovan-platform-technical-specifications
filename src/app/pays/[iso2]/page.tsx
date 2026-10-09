import { db } from "@/db";
import { countries, talentProfiles, companies, opportunities, users, cities } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Users, Building2, Briefcase, ArrowRight, Globe2 } from "lucide-react";
import { TalentCard, type TalentCardData } from "@/components/TalentCard";
import { CompanyCard, type CompanyCardData } from "@/components/CompanyCard";
import { OpportunityCard, type OpportunityCardData } from "@/components/OpportunityCard";
import { AfricaMap } from "@/components/AfricaMap";

export const dynamic = "force-dynamic";

async function getCountry(iso2: string) {
  const upper = iso2.toUpperCase();
  const [c] = await db
    .select()
    .from(countries)
    .where(eq(countries.iso2, upper))
    .limit(1);
  if (!c) return null;

  const talents = await db
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
    .where(eq(users.countryId, c.id))
    .orderBy(desc(talentProfiles.viewsCount))
    .limit(6);

  const companyList = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      industry: companies.industry,
      description: companies.description,
      logo: companies.logo,
      verification: companies.verification,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
      opportunitiesCount: sql<number>`(SELECT COUNT(*)::int FROM opportunities o WHERE o.company_id = ${companies.id} AND o.status = 'PUBLISHED')`,
    })
    .from(companies)
    .leftJoin(countries, eq(countries.id, companies.countryId))
    .where(eq(companies.countryId, c.id))
    .orderBy(desc(companies.createdAt))
    .limit(4);

  const opps = await db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      description: opportunities.description,
      location: opportunities.location,
      employmentType: opportunities.employmentType,
      experienceLevel: opportunities.experienceLevel,
      salaryMin: opportunities.salaryMin,
      salaryMax: opportunities.salaryMax,
      currency: opportunities.currency,
      remote: opportunities.remote,
      skills: opportunities.skills,
      companyName: companies.name,
      companySlug: companies.slug,
      companyLogo: companies.logo,
      companyVerified: companies.verification,
    })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .where(
      and(
        eq(opportunities.countryId, c.id),
        eq(opportunities.status, "PUBLISHED")
      )
    )
    .orderBy(desc(opportunities.publishedAt))
    .limit(6);

  // For map (only the current country is highlighted)
  const allStats = await db
    .select({
      iso2: countries.iso2,
      nameFr: countries.nameFr,
      flag: countries.flag,
      labelX: countries.labelX,
      labelY: countries.labelY,
      talentsCount: sql<number>`(SELECT COUNT(*)::int FROM talent_profiles tp JOIN users u ON u.id = tp.user_id WHERE u.country_id = countries.id)`,
      companiesCount: sql<number>`(SELECT COUNT(*)::int FROM companies c WHERE c.country_id = countries.id)`,
      opportunitiesCount: sql<number>`(SELECT COUNT(*)::int FROM opportunities o WHERE o.country_id = countries.id AND o.status = 'PUBLISHED')`,
    })
    .from(countries);

  return { country: c, talents, companyList, opps, allStats };
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ iso2: string }>;
}) {
  const { iso2 } = await params;
  const data = await getCountry(iso2);
  if (!data) notFound();
  const { country, talents, companyList, opps, allStats } = data;

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative">
          <Link
            href="/pays"
            className="text-sm text-white/50 hover:text-white inline-flex items-center gap-1 mb-6"
          >
            ← Tous les pays
          </Link>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="text-7xl">{country.flag}</div>
            <div className="flex-1">
              <h1 className="heading-2">
                {country.nameFr}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-white/60">
                <MapPin className="w-4 h-4" />
                Capitale : {country.capital}
                {country.region && <span> · {country.region}</span>}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg">
                <div>
                  <div className="stat-sm">{talents.length}</div>
                  <div className="text-xs text-white/50">Talents</div>
                </div>
                <div>
                  <div className="stat-sm">{companyList.length}</div>
                  <div className="text-xs text-white/50">Entreprises</div>
                </div>
                <div>
                  <div className="stat-sm text-[#f47b00]">{opps.length}</div>
                  <div className="text-xs text-white/50">Opportunités</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-bovan py-12">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          <div className="space-y-12">
            {talents.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#f47b00]" />
                    Talents de {country.nameFr}
                  </h2>
                  <Link
                    href={`/talents?country=${country.iso2}`}
                    className="text-sm text-[#f47b00] font-medium hover:underline"
                  >
                    Tout voir →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {talents.map((t) => (
                    <TalentCard key={t.id} talent={t as TalentCardData} />
                  ))}
                </div>
              </div>
            )}

            {opps.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#f47b00]" />
                    Opportunités en {country.nameFr}
                  </h2>
                  <Link
                    href={`/opportunites?country=${country.iso2}`}
                    className="text-sm text-[#f47b00] font-medium hover:underline"
                  >
                    Tout voir →
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {opps.map((o) => (
                    <OpportunityCard
                      key={o.id}
                      opportunity={o as OpportunityCardData}
                    />
                  ))}
                </div>
              </div>
            )}

            {companyList.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#f47b00]" />
                    Entreprises de {country.nameFr}
                  </h2>
                  <Link
                    href={`/entreprises?country=${country.iso2}`}
                    className="text-sm text-[#f47b00] font-medium hover:underline"
                  >
                    Tout voir →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {companyList.map((c) => (
                    <CompanyCard
                      key={c.id}
                      company={c as CompanyCardData}
                    />
                  ))}
                </div>
              </div>
            )}

            {talents.length === 0 && opps.length === 0 && companyList.length === 0 && (
              <div className="text-center py-20">
                <Globe2 className="w-16 h-16 text-[#e5e5e5] mx-auto" />
                <h3 className="font-bold text-xl mt-4">
                  Pas encore d&apos;activité au {country.nameFr}
                </h3>
                <p className="text-[#737373] mt-2 max-w-md mx-auto">
                  OCD grandit chaque jour. Soyez le premier à publier une
                  opportunité ou créer un profil talent dans ce pays.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <Link
                    href="/auth/register?role=talent"
                    className="btn-primary"
                  >
                    Je suis un talent
                  </Link>
                  <Link
                    href="/auth/register?role=company"
                    className="btn-outline"
                  >
                    Je recrute
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside>
            <div className="bg-[#0a0a0a] rounded-2xl p-5 sticky top-20">
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">
                Localisation
              </h3>
              <div className="rounded-xl overflow-hidden bg-[#0a0a0a]">
                <AfricaMap stats={allStats} />
              </div>
              <p className="text-white/40 text-xs mt-3 text-center">
                Cliquez sur un autre pays pour explorer.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
