import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, talentProfiles, companies, opportunities, applications, countries } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { Users, Building2, Briefcase, Send, Globe2, TrendingUp } from "lucide-react";

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
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className="stat-sm">
                {(s.value || 0).toLocaleString("fr-FR")}
              </div>
              <div className="text-xs text-[#737373] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5e5e5]">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#f47b00]" />
            Top pays
          </h2>
          <div className="space-y-2">
            {topCountries.map((c, i) => (
              <div
                key={c.iso2}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa]"
              >
                <span className="text-sm text-[#737373] font-mono w-6">
                  #{i + 1}
                </span>
                <span className="text-2xl">{c.flag}</span>
                <span className="font-medium flex-1">{c.nameFr}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#737373]">
                    {c.talentsCount} talents
                  </span>
                  <span className="text-[#737373]">
                    {c.companiesCount} entreprises
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
