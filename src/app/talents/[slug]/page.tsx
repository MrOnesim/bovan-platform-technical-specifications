import { db } from "@/db";
import {
  countries,
  cities,
  talentProfiles,
  talentSkills,
  skills,
  users,
  experiences,
  educations,
  portfolioItems,
  companies,
  applications,
  opportunities,
} from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Briefcase,
  Mail,
  GraduationCap,
  Award,
  Globe2,
  Calendar,
  Eye,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyCard";
import { initials, availabilityLabel, experienceLevelLabel } from "@/lib/utils";
import Link from "next/link";
import { ContactTalentButton } from "@/components/ContactTalentButton";

export const dynamic = "force-dynamic";

async function getTalent(slug: string) {
  const [talent] = await db
    .select({
      id: talentProfiles.id,
      slug: talentProfiles.slug,
      headline: talentProfiles.headline,
      biography: talentProfiles.biography,
      profession: talentProfiles.profession,
      availability: talentProfiles.availability,
      experienceLevel: talentProfiles.experienceLevel,
      yearsExperience: talentProfiles.yearsExperience,
      salaryExpectation: talentProfiles.salaryExpectation,
      currency: talentProfiles.currency,
      remotePreference: talentProfiles.remotePreference,
      profileVisibility: talentProfiles.profileVisibility,
      cvUrl: talentProfiles.cvUrl,
      portfolioUrl: talentProfiles.portfolioUrl,
      linkedinUrl: talentProfiles.linkedinUrl,
      githubUrl: talentProfiles.githubUrl,
      websiteUrl: talentProfiles.websiteUrl,
      completionScore: talentProfiles.completionScore,
      viewsCount: talentProfiles.viewsCount,
      firstName: users.firstName,
      lastName: users.lastName,
      avatarUrl: users.avatarUrl,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
      cityName: cities.name,
      userId: users.id,
    })
    .from(talentProfiles)
    .innerJoin(users, eq(users.id, talentProfiles.userId))
    .leftJoin(countries, eq(countries.id, users.countryId))
    .leftJoin(cities, eq(cities.id, users.cityId))
    .where(eq(talentProfiles.slug, slug))
    .limit(1);

  if (!talent) return null;

  const [talentSkillsList, expList, eduList, portfolio] = await Promise.all([
    db
      .select({
        name: skills.name,
        slug: skills.slug,
        level: talentSkills.level,
        category: skills.category,
      })
      .from(talentSkills)
      .innerJoin(skills, eq(skills.id, talentSkills.skillId))
      .where(eq(talentSkills.talentId, talent.id)),
    db
      .select()
      .from(experiences)
      .where(eq(experiences.talentId, talent.id))
      .orderBy(sql`${experiences.startDate} DESC NULLS LAST`),
    db
      .select()
      .from(educations)
      .where(eq(educations.talentId, talent.id))
      .orderBy(sql`${educations.startDate} DESC NULLS LAST`),
    db
      .select()
      .from(portfolioItems)
      .where(
        and(
          eq(portfolioItems.talentId, talent.id),
          eq(portfolioItems.published, true)
        )
      ),
  ]);

  // increment view count
  await db
    .update(talentProfiles)
    .set({ viewsCount: sql`${talentProfiles.viewsCount} + 1` })
    .where(eq(talentProfiles.id, talent.id));

  return { ...talent, skills: talentSkillsList, experiences: expList, educations: eduList, portfolio };
}

function formatYear(d: Date | null | undefined) {
  if (!d) return "Présent";
  return new Date(d).getFullYear().toString();
}

