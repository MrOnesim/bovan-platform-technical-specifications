import { db } from "@/db";
import {
  opportunities,
  companies,
  countries,
  applications,
  talentProfiles,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Globe2,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyCard";
import {
  formatCurrency,
  employmentTypeLabel,
  experienceLevelLabel,
  formatDate,
} from "@/lib/utils";
import { ApplyButton } from "@/components/ApplyButton";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getOpportunity(slug: string) {
  const [opp] = await db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      slug: opportunities.slug,
      description: opportunities.description,
      location: opportunities.location,
      employmentType: opportunities.employmentType,
      experienceLevel: opportunities.experienceLevel,
      salaryMin: opportunities.salaryMin,
      salaryMax: opportunities.salaryMax,
      currency: opportunities.currency,
      remote: opportunities.remote,
      deadline: opportunities.deadline,
      publishedAt: opportunities.publishedAt,
      skills: opportunities.skills,
      companyId: opportunities.companyId,
      companyName: companies.name,
      companySlug: companies.slug,
      companyLogo: companies.logo,
      companyVerified: companies.verification,
      companyIndustry: companies.industry,
      companyDescription: companies.description,
      companyEmployeeCount: companies.employeeCount,
      companyWebsite: companies.website,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
    })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(countries, eq(countries.id, opportunities.countryId))
    .where(eq(opportunities.slug, slug))
    .limit(1);
  if (!opp) return null;

  // increment view
  await db
    .update(opportunities)
    .set({ viewsCount: sql`${opportunities.viewsCount} + 1` })
    .where(eq(opportunities.id, opp.id));

  return opp;
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [opp, session] = await Promise.all([
    getOpportunity(slug),
    getCurrentUser(),
  ]);
  if (!opp) notFound();

  let alreadyApplied = false;
  if (session?.talent) {
    const [existing] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.opportunityId, opp.id),
          eq(applications.talentId, session.talent.id)
        )
      )
      .limit(1);
    alreadyApplied = !!existing;
  }

  const salary =
    formatCurrency(opp.salaryMin, opp.currency || "USD") +
    (opp.salaryMax
      ? " – " + formatCurrency(opp.salaryMax, opp.currency || "USD")
      : "");

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-white border-b border-[#e5e5e5]">
        <div className="container-bovan py-8 md:py-12">
          <Link
            href="/opportunites"
            className="text-sm text-[#737373] hover:text-[#0a0a0a] inline-flex items-center gap-1 mb-6"
          >
            ← Retour aux opportunités
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <CompanyLogo name={opp.companyName} logo={opp.companyLogo} size="lg" />
            <div className="flex-1">
              <h1 className="page-title">
                {opp.title}
              </h1>
              <Link
                href={`/entreprises/${opp.companySlug}`}
                className="text-lg text-[#525252] hover:text-[#f47b00] inline-flex items-center gap-1.5 mt-2"
              >
                {opp.companyName}
                {opp.companyVerified === "VERIFIED" && (
                  <CheckCircle2 className="w-4 h-4 text-[#f47b00]" />
                )}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="chip-orange">
                  <Briefcase className="w-3 h-3" />
                  {employmentTypeLabel(opp.employmentType)}
                </span>
                <span className="chip-neutral">
                  {experienceLevelLabel(opp.experienceLevel)}
                </span>
                {opp.remote && (
                  <span className="chip-success">
                    <Globe2 className="w-3 h-3" />
                    Remote
                  </span>
                )}
                {opp.location && (
                  <span className="chip-neutral">
                    <MapPin className="w-3 h-3" />
                    {opp.location}
                  </span>
                )}
                {salary && (
                  <span className="chip-neutral">
                    <DollarSign className="w-3 h-3" />
                    {salary}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {alreadyApplied ? (
                <div className="px-6 py-3 rounded-full bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Vous avez postulé
                </div>
              ) : (
                <ApplyButton
                  opportunityId={opp.id}
                  opportunityTitle={opp.title}
                  className="btn-primary"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-bovan py-10 grid lg:grid-cols-[1fr,320px] gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
            <h2 className="text-xl font-bold mb-4">Description du poste</h2>
            <div className="text-[#404040] leading-relaxed whitespace-pre-line">
              {opp.description}
            </div>
          </div>

          {opp.skills && opp.skills.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-4">Compétences recherchées</h2>
              <div className="flex flex-wrap gap-2">
                {opp.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full bg-[#f47b00]/5 border border-[#f47b00]/20 text-sm font-medium text-[#c56200]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {opp.companyDescription && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-4">À propos de {opp.companyName}</h2>
              <p className="text-[#404040] leading-relaxed">
                {opp.companyDescription}
              </p>
              <Link
                href={`/entreprises/${opp.companySlug}`}
                className="inline-flex items-center gap-1.5 text-[#f47b00] font-medium mt-4 hover:underline"
              >
                Voir la fiche entreprise
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5] sticky top-20">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#737373]">
              Résumé
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-[#a3a3a3] mt-0.5 shrink-0" />
                <div>
                  <dt className="text-[#737373]">Type</dt>
                  <dd className="font-medium">
                    {employmentTypeLabel(opp.employmentType)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#a3a3a3] mt-0.5 shrink-0" />
                <div>
                  <dt className="text-[#737373]">Lieu</dt>
                  <dd className="font-medium">
                    {opp.location || "Non précisé"}
                  </dd>
                </div>
              </div>
              {opp.deadline && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#a3a3a3] mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[#737373]">Date limite</dt>
                    <dd className="font-medium">
                      {formatDate(opp.deadline)}
                    </dd>
                  </div>
                </div>
              )}
              {opp.publishedAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#a3a3a3] mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[#737373]">Publiée le</dt>
                    <dd className="font-medium">
                      {formatDate(opp.publishedAt)}
                    </dd>
                  </div>
                </div>
              )}
              {salary && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-[#a3a3a3] mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[#737373]">Salaire</dt>
                    <dd className="font-medium">{salary}</dd>
                  </div>
                </div>
              )}
            </dl>

            {!alreadyApplied && (
              <div className="mt-6 pt-6 border-t border-[#f1f1f1]">
                <ApplyButton
                  opportunityId={opp.id}
                  opportunityTitle={opp.title}
                  className="btn-primary w-full justify-center"
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
