import { db } from "@/db";
import { companies, countries, opportunities } from "@/db/schema";
import { eq, sql, desc, like, or, and } from "drizzle-orm";
import { CompanyCard, type CompanyCardData } from "@/components/CompanyCard";
import { EmptyState } from "@/components/EmptyState";
import { Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  industry?: string;
  country?: string;
}

async function getCompanies(params: SearchParams) {
  const filters = [eq(companies.isActive, true)];
  if (params.country) {
    const [c] = await db
      .select()
      .from(countries)
      .where(eq(countries.iso2, params.country.toUpperCase()))
      .limit(1);
    if (c) filters.push(eq(companies.countryId, c.id));
  }
  if (params.industry) {
    filters.push(eq(companies.industry, params.industry));
  }
  if (params.q) {
    const q = `%${params.q}%`;
    filters.push(
      or(like(companies.name, q), like(companies.description, q))!
    );
  }

  return db
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
    .where(and(...filters))
    .orderBy(desc(companies.createdAt))
    .limit(48);
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

async function getIndustries() {
  return db
    .selectDistinct({ industry: companies.industry })
    .from(companies)
    .where(sql`${companies.industry} IS NOT NULL`);
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [companyList, allCountries, industries] = await Promise.all([
    getCompanies(params),
    getAllCountries(),
    getIndustries(),
  ]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 chip-orange bg-white/10 text-[#ffb352] ring-white/20 mb-4">
              <Building2 aria-hidden="true" className="w-3.5 h-3.5" />
              {companyList.length} entreprises
            </div>
            <h1 className="heading-1 text-white">
              Les entreprises
              <br />
              <span className="text-[#f47b00]">qui recrutent.</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-xl text-lg">
              Startups, PME, grandes entreprises, ONG, institutions.
              Découvrez les organisations qui font confiance à OCD pour
              trouver leurs talents.
            </p>
          </div>
        </div>
      </section>

      <section className="container-bovan py-10">
        <form className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              name="q"
              type="search"
              aria-label="Rechercher une entreprise par nom, secteur ou mot-clé"
              defaultValue={params.q}
              placeholder="Nom, secteur, mot-clé…"
              className="input"
            />
            <select
              name="industry"
              aria-label="Secteur"
              defaultValue={params.industry || ""}
              className="select"
            >
              <option value="">Tous les secteurs</option>
              {industries
                .filter((i) => i.industry)
                .map((i) => (
                  <option key={i.industry} value={i.industry!}>
                    {i.industry}
                  </option>
                ))}
            </select>
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
          </div>
          <button type="submit" className="btn-primary mt-3 text-sm py-2">
            Filtrer
          </button>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companyList.length === 0 ? (
            <EmptyState
              filtered
              title="Aucune entreprise ne correspond"
              description={
                params.q || params.country
                  ? "Aucune entreprise ne correspond à ces critères. Essayez un autre mot-clé ou un autre pays."
                  : "Les entreprises qui recrutent sur OCD apparaîtront ici."
              }
              action={
                <>
                  <Link href="/auth/register?role=company" className="btn-primary">
                    Inscrire mon entreprise
                  </Link>
                  <Link href="/entreprises" className="btn-light">
                    Réinitialiser les filtres
                  </Link>
                </>
              }
            />
          ) : (
            companyList.map((c) => (
              <CompanyCard key={c.id} company={c as CompanyCardData} />
            ))
          )}
        </div>
      </section>

      <section className="container-bovan pb-20">
        <div className="bg-[#0a0a0a] text-white rounded-3xl p-8 md:p-12 text-center">
          <Building2 className="w-8 h-8 mx-auto mb-4 text-[#f47b00]" />
          <h3 className="heading-3 text-white">Vous recrutez ?</h3>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">
            Inscrivez votre entreprise sur OCD et accédez aux meilleurs
            talents d&apos;Afrique.
          </p>
          <Link
            href="/auth/register?role=company"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[#f47b00] text-white font-semibold hover:bg-[#c56200] transition-colors"
          >
            Créer mon espace entreprise
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
