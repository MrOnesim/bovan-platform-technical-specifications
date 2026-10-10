import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { companies, applications, opportunities, talentProfiles, users, countries } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { CompanySidebar } from "@/components/CompanySidebar";
import { Send, TrendingUp, Eye, CheckCircle2, XCircle, MessageCircle, Briefcase } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { label: string; cls: string; icon: any }> = {
  SUBMITTED: { label: "Envoyée", cls: "chip-neutral", icon: Send },
  VIEWED: { label: "Vue", cls: "chip-warn", icon: Eye },
  SHORTLISTED: { label: "Présélection", cls: "chip-orange", icon: TrendingUp },
  INTERVIEW: { label: "Entretien", cls: "chip-orange", icon: MessageCircle },
  ACCEPTED: { label: "Acceptée", cls: "chip-success", icon: CheckCircle2 },
  REJECTED: { label: "Refusée", cls: "chip-neutral", icon: XCircle },
};

export default async function CompanyApplicationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) redirect("/");

  const apps = await db
    .select({
      id: applications.id,
      status: applications.status,
      coverLetter: applications.coverLetter,
      createdAt: applications.createdAt,
      opportunityTitle: opportunities.title,
      opportunitySlug: opportunities.slug,
      opportunityId: opportunities.id,
      talentId: talentProfiles.id,
      talentSlug: talentProfiles.slug,
      talentHeadline: talentProfiles.headline,
      talentAvailability: talentProfiles.availability,
      firstName: users.firstName,
      lastName: users.lastName,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(talentProfiles, eq(talentProfiles.id, applications.talentId))
    .innerJoin(users, eq(users.id, talentProfiles.userId))
    .leftJoin(countries, eq(countries.id, users.countryId))
    .where(eq(opportunities.companyId, session.company.id))
    .orderBy(desc(applications.createdAt));

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.company.id))
    .limit(1);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <CompanySidebar
            active="applications"
            companyName={company?.name || ""}
            companyLogo={company?.logo || null}
          />
          <div className="space-y-6">
            <div>
              <h1 className="page-title">
                Candidatures reçues
              </h1>
              <p className="text-[#525252] mt-1">
                {apps.length} candidature{apps.length > 1 ? "s" : ""} au total.
              </p>
            </div>

            {apps.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e5e5]">
                <Send className="w-12 h-12 text-[#e5e5e5] mx-auto" />
                <h3 className="font-bold text-lg mt-4">
                  Aucune candidature pour l&apos;instant
                </h3>
                <p className="text-[#737373] mt-2">
                  Publiez des opportunités pour recevoir des candidatures.
                </p>
                <Link
                  href="/company/opportunities/new"
                  className="btn-primary mt-6"
                >
                  <Briefcase className="w-4 h-4" />
                  Publier une opportunité
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
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white font-bold shrink-0">
                          {a.firstName?.[0]}
                          {a.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <Link
                                href={`/talents/${a.talentSlug}`}
                                className="font-semibold text-lg hover:text-[#f47b00]"
                              >
                                {a.firstName} {a.lastName}
                              </Link>
                              <div className="text-sm text-[#737373]">
                                {a.talentHeadline} · {a.countryFlag} {a.countryName}
                              </div>
                              <Link
                                href={`/opportunites/${a.opportunitySlug}`}
                                className="text-sm text-[#f47b00] hover:underline inline-flex items-center gap-1 mt-1"
                              >
                                Pour : {a.opportunityTitle} · {timeAgo(a.createdAt)}
                              </Link>
                            </div>
                            <span className={`${status.cls} text-xs`}>
                              <SIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          {a.coverLetter && (
                            <p className="text-sm text-[#525252] mt-3 line-clamp-2">
                              &quot;{a.coverLetter}&quot;
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
