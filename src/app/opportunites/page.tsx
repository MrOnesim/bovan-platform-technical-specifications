import { db } from "@/db";
import { opportunities, companies, countries } from "@/db/schema";
import { eq, and, desc, like, or } from "drizzle-orm";
import {
  OpportunityCard,
  type OpportunityCardData,
} from "@/components/OpportunityCard";
import { Briefcase, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  country?: string;
  type?: string;
  remote?: string;
}

async function getOpportunities(params: SearchParams) {
  const filters = [eq(opportunities.status, "PUBLISHED")];
  if (params.country) {
    const [c] = await db
      .select()
      .from(countries)
      .where(eq(countries.iso2, params.country.toUpperCase()))
      .limit(1);
    if (c) filters.push(eq(opportunities.countryId, c.id));
  }
  if (params.type) {
    filters.push(
      eq(
        opportunities.employmentType,
        params.type as
          | "FULL_TIME"
          | "PART_TIME"
          | "FREELANCE"
          | "INTERNSHIP"
          | "CONTRACT"
          | "VOLUNTEER"
          | "PROJECT"
          | "REMOTE"
      )
    );
  }
  if (params.remote === "1") {
    filters.push(eq(opportunities.remote, true));
  }
  if (params.q) {
    const q = `%${params.q}%`;
    filters.push(
      or(like(opportunities.title, q), like(opportunities.description, q))!
    );
  }

  return db
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
    .where(and(...filters))
    .orderBy(desc(opportunities.publishedAt))
    .limit(48);
}

async function getAllCountries() {
  return db
    .select({ iso2: countries.iso2, nameFr: countries.nameFr, flag: countries.flag })
    .from(countries)
    .orderBy(countries.nameFr);
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [opps, allCountries] = await Promise.all([
    getOpportunities(params),
    getAllCountries(),
  ]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 chip-orange bg-white/10 text-[#ffb352] ring-white/20 mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              {opps.length} opportunités actives
            </div>
            <h1 className="heading-1 text-white">
              Les postes qui
              <br />
              <span className="text-[#f47b00]">vous attendent.</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-xl text-lg">
              CDI, freelance, stage, à distance. Trouvez l&apos;opportunité qui
              correspond à votre histoire, partout en Afrique.
            </p>
          </div>
        </div>
      </section>

      <section className="container-bovan py-10">
        <form className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
              <input
                name="q"
                type="text"
                defaultValue={params.q}
                placeholder="Poste, mot-clé..."
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
              name="type"
              defaultValue={params.type || ""}
              className="select"
            >
              <option value="">Tous les types</option>
              <option value="FULL_TIME">Temps plein</option>
              <option value="PART_TIME">Temps partiel</option>
              <option value="FREELANCE">Freelance</option>
              <option value="INTERNSHIP">Stage</option>
              <option value="CONTRACT">Contrat</option>
            </select>
            <button type="submit" className="btn-primary text-sm py-2">
              Filtrer
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm mt-3 cursor-pointer">
            <input
              type="checkbox"
              name="remote"
              value="1"
              defaultChecked={params.remote === "1"}
              className="w-4 h-4 rounded text-[#f47b00] focus:ring-[#f47b00]"
            />
            <span>Uniquement les postes en remote</span>
          </label>
        </form>

        {opps.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#525252]">
              Aucune opportunité ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {opps.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o as OpportunityCardData}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container-bovan pb-20">
        <div className="bg-[#0a0a0a] text-white rounded-3xl p-8 md:p-12 text-center">
          <h3 className="heading-3 text-white">Les opportunités, c&apos;est dehors.</h3>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">
            Et si la prochaine, c&apos;est la vôtre ? Créez votre profil talent
            et recevez des opportunités directement.
          </p>
          <Link
            href="/auth/register?role=talent"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[#f47b00] text-white font-semibold hover:bg-[#c56200] transition-colors"
          >
            Créer mon profil
          </Link>
        </div>
      </section>
    </div>
  );
}
