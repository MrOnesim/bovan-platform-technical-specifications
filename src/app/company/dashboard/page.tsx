import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import {
  companies,
  opportunities,
  applications,
  talentProfiles,
  users,
  countries,
} from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  Briefcase,
  Users,
  Send,
  Eye,
  Star,
  Plus,
  ArrowRight,
  Building2,
  LayoutDashboard,
  FileText,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyCard";
import { LogoutButton } from "@/components/LogoutButton";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCompanyDashboard(companyId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  const opps = await db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      status: opportunities.status,
      publishedAt: opportunities.publishedAt,
      viewsCount: opportunities.viewsCount,
      applicationsCount: sql<number>`(SELECT COUNT(*)::int FROM applications WHERE opportunity_id = ${opportunities.id})`,
    })
    .from(opportunities)
    .where(eq(opportunities.companyId, companyId))
    .orderBy(desc(opportunities.publishedAt))
    .limit(6);

  const recentApps = await db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      opportunityTitle: opportunities.title,
      opportunitySlug: opportunities.slug,
      talentName: sql<string>`${users.firstName} || ' ' || COALESCE(${users.lastName}, '')`,
      talentSlug: talentProfiles.slug,
      talentHeadline: talentProfiles.headline,
      talentCountry: countries.nameFr,
      talentFlag: countries.flag,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(talentProfiles, eq(talentProfiles.id, applications.talentId))
    .innerJoin(users, eq(users.id, talentProfiles.userId))
    .leftJoin(countries, eq(countries.id, users.countryId))
    .where(eq(opportunities.companyId, companyId))
    .orderBy(desc(applications.createdAt))
    .limit(6);

  // Featured spontaneous talents
  const talents = await db
    .select({
      id: talentProfiles.id,
      slug: talentProfiles.slug,
      headline: talentProfiles.headline,
      firstName: users.firstName,
      lastName: users.lastName,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
      availability: talentProfiles.availability,
    })
    .from(talentProfiles)
    .innerJoin(users, eq(users.id, talentProfiles.userId))
    .leftJoin(countries, eq(countries.id, users.countryId))
    .where(eq(talentProfiles.isSpontaneous, true))
    .orderBy(desc(talentProfiles.viewsCount))
    .limit(4);

  const totals = await db
    .select({
      opps: sql<number>`(SELECT COUNT(*)::int FROM opportunities WHERE company_id = ${companyId})`,
      apps: sql<number>`(SELECT COUNT(*)::int FROM applications a JOIN opportunities o ON o.id = a.opportunity_id WHERE o.company_id = ${companyId})`,
      views: sql<number>`(SELECT COALESCE(SUM(views_count), 0)::int FROM opportunities WHERE company_id = ${companyId})`,
    })
    .from(companies)
    .where(eq(companies.id, companyId));

  return { company, opps, recentApps, talents, totals: totals[0] };
}

const statusStyles: Record<string, { label: string; cls: string; icon: any }> = {
  SUBMITTED: { label: "Envoyée", cls: "chip-neutral", icon: Send },
  VIEWED: { label: "Vue", cls: "chip-warn", icon: Eye },
  SHORTLISTED: { label: "Présélection", cls: "chip-orange", icon: TrendingUp },
  INTERVIEW: { label: "Entretien", cls: "chip-orange", icon: MessageCircle },
  ACCEPTED: { label: "Acceptée", cls: "chip-success", icon: CheckCircle2 },
  REJECTED: { label: "Refusée", cls: "chip-neutral", icon: XCircle },
};

