import { db } from "@/db";
import {
  companies,
  countries,
  cities,
  opportunities,
  users,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Building2,
  Globe2,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Mail,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import { ReviewSection } from "@/components/ReviewSection";
import { canReviewAsTalent, getApprovedReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCompany(slug: string) {
  const [company] = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      description: companies.description,
      industry: companies.industry,
      website: companies.website,
      email: companies.email,
      phone: companies.phone,
      logo: companies.logo,
      coverImage: companies.coverImage,
      employeeCount: companies.employeeCount,
      foundedYear: companies.foundedYear,
      verification: companies.verification,
      socialLinks: companies.socialLinks,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
      cityName: cities.name,
    })
    .from(companies)
    .leftJoin(countries, eq(countries.id, companies.countryId))
    .leftJoin(cities, eq(cities.id, companies.cityId))
    .where(eq(companies.slug, slug))
    .limit(1);

  if (!company) return null;

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
        eq(opportunities.companyId, company.id),
        eq(opportunities.status, "PUBLISHED")
      )
    )
    .orderBy(desc(opportunities.publishedAt));

  return { company, opportunities: opps };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCompany(slug);
  if (!data) notFound();
  const { company, opportunities: opps } = data;

  const session = await getCurrentUser();
  const approvedReviews = await getApprovedReviews("COMPANY", company.id);
  const canReview = Boolean(
    session?.user.role === "TALENT" &&
      session.talent &&
      (await canReviewAsTalent(session.talent.id, company.id))
  );

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative py-12 md:py-16">
          <Link
            href="/entreprises"
            className="text-sm text-white/50 hover:text-white inline-flex items-center gap-1 mb-6"
          >
            ← Retour aux entreprises
          </Link>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <CompanyLogo
              name={company.name}
              logo={company.logo}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="page-title">
                  {company.name}
                </h1>
                {company.verification === "VERIFIED" && (
                  <span className="chip-success text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Vérifiée
                  </span>
                )}
                {company.verification === "PENDING" && (
                  <span className="chip-warn text-xs">En attente</span>
                )}
              </div>
              {company.industry && (
                <p className="text-white/70 text-lg mt-1">{company.industry}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-white/60">
                {(company.cityName || company.countryName) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {[company.cityName, company.countryName]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {company.employeeCount && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {company.employeeCount} employés
                  </span>
                )}
                {company.foundedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Depuis {company.foundedYear}
                  </span>
                )}
              </div>
            </div>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f47b00] text-white font-semibold hover:bg-[#c56200] transition-colors"
              >
                <Globe2 className="w-4 h-4" />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container-bovan py-10 grid lg:grid-cols-[1fr,320px] gap-8">
        <div className="space-y-8">
          {company.description && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-4">À propos</h2>
              <p className="text-[#404040] leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#f47b00]" />
                Offres d&apos;emploi
              </h2>
              <span className="text-sm text-[#737373]">
                {opps.length} opportunité{opps.length > 1 ? "s" : ""}
              </span>
            </div>
            {opps.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e5e5]">
                <p className="text-[#737373]">
                  Aucune offre active pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {opps.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            )}
          </div>

          <ReviewSection
            targetType="COMPANY"
            targetId={company.id}
            canReview={canReview}
            reviews={approvedReviews}
          />
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#737373]">
              Informations
            </h3>
            <dl className="space-y-3 text-sm">
              {company.industry && (
                <div>
                  <dt className="text-[#737373]">Secteur</dt>
                  <dd className="font-medium">{company.industry}</dd>
                </div>
              )}
              {company.employeeCount && (
                <div>
                  <dt className="text-[#737373]">Taille</dt>
                  <dd className="font-medium">
                    {company.employeeCount} employés
                  </dd>
                </div>
              )}
              {company.foundedYear && (
                <div>
                  <dt className="text-[#737373]">Fondée en</dt>
                  <dd className="font-medium">{company.foundedYear}</dd>
                </div>
              )}
              {company.email && (
                <div>
                  <dt className="text-[#737373]">Email</dt>
                  <dd className="font-medium text-xs break-all">
                    {company.email}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
