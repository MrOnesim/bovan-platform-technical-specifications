import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import {
  applications,
  opportunities,
  companies,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Send, ArrowRight, LayoutDashboard, User as UserIcon, FileText, MessageCircle, Settings, Bookmark, TrendingUp, Eye, CheckCircle2, XCircle } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyCard";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { label: string; cls: string; icon: any }> = {
  SUBMITTED: { label: "Envoyée", cls: "chip-neutral", icon: Send },
  VIEWED: { label: "Vue par le recruteur", cls: "chip-warn", icon: Eye },
  SHORTLISTED: { label: "Présélection", cls: "chip-orange", icon: TrendingUp },
  INTERVIEW: { label: "Entretien", cls: "chip-orange", icon: MessageCircle },
  ACCEPTED: { label: "Acceptée", cls: "chip-success", icon: CheckCircle2 },
  REJECTED: { label: "Refusée", cls: "chip-neutral", icon: XCircle },
  WITHDRAWN: { label: "Retirée", cls: "chip-neutral", icon: XCircle },
};

export default async function ApplicationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "TALENT" || !session.talent) redirect("/");

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
    .where(eq(applications.talentId, session.talent.id))
    .orderBy(desc(applications.createdAt));

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <aside className="space-y-2">
            <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] sticky top-20">
              <nav className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard" },
                  { icon: UserIcon, label: "Mon profil", href: "/dashboard/profile" },
                  { icon: FileText, label: "CV & Portfolio", href: "/dashboard/cv" },
                  { icon: Send, label: "Mes candidatures", href: "/dashboard/applications", active: true },
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
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            <div>
              <h1 className="page-title">
                Mes candidatures
              </h1>
              <p className="text-[#525252] mt-1">
                {apps.length} candidature{apps.length > 1 ? "s" : ""} envoyée{apps.length > 1 ? "s" : ""}.
              </p>
            </div>

            {apps.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e5e5]">
                <Send className="w-12 h-12 text-[#e5e5e5] mx-auto" />
                <h3 className="font-bold text-lg mt-4">
                  Vous n&apos;avez pas encore postulé
                </h3>
                <p className="text-[#737373] mt-2">
                  Découvrez les opportunités disponibles sur OCD.
                </p>
                <Link href="/opportunites" className="btn-primary mt-6">
                  Voir les opportunités
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {apps.map((a) => {
                  const status = statusStyles[a.status] || statusStyles.SUBMITTED;
                  const SIcon = status.icon;
                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-2xl p-5 border border-[#e5e5e5] hover:border-[#f47b00] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <CompanyLogo
                          name={a.companyName}
                          logo={a.companyLogo}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <Link
                                href={`/opportunites/${a.opportunitySlug}`}
                                className="font-semibold text-lg hover:text-[#f47b00]"
                              >
                                {a.opportunityTitle}
                              </Link>
                              <div className="text-sm text-[#737373]">
                                {a.companyName} · {a.location} ·{" "}
                                {timeAgo(a.createdAt)}
                              </div>
                            </div>
                            <span className={`${status.cls} text-xs`}>
                              <SIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          {a.coverLetter && (
                            <p className="text-sm text-[#525252] mt-3 line-clamp-2">
                              {a.coverLetter}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