export default async function CompanyDashboardPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) {
    if (session.user.role === "TALENT") redirect("/dashboard");
    redirect("/");
  }

  const data = await getCompanyDashboard(session.company.id);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <aside className="space-y-2">
            <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] sticky top-20">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#f1f1f1]">
                <CompanyLogo
                  name={data.company?.name || ""}
                  logo={data.company?.logo || null}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {data.company?.name}
                  </div>
                  <div className="text-xs text-[#737373]">Entreprise</div>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/company/dashboard", active: true },
                  { icon: Building2, label: "Mon entreprise", href: "/company/profile" },
                  { icon: Briefcase, label: "Mes opportunités", href: "/company/opportunities" },
                  { icon: Send, label: "Candidatures reçues", href: "/company/applications" },
                  { icon: Users, label: "Chercher des talents", href: "/company/talents" },
                  { icon: MessageCircle, label: "Messages", href: "/company/messages" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      item.active
                        ? "bg-[#f47b00]/10 text-[#c56200]"
                        : "text-[#525252] hover:bg-[#f1f1f1]"
                    }`}
                  >
                    <item.icon aria-hidden="true" className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}

                <div className="pt-3">
                  <LogoutButton className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left" />
                </div>
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            <div>
              <h1 className="page-title">
                Bonjour {data.company?.name} 👋
              </h1>
              <p className="text-[#525252] mt-1">
                Pilotez vos recrutements et découvrez les talents qui se montrent.
              </p>
            </div>

            {/* CTA New opportunity */}
            <div className="bg-linear-to-br from-[#f47b00] to-[#c56200] text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Publier une opportunité</h2>
                  <p className="text-white/80 text-sm mt-1">
                    Touchez les meilleurs talents d&apos;Afrique en quelques clics.
                  </p>
                </div>
                <Link
                  href="/company/opportunities/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white font-semibold hover:bg-[#262626]"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle opportunité
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: Briefcase, label: "Offres publiées", value: data.totals?.opps || 0, color: "text-[#f47b00]" },
                { icon: Send, label: "Candidatures reçues", value: data.totals?.apps || 0, color: "text-[#0a0a0a]" },
                { icon: Eye, label: "Vues totales", value: data.totals?.views || 0, color: "text-emerald-600" },
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

            {/* Recent opportunities */}
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Mes opportunités</h2>
                <Link
                  href="/company/opportunities"
                  className="text-sm text-[#f47b00] font-medium hover:underline"
                >
                  Tout voir
                </Link>
              </div>
              {data.opps.length === 0 ? (
                <div className="text-center py-10">
                  <Briefcase className="w-10 h-10 text-[#e5e5e5] mx-auto" />
                  <p className="text-[#737373] mt-3">
                    Vous n&apos;avez pas encore publié d&apos;opportunité.
                  </p>
                  <Link
                    href="/company/opportunities/new"
                    className="text-[#f47b00] font-medium text-sm hover:underline"
                  >
                    Publier ma première offre →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f1f1]">
                  {data.opps.map((o) => (
                    <div key={o.id} className="py-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/opportunites/${o.slug}`}
                          className="font-medium hover:text-[#f47b00] line-clamp-1"
                        >
                          {o.title}
                        </Link>
                        <div className="text-xs text-[#737373]">
                          {o.applicationsCount} candidature
                          {o.applicationsCount > 1 ? "s" : ""} · {o.viewsCount} vues
                        </div>
                      </div>
                      <span
                        className={`chip text-xs ${
                          o.status === "PUBLISHED"
                            ? "chip-success"
                            : "chip-neutral"
                        }`}
                      >
                        {o.status === "PUBLISHED" ? "Publiée" : o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent applications */}
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Candidatures récentes</h2>
                <Link
                  href="/company/applications"
                  className="text-sm text-[#f47b00] font-medium hover:underline"
                >
                  Tout voir
                </Link>
              </div>
              {data.recentApps.length === 0 ? (
                <div className="text-center py-10">
                  <Send className="w-10 h-10 text-[#e5e5e5] mx-auto" />
                  <p className="text-[#737373] mt-3">
                    Aucune candidature pour le moment.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f1f1]">
                  {data.recentApps.map((a) => {
                    const status = statusStyles[a.status] || statusStyles.SUBMITTED;
                    const SIcon = status.icon;
                    return (
                      <div key={a.id} className="py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {a.talentName
                            .split(" ")
                            .map((p) => p[0])
                            .join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/talents/${a.talentSlug}`}
                            className="font-medium hover:text-[#f47b00] line-clamp-1"
                          >
                            {a.talentName}
                          </Link>
                          <div className="text-xs text-[#737373] line-clamp-1">
                            {a.talentHeadline} · {a.talentFlag} {a.talentCountry} ·{" "}
                            {timeAgo(a.createdAt)}
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

            {/* Spontaneous talents */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#f47b00]" />
                  Talents spontanés
                </h2>
                <Link
                  href="/company/talents"
                  className="text-sm text-[#f47b00] font-medium hover:underline"
                >
                  Explorer tous
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.talents.map((t) => (
                  <Link
                    key={t.id}
                    href={`/talents/${t.slug}`}
                    className="bg-white rounded-2xl p-4 border border-[#e5e5e5] hover:border-[#f47b00] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white text-xs font-bold">
                        {t.firstName?.[0]}
                        {t.lastName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">
                          {t.firstName} {t.lastName}
                        </div>
                        <div className="text-xs text-[#737373] truncate">
                          {t.countryFlag} {t.countryName}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#525252] line-clamp-2">
                      {t.headline}
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
