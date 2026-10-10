import Link from "next/link";
import dynamic from "next/dynamic";
import { db } from "@/db";
import {
  countries,
  talentProfiles,
  companies,
  opportunities,
  users,
  applications,
} from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { AfricaMapLazy } from "@/components/AfricaMapLazy";
import { HeroSlogan } from "@/components/HeroSlogan";
import {
  Briefcase,
  Users,
  Building2,
  User,
  Globe2,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Award,
  Eye,
  Star,
  Heart,
  MapPin,
} from "lucide-react";
import { TalentCard } from "@/components/TalentCard";
import { CompanyCard } from "@/components/CompanyCard";
import { OpportunityCard } from "@/components/OpportunityCard";

/* The page stays dynamic (the layout reads the session cookie) but the
   homepage aggregates are public and change slowly, so they are cached for a
   short window instead of running 5 queries on every request. */
export const revalidate = 60;

const getStats = unstable_cache(
  async () => {
    const [t] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(talentProfiles);
    const [c] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(companies);
    const [o] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunities)
      .where(eq(opportunities.status, "PUBLISHED"));
    const [a] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications);
    const [u] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    const [countriesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(countries);
    return {
      talents: t?.count ?? 0,
      companies: c?.count ?? 0,
      opportunities: o?.count ?? 0,
      applications: a?.count ?? 0,
      users: u?.count ?? 0,
      countries: countriesCount?.count ?? 0,
    };
  },
  ["home-stats"],
  { revalidate: 60 }
);

const getCountryStats = unstable_cache(
  async () => {
    return db
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
  },
  ["home-country-stats"],
  { revalidate: 60 }
);

const getFeaturedTalents = unstable_cache(
  async () => {
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
      .where(eq(talentProfiles.isSpontaneous, true))
      .orderBy(desc(talentProfiles.viewsCount))
      .limit(6);
  },
  ["home-featured-talents"],
  { revalidate: 60, tags: ["talents"] }
);

const getFeaturedCompanies = unstable_cache(
  async () => {
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
      .orderBy(desc(sql`${companies.createdAt}`))
      .limit(4);
  },
  ["home-featured-companies"],
  { revalidate: 60, tags: ["companies"] }
);

const getFeaturedOpportunities = unstable_cache(
  async () => {
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
      .where(eq(opportunities.status, "PUBLISHED"))
      .orderBy(desc(opportunities.publishedAt))
      .limit(6);
  },
  ["home-featured-opportunities"],
  { revalidate: 60, tags: ["opportunities"] }
);

