import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { opportunities, companies } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { CompanySidebar } from "@/components/CompanySidebar";
import { Plus, Briefcase, Eye, Send, ArrowRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompanyOpportunitiesPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) redirect("/");

  const opps = await db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      status: opportunities.status,
      publishedAt: opportunities.publishedAt,
      viewsCount: opportunities.viewsCount,
      employmentType: opportunities.employmentType,
      location: opportunities.location,
      applicationsCount: sql<number>`(SELECT COUNT(*)::int FROM applications WHERE opportunity_id = ${opportunities.id})`,
    })
    .from(opportunities)
    .where(eq(opportunities.companyId, session.company.id))
    .orderBy(desc(opportunities.publishedAt));

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
            active="opportunities"
            companyName={company?.name || ""}
            companyLogo={company?.logo || null}
          />
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="page-title">
                  Mes opportunités
                </h1>
                <p className="text-[#525252] mt-1">
                  {opps.length} opportunité{opps.length > 1 ? "s" : ""} publiée
                  {opps.length > 1 ? "s" : ""}.
                </p>
              </div>
              <Link href="/company/opportunities/new" className="btn-primary">
                <Plus className="w-4 h-4" />
                Nouvelle opportunité
              </Link>
            </div>

            {opps.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e5e5]">
                <Briefcase className="w-12 h-12 text-[#e5e5e5] mx-auto" />
                <h3 className="font-bold text-lg mt-4">
                  Pas encore d&apos;opportunité
                </h3>
                <p className="text-[#737373] mt-2">
                  Publiez votre première offre pour recevoir des candidatures.
                </p>
                <Link
                  href="/company/opportunities/new"
                  className="btn-primary mt-6"
                >
                  <Plus className="w-4 h-4" />
                  Créer ma première opportunité
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {opps.map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunites/${o.slug}`}
                    className="block bg-white rounded-2xl p-5 border border-[#e5e5e5] hover:border-[#f47b00] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{o.title}</h3>
                        <div className="text-sm text-[#737373] mt-1 flex items-center gap-3 flex-wrap">
                          <span>{o.location}</span>
                          {o.publishedAt && <span>· Publiée {timeAgo(o.publishedAt)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span
                          className={`chip text-xs ${
                            o.status === "PUBLISHED"
                              ? "chip-success"
                              : "chip-neutral"
                          }`}
                        >
                          {o.status === "PUBLISHED" ? "Publiée" : o.status}
                        </span>
                        <span className="flex items-center gap-1 text-[#737373]">
                          <Send className="w-3.5 h-3.5" />
                          {o.applicationsCount}
                        </span>
                        <span className="flex items-center gap-1 text-[#737373]">
                          <Eye className="w-3.5 h-3.5" />
                          {o.viewsCount}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#a3a3a3]" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
