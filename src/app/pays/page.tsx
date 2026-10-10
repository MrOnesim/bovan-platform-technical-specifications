import { db } from "@/db";
import { countries } from "@/db/schema";
import { sql, eq, asc } from "drizzle-orm";
import Link from "next/link";
import { Globe2, ArrowRight, MapPin, Users, Building2, Briefcase } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

async function getCountriesWithStats() {
  return db
    .select({
      iso2: countries.iso2,
      iso3: countries.iso3,
      name: countries.name,
      nameFr: countries.nameFr,
      flag: countries.flag,
      capital: countries.capital,
      region: countries.region,
      mapId: countries.mapId,
      talentsCount: sql<number>`(SELECT COUNT(*)::int FROM talent_profiles tp JOIN users u ON u.id = tp.user_id WHERE u.country_id = countries.id)`,
      companiesCount: sql<number>`(SELECT COUNT(*)::int FROM companies c WHERE c.country_id = countries.id)`,
      opportunitiesCount: sql<number>`(SELECT COUNT(*)::int FROM opportunities o WHERE o.country_id = countries.id AND o.status = 'PUBLISHED')`,
    })
    .from(countries)
    .orderBy(asc(countries.nameFr));
}

export default async function CountriesPage() {
  const list = await getCountriesWithStats();
  const featured = list
    .filter((c) => c.talentsCount + c.companiesCount + c.opportunitiesCount > 0)
    .slice(0, 12);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-orange opacity-30" />
        <div className="container-bovan relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 chip-orange bg-white/10 text-[#ffb352] ring-white/20 mb-4">
              <Globe2 className="w-3.5 h-3.5" />
              {list.length} pays du continent
            </div>
            <h1 className="heading-1 text-white">
              L&apos;Afrique,
              <br />
              <span className="text-[#f47b00]">pays par pays.</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-xl text-lg">
              Parcourez les talents, entreprises et opportunités présents dans
              chaque pays du continent.
            </p>
          </div>
        </div>
      </section>

      <section className="container-bovan py-10">
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Pays les plus actifs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {featured.map((c) => (
                <Link
                  key={c.iso2}
                  href={`/pays/${c.iso2.toLowerCase()}`}
                  className="bg-white rounded-2xl p-4 border border-[#e5e5e5] hover:border-[#f47b00] transition-colors group"
                >
                  <div aria-hidden="true" className="text-3xl mb-2">{c.flag}</div>
                  <h3 className="font-semibold group-hover:text-[#f47b00] transition-colors">
                    {c.nameFr}
                  </h3>
                  <div className="text-xs text-[#737373] mt-1 flex items-center gap-1">
                    <MapPin aria-hidden="true" className="w-3 h-3" />
                    {c.capital}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-[#525252]">
                      <Users aria-hidden="true" className="w-3 h-3" />
                      {c.talentsCount}
                    </span>
                    <span className="flex items-center gap-1 text-[#525252]">
                      <Building2 aria-hidden="true" className="w-3 h-3" />
                      {c.companiesCount}
                    </span>
                    <span className="flex items-center gap-1 text-[#f47b00] font-semibold">
                      <Briefcase aria-hidden="true" className="w-3 h-3" />
                      {c.opportunitiesCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Tous les pays</h2>
        {list.length === 0 ? (
          <EmptyState
            title="Aucun pays à afficher"
            description="La liste des pays n'a pas pu être chargée. Réessayez dans un instant."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {list.map((c) => (
              <Link
                key={c.iso2}
                href={`/pays/${c.iso2.toLowerCase()}`}
                className="bg-white rounded-xl p-3 border border-[#e5e5e5] hover:border-[#f47b00] hover:bg-[#fff8ee] transition-colors group flex items-center gap-2"
              >
                <span aria-hidden="true" className="text-xl">{c.flag}</span>
                <span className="font-medium text-sm group-hover:text-[#f47b00] transition-colors truncate flex-1">
                  {c.nameFr}
                </span>
                <ArrowRight aria-hidden="true" className="w-3 h-3 text-[#a3a3a3] group-hover:text-[#f47b00] transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
