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
  inquiries,
} from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { Users, Building2, Briefcase, Send, Globe2, TrendingUp, Star, Inbox } from "lucide-react";
import { InquiryStatusForm } from "@/components/InquiryStatusForm";


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

  const recentInquiries = await db
    .select({
      id: inquiries.id,
      name: inquiries.name,
      business: inquiries.business,
      email: inquiries.email,
      phone: inquiries.phone,
      packageLabel: inquiries.packageLabel,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
    })
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt))
    .limit(30);

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
            <Inbox aria-hidden="true" className="w-5 h-5 text-[#f47b00]" />
            Demandes de réservation
            <span className="text-sm font-normal text-[#737373]">
              ({recentInquiries.length} récente{recentInquiries.length > 1 ? "s" : ""})
            </span>
          </h2>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-[#737373]">
              Aucune demande enregistrée pour le moment.
            </p>
          ) : (
            <ul className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="rounded-xl border border-[#f1f1f1] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{inquiry.name}</h3>
                      <p className="text-sm text-[#525252]">{inquiry.business}</p>
                      <p className="mt-1 text-xs text-[#737373]">
                        {new Date(inquiry.createdAt).toLocaleString("fr-FR")}
                      </p>
                      <div className="mt-2">
                        <InquiryStatusForm id={inquiry.id} status={inquiry.status} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="font-medium text-[#b85100] hover:underline"
                      >
                        {inquiry.email}
                      </a>
                      {inquiry.phone && (
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="text-[#b85100] hover:underline"
                        >
                          {inquiry.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#525252]">
                    <span className="font-medium">Formule : </span>
                    {inquiry.packageLabel || "À discuter"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#525252]">
                    {inquiry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
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


      </div>
    </div>
  );
}