export default async function TalentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const talent = await getTalent(slug);
  if (!talent) notFound();

  const availabilityColors: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    OPEN_TO_OPPORTUNITIES: "bg-[#f47b00]/10 text-[#c56200] ring-[#f47b00]/20",
    EMPLOYED: "bg-gray-100 text-gray-700 ring-gray-200",
    NOT_AVAILABLE: "bg-gray-100 text-gray-500 ring-gray-200",
  };

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <section className="relative bg-[#0a0a0a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative py-12 md:py-16">
          <Link
            href="/talents"
            className="text-sm text-white/50 hover:text-white inline-flex items-center gap-1 mb-6"
          >
            ← Retour aux talents
          </Link>
          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white font-black text-3xl md:text-4xl shrink-0 overflow-hidden">
              {talent.avatarUrl ? (
                <Image
                  src={talent.avatarUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 128px, 96px"
                  className="rounded-2xl object-cover"
                />
              ) : (
                initials(talent.firstName, talent.lastName)
              )}
            </div>
            <div className="flex-1">
              <h1 className="page-title">
                {talent.firstName} {talent.lastName}
              </h1>
              <p className="text-white/70 text-lg mt-2">{talent.headline}</p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-white/60">
                {talent.countryName && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {talent.cityName ? `${talent.cityName}, ` : ""}
                    {talent.countryFlag} {talent.countryName}
                  </span>
                )}
                {talent.yearsExperience > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {talent.yearsExperience} an{talent.yearsExperience > 1 ? "s" : ""} d&apos;expérience
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {talent.viewsCount} vues
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="bg-[#f47b00] text-white p-3 rounded-2xl mb-2 flex items-center gap-3">
                <Briefcase className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Opportunité</div>
                  <div className="text-sm font-bold leading-tight">Candidat Dehors</div>
                </div>
              </div>
              <span
                className={`chip ring-1 justify-center py-2 ${
                  availabilityColors[talent.availability] ||
                  "bg-white/10 text-white/60"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {availabilityLabel(talent.availability)}
              </span>
              <ContactTalentButton
                talentId={talent.id}
                talentName={`${talent.firstName} ${talent.lastName}`}
                className="btn-primary py-3"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-bovan py-10 grid lg:grid-cols-[1fr,320px] gap-8">
        <div className="space-y-8">
          {talent.biography && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-4">À propos</h2>
              <p className="text-[#404040] leading-relaxed whitespace-pre-line">
                {talent.biography}
              </p>
            </div>
          )}

          {talent.skills.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-4">Compétences</h2>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((s) => (
                  <span
                    key={s.slug}
                    className="px-3 py-1.5 rounded-full bg-[#f47b00]/5 border border-[#f47b00]/20 text-sm font-medium text-[#c56200] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {s.name}
                    <span className="ml-1 flex">
                      {Array.from({ length: s.level }).map((_, i) => (
                        <span
                          key={i}
                          className="w-1 h-3 bg-[#f47b00] rounded-full mr-0.5"
                        />
                      ))}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {talent.experiences.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Expériences
              </h2>
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#e5e5e5]" />
                {talent.experiences.map((e) => (
                  <div key={e.id} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#f47b00]/10 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                      <Building2 className="w-3.5 h-3.5 text-[#f47b00]" />
                    </div>
                    <div className="flex-1 pb-2">
                      <h3 className="font-semibold">{e.position}</h3>
                      <div className="text-sm text-[#525252]">
                        {e.company}
                        {e.location && ` · ${e.location}`}
                      </div>
                      <div className="text-xs text-[#737373] mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatYear(e.startDate)} – {formatYear(e.endDate)}
                        {e.isCurrent && (
                          <span className="ml-2 chip-success text-[10px]">
                            En poste
                          </span>
                        )}
                      </div>
                      {e.description && (
                        <p className="text-sm text-[#525252] mt-2">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {talent.educations.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Formation
              </h2>
              <div className="space-y-4">
                {talent.educations.map((e) => (
                  <div key={e.id}>
                    <h3 className="font-semibold">{e.degree || "Diplôme"}</h3>
                    <div className="text-sm text-[#525252]">{e.institution}</div>
                    {e.field && (
                      <div className="text-sm text-[#737373]">{e.field}</div>
                    )}
                    <div className="text-xs text-[#737373] mt-1">
                      {formatYear(e.startDate)} – {formatYear(e.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {talent.portfolio.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Portfolio
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {talent.portfolio.map((p) => (
                  <div
                    key={p.id}
                    className="border border-[#e5e5e5] rounded-xl p-4 hover:border-[#f47b00] transition-colors"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#f47b00]/10 to-[#0a0a0a]/5 rounded-lg mb-3 flex items-center justify-center">
                      <Award className="w-8 h-8 text-[#f47b00]/40" />
                    </div>
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.category && (
                      <p className="text-xs text-[#737373] mt-1">{p.category}</p>
                    )}
                    {p.description && (
                      <p className="text-sm text-[#525252] mt-2 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    {p.technologies && p.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#f1f1f1] text-[#525252] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#737373]">
              Profil
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#737373]">Complétion</dt>
                <dd className="font-bold">{talent.completionScore}%</dd>
              </div>
              <div>
                <div className="h-2 bg-[#f1f1f1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f47b00] rounded-full transition-all"
                    style={{ width: `${talent.completionScore}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <dt className="text-[#737373]">Niveau</dt>
                <dd className="font-medium">
                  {experienceLevelLabel(talent.experienceLevel)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#737373]">Remote</dt>
                <dd className="font-medium">{talent.remotePreference}</dd>
              </div>
              {talent.salaryExpectation && (
                <div className="flex items-center justify-between">
                  <dt className="text-[#737373]">Prétention</dt>
                  <dd className="font-medium">
                    {talent.salaryExpectation.toLocaleString("fr-FR")}{" "}
                    {talent.currency}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {(talent.linkedinUrl ||
            talent.githubUrl ||
            talent.websiteUrl ||
            talent.portfolioUrl) && (
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#737373]">
                Liens
              </h3>
              <div className="space-y-2">
                {talent.linkedinUrl && (
                  <a
                    href={talent.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#404040] hover:text-[#f47b00]"
                  >
                    LinkedIn
                  </a>
                )}
                {talent.githubUrl && (
                  <a
                    href={talent.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#404040] hover:text-[#f47b00]"
                  >
                    GitHub
                  </a>
                )}
                {talent.websiteUrl && (
                  <a
                    href={talent.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#404040] hover:text-[#f47b00]"
                  >
                    Site web
                  </a>
                )}
                {talent.portfolioUrl && (
                  <a
                    href={talent.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#404040] hover:text-[#f47b00]"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-[#f47b00] to-[#c56200] text-white rounded-2xl p-6">
            <Briefcase className="w-6 h-6 mb-3" />
            <h3 className="font-bold text-lg">Une opportunité à proposer ?</h3>
            <p className="text-sm text-white/80 mt-2">
              Envoyez un message à {talent.firstName} pour démarrer la
              conversation.
            </p>
            <ContactTalentButton
              talentId={talent.id}
              talentName={`${talent.firstName} ${talent.lastName}`}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#0a0a0a] text-white font-semibold hover:bg-[#262626] transition-colors"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
