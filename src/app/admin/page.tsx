import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  talentProfiles,
  companies,
  opportunities,
  applications,
  countries,
  reviews,
} from "@/db/schema";
import { sql, desc, eq, and } from "drizzle-orm";
import { Users, Building2, Briefcase, Send, Globe2, TrendingUp, Star, Check, X } from "lucide-react";
import { ReviewModerationButtons } from "@/components/ReviewModerationButtons";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [stats] = await db
    .select({
      users: sql<number>`(SELECT COUNT(*)::int FROM users)`,
      talents: sql<number>`(SELECT COUNT(*)::int FROM talent_profiles)`,
      companies: sql<number>`(SELECT COUNT(*)::int FROM companies)`,
      opportunities: sql<number>`(SELECT COUNT(*)::int FROM opportunities)`,
      applications: sql<number>`(SELECT COUNT(*)::int FROM applications)`,
      countries: sql<number>`(SELECT COUNT(*)::int FROM countries)`,
    })
    .from(users);

  const topCountries = await db
    .select({
      iso2: countries.iso2,
      nameFr: countries.nameFr,
      flag: countries.flag,
      talentsCount: sql<number>`(SELECT COUNT(*)::int FROM talent_profiles tp JOIN users u ON u.id = tp.user_id WHERE u.country_id = countries.id)`,
      companiesCount: sql<number>`(SELECT COUNT(*)::int FROM companies c WHERE c.country_id = countries.id)`,
    })
    .from(countries)
    .orderBy(desc(sql`(
      (SELECT COUNT(*) FROM talent_profiles tp JOIN users u ON u.id = tp.user_id WHERE u.country_id = countries.id) +
      (SELECT COUNT(*) FROM companies c WHERE c.country_id = countries.id)
    )`))
    .limit(10);

  const pendingReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      targetType: reviews.targetType,
      targetId: reviews.targetId,
      createdAt: reviews.createdAt,
      authorFirstName: users.firstName,
      authorLastName: users.lastName,
      authorEmail: users.email,
      authorRole: users.role,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .where(eq(reviews.status, "PENDING"))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div>
          <h1 className="page-title">
            Tableau de bord administrateur
          </h1>
          <p className="text-[#525252] mt-1">
            Vue d&apos;ensemble de la plateforme OCD.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
          {[
            { icon: Users, label: "Utilisateurs", value: stats?.users || 0, color: "text-[#f47b00]" },
            { icon: Users, label: "Talents", value: stats?.talents || 0, color: "text-emerald-600" },
            { icon: Building2, label: "Entreprises", value: stats?.companies || 0, color: "text-blue-600" },
            { icon: Briefcase, label: "Opportunités", value: stats?.opportunities || 0, color: "text-purple-600" },
            { icon: Send, label: "Candidatures", value: stats?.applications || 0, color: "text-amber-600" },
            { icon: Globe2, label: "Pays", value: stats?.countries || 0, color: "text-pink-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-5 border border-[#e5e5e5]"
            >
              <s.icon aria-hidden="true" className={`w-5 h-5 ${s.color} mb-2`} />
              <div className="stat-sm">
                {(s.value || 0).toLocaleString("fr-FR")}
              </div>
              <div className="text-xs text-[#737373] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5e5e5]">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp aria-hidden="true" className="w-5 h-5 text-[#f47b00]" />
            Top pays
          </h2>
          <table className="w-full text-sm">
            <caption className="sr-only">Classement des pays par activité</caption>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#737373]">
                <th scope="col" className="py-2 pr-3 font-medium w-10">Rang</th>
                <th scope="col" className="py-2 pr-3 font-medium">Pays</th>
                <th scope="col" className="py-2 pr-3 font-medium text-right">Talents</th>
                <th scope="col" className="py-2 font-medium text-right">Entreprises</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.map((c, i) => (
                <tr key={c.iso2} className="border-t border-[#f1f1f1] hover:bg-[#fafafa]">
                  <td className="py-3 pr-3 text-[#737373] font-mono">#{i + 1}</td>
                  <td className="py-3 pr-3 font-medium">
                    <span aria-hidden="true" className="mr-2 text-lg align-middle">{c.flag}</span>
                    {c.nameFr}
                  </td>
                  <td className="py-3 pr-3 text-right text-[#737373]">{c.talentsCount}</td>
                  <td className="py-3 text-right text-[#737373]">{c.companiesCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5e5e5]">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star aria-hidden="true" className="w-5 h-5 text-[#f47b00]" />
            Modération des avis
            <span className="text-sm font-normal text-[#737373]">
              ({pendingReviews.length} en attente)
            </span>
          </h2>
          {pendingReviews.length === 0 ? (
            <p className="text-sm text-[#737373]">
              Aucun avis en attente de validation.
            </p>
          ) : (
            <ul className="space-y-4">
              {pendingReviews.map((r) => (
                <li
                  key={r.id}
                  className="border border-[#f1f1f1] rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {r.authorFirstName || ""} {r.authorLastName || ""}
                      </span>
                      <span className="chip text-xs">
                        {r.authorRole === "COMPANY" ? "Entreprise" : "Talent"}
                      </span>
                      <span className="chip text-xs">
                        Avis sur {r.targetType === "TALENT" ? "un talent" : "une entreprise"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className={`w-4 h-4 ${
                            i <= r.rating
                              ? "text-[#f47b00] fill-[#f47b00]"
                              : "text-[#d4d4d4]"
                          }`}
                        />
                      ))}
                      <span className="sr-only">Note : {r.rating} sur 5</span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-[#525252] mt-2 whitespace-pre-line">
                        {r.comment}
                      </p>
                    )}
                    <p className="text-xs text-[#737373] mt-2">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                      {r.authorEmail}
                    </p>
                  </div>
                  <ReviewModerationButtons reviewId={r.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
