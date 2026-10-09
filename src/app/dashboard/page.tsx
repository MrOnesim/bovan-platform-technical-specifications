import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import {
  talentProfiles,
  applications,
  opportunities,
  companies,
  countries,
  users,
  talentSkills,
  skills,
  portfolioItems,
  experiences,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  Eye,
  Heart,
  Send,
  ArrowRight,
  TrendingUp,
  Plus,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutDashboard,
  User as UserIcon,
  FileText,
  MessageCircle,
  Settings,
  Bookmark,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyCard";
import { LogoutButton } from "@/components/LogoutButton";
import {
  availabilityLabel,
  experienceLevelLabel,
  formatDate,
  timeAgo,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string, talentId: string) {
  const [talent, profile] = await Promise.all([
    db.select().from(talentProfiles).where(eq(talentProfiles.id, talentId)).limit(1),
    db.select().from(users).where(eq(users.id, userId)).limit(1),
  ]);

  const apps = await db
    .select({
      id: applications.id,
      status: applications.status,
      coverLetter: applications.coverLetter,
      createdAt: applications.createdAt,
      opportunityTitle: opportunities.title,
      opportunitySlug: opportunities.slug,
      opportunityId: opportunities.id,
      companyName: companies.name,
      companySlug: companies.slug,
      companyLogo: companies.logo,
      employmentType: opportunities.employmentType,
      location: opportunities.location,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .where(eq(applications.talentId, talentId))
    .orderBy(desc(applications.createdAt))
    .limit(8);

  const skillsList = await db
    .select({ name: skills.name, slug: skills.slug, level: talentSkills.level })
    .from(talentSkills)
    .innerJoin(skills, eq(skills.id, talentSkills.skillId))
    .where(eq(talentSkills.talentId, talentId));

  const portfolio = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.talentId, talentId))
    .limit(3);

  const experiencesCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(experiences)
    .where(eq(experiences.talentId, talentId));

  // Recommended opportunities (basic: same country, similar skills)
  const recommended = await db
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
    .limit(4);

  const appCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(applications)
    .where(eq(applications.talentId, talentId));

  return {
    talent: talent[0],
    profile: profile[0],
    applications: apps,
    skills: skillsList,
    portfolio,
    recommended,
    stats: {
      views: talent[0]?.viewsCount || 0,
      apps: appCount[0]?.count || 0,
      experiences: experiencesCount[0]?.count || 0,
      completion: talent[0]?.completionScore || 0,
    },
  };
}

const statusStyles: Record<string, { label: string; cls: string; icon: any }> = {
  SUBMITTED: { label: "Envoyée", cls: "chip-neutral", icon: Send },
  VIEWED: { label: "Vue", cls: "chip-warn", icon: Eye },
  SHORTLISTED: { label: "Présélection", cls: "chip-orange", icon: TrendingUp },
  INTERVIEW: { label: "Entretien", cls: "chip-orange", icon: MessageCircle },
  ACCEPTED: { label: "Acceptée", cls: "chip-success", icon: CheckCircle2 },
  REJECTED: { label: "Refusée", cls: "chip-neutral", icon: XCircle },
  WITHDRAWN: { label: "Retirée", cls: "chip-neutral", icon: XCircle },
};

export default async function TalentDashboardPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "TALENT" || !session.talent) {
    if (session.user.role === "COMPANY") redirect("/company/dashboard");
    redirect("/");
  }

  const data = await getDashboardData(session.user.id, session.talent.id);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] sticky top-20">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#f1f1f1]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white font-bold">
                  {data.profile?.firstName?.[0]}
                  {data.profile?.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {data.profile?.firstName} {data.profile?.lastName}
                  </div>
                  <div className="text-xs text-[#737373]">Talent</div>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard", active: true },
                  { icon: UserIcon, label: "Mon profil", href: "/dashboard/profile" },
                  { icon: FileText, label: "CV & Portfolio", href: "/dashboard/cv" },
                  { icon: Send, label: "Mes candidatures", href: "/dashboard/applications" },
                  { icon: Bookmark, label: "Favoris", href: "/dashboard/saved" },
                  { icon: MessageCircle, label: "Messages", href: "/dashboard/messages" },
                  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      item.active
                        ? "bg-[#f47b00]/10 text-[#c56200]"
                        : "text-[#525252] hover:bg-[#f1f1f1]"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}

                <div className="pt-3">
                  <LogoutButton className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left" />
                </div>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="space-y-6">
            <div>
              <h1 className="page-title">
                Bonjour {data.profile?.firstName} 👋
              </h1>
              <p className="text-[#525252] mt-1">
                Voici l&apos;état de votre présence OCD aujourd&apos;hui.
              </p>
            </div>

            {/* Profile completion */}
            <div className="bg-gradient-to-br from-[#f47b00] to-[#c56200] text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -right-20 bottom-0 w-60 h-60 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Votre profil</h2>
                    <p className="text-white/80 text-sm mt-1">
                      Complétez votre profil pour apparaître dans les recherches.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="stat">{data.stats.completion}%</div>
                    <div className="text-white/80 text-xs">complété</div>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${data.stats.completion}%` }}
                  />
                </div>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white text-[#0a0a0a] text-sm font-semibold hover:bg-white/90"
                >
                  Compléter mon profil
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Eye, label: "Vues profil", value: data.stats.views, color: "text-[#f47b00]" },
                { icon: Send, label: "Candidatures", value: data.stats.apps, color: "text-[#0a0a0a]" },
                { icon: Briefcase, label: "Expériences", value: data.stats.experiences, color: "text-emerald-600" },
                { icon: Award, label: "Compétences", value: data.skills.length, color: "text-purple-600" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl p-5 border border-[#e5e5e5]"
                >
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <div className="stat-sm">{s.value}</div>
                  <div className="text-xs text-[#737373] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* My status */}
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <h2 className="font-bold text-lg mb-4">Ma disponibilité</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="chip-orange text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#f47b00]" />
                  {availabilityLabel(data.talent?.availability || "OPEN_TO_OPPORTUNITIES")}
                </span>
                <span className="chip-neutral text-sm">
                  {experienceLevelLabel(data.talent?.experienceLevel || "ENTRY")}
                </span>
                <span className="chip-neutral text-sm">
                  {data.talent?.remotePreference}
                </span>
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-[#f47b00] font-medium hover:underline ml-auto"
                >
                  Modifier →
                </Link>
              </div>
            </div>

            {/* Recent applications */}
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Candidatures récentes</h2>
                <Link
                  href="/dashboard/applications"
                  className="text-sm text-[#f47b00] font-medium hover:underline"
                >
                  Tout voir
                </Link>
              </div>
              {data.applications.length === 0 ? (
                <div className="text-center py-10">
                  <Send className="w-10 h-10 text-[#e5e5e5] mx-auto" />
                  <p className="text-[#737373] mt-3">
                    Vous n&apos;avez pas encore postulé.
                  </p>
                  <Link
                    href="/opportunites"
                    className="text-[#f47b00] font-medium text-sm hover:underline"
                  >
                    Voir les opportunités →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f1f1]">
                  {data.applications.map((a) => {
                    const status = statusStyles[a.status] || statusStyles.SUBMITTED;
                    const SIcon = status.icon;
                    return (
                      <div key={a.id} className="py-4 flex items-center gap-3">
                        <CompanyLogo
                          name={a.companyName}
                          logo={a.companyLogo}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/opportunites/${a.opportunitySlug}`}
                            className="font-medium hover:text-[#f47b00] line-clamp-1"
                          >
                            {a.opportunityTitle}
                          </Link>
                          <div className="text-xs text-[#737373]">
                            {a.companyName} · {timeAgo(a.createdAt)}
                          </div>
                        </div>
                        <span className={`${status.cls} text-xs`}>
                          <SIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#f47b00]" />
                Opportunités pour vous
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {data.recommended.map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunites/${o.slug}`}
                    className="bg-white rounded-2xl p-5 border border-[#e5e5e5] hover:border-[#f47b00] transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <CompanyLogo
                        name={o.companyName}
                        logo={o.companyLogo}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-[#737373]">
                          {o.companyName}
                        </div>
                        <h3 className="font-semibold line-clamp-1 group-hover:text-[#f47b00]">
                          {o.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#525252] line-clamp-2">
                      {o.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