export default async function HomePage() {
  const [stats, countryStats, talents, companiesList, opps] = await Promise.all([
    getStats(),
    getCountryStats(),
    getFeaturedTalents(),
    getFeaturedCompanies(),
    getFeaturedOpportunities(),
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        {/* The hero background layers (WebGL beam, grid, glows and embers) were
            removed so the slogan carries the section on its own. The dark
            surface stays: the headline is white and needs it for contrast. */}

        <div className="container-bovan relative flex min-h-[100svh] items-center py-16 md:py-24">
          <div className="text-center max-w-5xl mx-auto w-full">
            <HeroSlogan />

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-[#f47b00]" />
                {stats.countries} pays africains
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#f47b00]" />
                {stats.talents.toLocaleString("fr-FR")} talents
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#f47b00]" />
                {stats.companies.toLocaleString("fr-FR")} entreprises
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#f47b00]" />
                {stats.opportunities.toLocaleString("fr-FR")} opportunités
              </span>
            </div>
          </div>
        </div>

        <div className="h-12 bg-linear-to-b from-[#0a0a0a] to-[#fafafa]" />
      </section>

      {/* SCROLL STORYTELLING */}
      <section className="py-24 md:py-32 bg-[#fafafa]">
        <div className="container-bovan">
          <div className="text-center mb-16">
            <p className="eyebrow">Trois expériences, une mission</p>
            <h2 className="heading-2 mt-3">
              Se montrer.
              <br />
              Explorer.
              <br />
              <span className="text-[#f47b00]">Connecter.</span>
            </h2>
            <p className="text-[#525252] mt-4 max-w-xl mx-auto">
              OCD n&apos;est pas un simple job board. C&apos;est une plateforme où
              les talents africains se rendent visibles et où les entreprises
              viennent les chercher.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                n: "01",
                title: "Se montrer",
                desc: "Créez votre profil, présentez vos compétences, publiez votre candidature spontanée. Même sans offre, vous devenez visible.",
                color: "from-[#f47b00] to-[#ff9520]",
                icon: <Eye className="w-5 h-5" />,
              },
              {
                n: "02",
                title: "Explorer",
                desc: "Parcourez l'Afrique, filtrez par pays, compétence, disponibilité. Découvrez des talents que vous n'auriez jamais trouvés.",
                color: "from-[#0a0a0a] to-[#404040]",
                icon: <Globe2 className="w-5 h-5" />,
              },
              {
                n: "03",
                title: "Connecter",
                desc: "Un message, un appel, une opportunité. Connectez-vous directement avec les talents et les entreprises qui vous correspondent.",
                color: "from-[#f47b00] to-[#c56200]",
                icon: <ArrowRight className="w-5 h-5" />,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-white border border-[#e5e5e5] hover:border-[#0a0a0a] transition hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${s.color} text-white mb-6`}
                >
                  {s.icon}
                </div>
                <div className="text-7xl font-black text-[#f1f1f1] absolute top-4 right-6 select-none">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold mb-2 relative">{s.title}</h3>
                <p className="text-[#525252] text-sm leading-relaxed relative">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AFRICA MAP */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-bovan">
          <div className="grid lg:grid-cols-[1fr,1.4fr] gap-12 items-center">
            <div>
              <p className="eyebrow">Carte interactive</p>
              <h2 className="heading-2 mt-3">
                L&apos;Afrique,
                <br />
                <span className="text-[#f47b00]">pays par pays.</span>
              </h2>
              <p className="text-[#525252] mt-4 leading-relaxed">
                Survolez chaque pays pour découvrir les talents, les entreprises
                et les opportunités qui s&apos;y trouvent. Cliquez pour explorer
                en détail. Les lignes représentent les connexions entre
                capitales économiques du continent.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { label: "Pays représentés", value: `${stats.countries}` },
                  { label: "Talents visibles", value: stats.talents.toLocaleString("fr-FR") },
                  { label: "Opportunités actives", value: stats.opportunities.toLocaleString("fr-FR") },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between py-3 border-b border-[#f1f1f1]"
                  >
                    <span className="text-sm text-[#525252]">{s.label}</span>
                    <span className="stat-sm">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/pays"
                className="btn-primary mt-8"
              >
                Explorer tous les pays
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-black rounded-3xl p-6 md:p-10 relative overflow-hidden">
              {/* Flat black ground. An animated aurora mesh used to sit here,
                  but it washed the map out: the orange country fills lost
                  contrast against it and the glow fought the lit borders.
                  The grid is kept very faint (18%) purely to stop the large
                  black panel reading as a flat void. */}
              <div className="absolute inset-0 bg-grid-dark opacity-[0.18]" aria-hidden="true" />
              <div className="relative">
                <AfricaMapLazy stats={countryStats} />
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40 px-2">
                {/* Matches the data ramp used by AfricaMap exactly. */}
                <span className="flex items-center gap-2">
                  Activité
                  <span className="flex items-center gap-1">
                    {["#141414", "#7a3900", "#b35400", "#e06a00", "#f47b00"].map(
                      (c) => (
                        <span
                          key={c}
                          className="w-4 h-3 rounded-sm ring-1 ring-white/15"
                          style={{ backgroundColor: c }}
                        />
                      )
                    )}
                  </span>
                  faible → forte
                </span>
                <span>{countryStats.filter((c) => c.talentsCount + c.companiesCount + c.opportunitiesCount > 0).length} pays actifs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28 bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="container-bovan relative">
          <div className="text-center mb-16">
            <p className="eyebrow text-[#ff9520]">Comment ça marche</p>
            <h2 className="heading-2 mt-3 text-white">
              Quatre étapes,
              <br />
              <span className="text-[#f47b00]">et c&apos;est parti.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#f47b00] flex items-center justify-center text-white font-black text-sm">
                  T
                </span>
                Pour les talents
              </h3>
              <div className="space-y-3">
                {[
                  { n: "01", t: "Crée ton profil", d: "Inscris-toi et présente-toi en 2 minutes" },
                  { n: "02", t: "Montre tes compétences", d: "Ajoute tes skills, expériences et portfolio" },
                  { n: "03", t: "Rends-toi visible", d: "Publie ta candidature spontanée" },
                  { n: "04", t: "Reçois des opportunités", d: "Les entreprises viennent te chercher" },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#f47b00]/50 transition-colors"
                  >
                    <span className="text-[#f47b00] font-black text-2xl font-mono">
                      {s.n}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{s.t}</h4>
                      <p className="text-sm text-white/60 mt-1">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0a0a0a] font-black text-sm">
                  E
                </span>
                Pour les entreprises
              </h3>
              <div className="space-y-3">
                {[
                  { n: "01", t: "Crée ton entreprise", d: "Inscris-toi et présente ta structure" },
                  { n: "02", t: "Définis tes besoins", d: "Publie une opportunité ou cherche des talents" },
                  { n: "03", t: "Trouve des talents", d: "Filtre par compétence, pays, expérience" },
                  { n: "04", t: "Contacte-les", d: "Un message, c'est le début d'une histoire" },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#f47b00]/50 transition-colors"
                  >
                    <span className="text-[#f47b00] font-black text-2xl font-mono">
                      {s.n}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{s.t}</h4>
                      <p className="text-sm text-white/60 mt-1">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TALENTS */}
      <section className="py-20 md:py-28 bg-[#fafafa]">
        <div className="container-bovan">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Talents à découvrir</p>
              <h2 className="heading-2 mt-3">
                Disponibles.
                <br />
                <span className="text-[#f47b00]">Maintenant.</span>
              </h2>
            </div>
            <Link
              href="/talents"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#0a0a0a] text-sm font-medium hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              Voir tous les talents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {talents.map((t) => (
              <TalentCard key={t.id} talent={t} />
            ))}
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-bovan">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Opportunités</p>
              <h2 className="heading-2 mt-3">
                Les postes qui
                <br />
                <span className="text-[#f47b00]">vous attendent.</span>
              </h2>
            </div>
            <Link
              href="/opportunites"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#0a0a0a] text-sm font-medium hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              Toutes les opportunités
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {opps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        </div>
      </section>

      {/* COMPANIES */}
      <section className="py-20 md:py-28 bg-[#fafafa]">
        <div className="container-bovan">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Entreprises</p>
              <h2 className="heading-2 mt-3">
                Celles qui recrutent
                <br />
                <span className="text-[#f47b00]">aujourd&apos;hui.</span>
              </h2>
            </div>
            <Link
              href="/entreprises"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#0a0a0a] text-sm font-medium hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              Toutes les entreprises
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {companiesList.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-12 bg-[#0a0a0a] overflow-hidden border-y border-white/10">
        <div className="flex marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-12 px-6 shrink-0">
              {[
                "Cotonou ●",
                "Lagos ●",
                "Accra ●",
                "Dakar ●",
                "Abidjan ●",
                "Douala ●",
                "Nairobi ●",
                "Kigali ●",
                "Kinshasa ●",
                "Addis Ababa ●",
                "Cape Town ●",
                "Maputo ●",
                "Tunis ●",
                "Casablanca ●",
                "Cairo ●",
              ].map((city, i) => (
                <span
                  key={i}
                  className="stat-sm text-white/30"
                >
                  {city}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-bovan">
          <div className="text-center mb-12">
            <p className="eyebrow">OCD en chiffres</p>
            <h2 className="heading-2 mt-3">
              Une plateforme,
              <br />
              <span className="text-[#f47b00]">un continent.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-5 h-5" />, value: stats.talents, label: "Talents inscrits" },
              { icon: <Building2 className="w-5 h-5" />, value: stats.companies, label: "Entreprises" },
              { icon: <Briefcase className="w-5 h-5" />, value: stats.opportunities, label: "Opportunités" },
              { icon: <Globe2 className="w-5 h-5" />, value: stats.countries, label: "Pays" },
            ].map((s) => (
              <div
                key={s.label}
                className="p-6 md:p-8 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] text-center hover:border-[#f47b00] transition-colors group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f47b00]/10 text-[#f47b00] mb-4 group-hover:bg-[#f47b00] group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <div className="stat">
                  {s.value.toLocaleString("fr-FR")}
                </div>
                <div className="text-sm text-[#525252] mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / TALENT OF THE WEEK */}
      {talents[0] && (
        <section className="py-20 md:py-28 bg-[#0a0a0a] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-dark opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] glow-orange opacity-20" />
          <div className="container-bovan relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 chip-orange bg-white/10 text-[#ffb352] ring-white/20 mb-6">
                <Award className="w-3.5 h-3.5" />
                Talent du moment
              </div>
              <blockquote className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
                « Je n&apos;attends pas qu&apos;une entreprise me trouve. Je rends
                mon potentiel{" "}
                <span className="text-[#f47b00]">visible</span>. »
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white font-black text-lg">
                  {talents[0].firstName?.[0]}
                  {talents[0].lastName?.[0]}
                </div>
                <div className="text-left">
                  <div className="font-semibold">
                    {talents[0].firstName} {talents[0].lastName}
                  </div>
                  <div className="text-sm text-white/60">
                    {talents[0].headline} · {talents[0].countryFlag}{" "}
                    {talents[0].countryName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#f47b00] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-10" />
        <div className="container-bovan relative text-center text-white">
          <h2 className="heading-2 text-white">
            Prêt à sortir
            <br />
            de la file ?
          </h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Rejoignez la première communauté panafricaine de talents et
            d&apos;entreprises qui croient aux opportunités. S&apos;inscrire est
            gratuit.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register?role=talent"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0a0a0a] text-white font-semibold hover:bg-[#262626] transition-colors"
            >
              <User className="w-5 h-5" />
              Je crée mon profil talent
            </Link>
            <Link
              href="/auth/register?role=company"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#0a0a0a] font-semibold hover:bg-white/90 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              Je recrute sur OCD
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
