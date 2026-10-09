import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { companies, countries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompanySidebar, CompanyLogo } from "@/components/CompanySidebar";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) redirect("/");

  const [company] = await db
    .select({
      name: companies.name,
      slug: companies.slug,
      description: companies.description,
      industry: companies.industry,
      website: companies.website,
      email: companies.email,
      phone: companies.phone,
      logo: companies.logo,
      employeeCount: companies.employeeCount,
      foundedYear: companies.foundedYear,
      verification: companies.verification,
      countryName: countries.nameFr,
      countryFlag: countries.flag,
    })
    .from(companies)
    .leftJoin(countries, eq(countries.id, companies.countryId))
    .where(eq(companies.id, session.company.id))
    .limit(1);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <CompanySidebar
            active="profile"
            companyName={company?.name || ""}
            companyLogo={company?.logo || null}
          />
          <div className="space-y-6">
            <div>
              <h1 className="page-title">
                Mon entreprise
              </h1>
              <p className="text-[#525252] mt-1">
                Les informations visibles par les talents.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <div className="flex items-start gap-4">
                <CompanyLogo
                  name={company?.name || ""}
                  logo={company?.logo || null}
                  size="lg"
                />
                <div>
                  <h2 className="text-2xl font-bold">{company?.name}</h2>
                  <p className="text-[#525252] mt-1">
                    {company?.industry}
                    {company?.countryName && (
                      <span> · {company?.countryFlag} {company?.countryName}</span>
                    )}
                  </p>
                  {company?.verification === "VERIFIED" && (
                    <span className="chip-success text-xs mt-2 inline-flex">
                      ✓ Entreprise vérifiée
                    </span>
                  )}
                </div>
              </div>
              {company?.description && (
                <p className="text-[#404040] mt-6 leading-relaxed">
                  {company.description}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
              <h3 className="font-bold mb-4">Informations</h3>
              <dl className="grid md:grid-cols-2 gap-4 text-sm">
                {company?.website && (
                  <div>
                    <dt className="text-[#737373]">Site web</dt>
                    <dd>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f47b00] hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                )}
                {company?.email && (
                  <div>
                    <dt className="text-[#737373]">Email</dt>
                    <dd>{company.email}</dd>
                  </div>
                )}
                {company?.employeeCount && (
                  <div>
                    <dt className="text-[#737373]">Effectif</dt>
                    <dd>{company.employeeCount} employés</dd>
                  </div>
                )}
                {company?.foundedYear && (
                  <div>
                    <dt className="text-[#737373]">Fondée en</dt>
                    <dd>{company.foundedYear}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-[#fff8ee] border border-[#f47b00]/20 rounded-2xl p-6 text-sm text-[#525252]">
              <p>
                <strong className="text-[#0a0a0a]">Note :</strong> la
                modification des informations de l&apos;entreprise sera
                disponible très prochainement. Pour toute modification urgente,
                contactez <a href="mailto:hello@bovan.africa" className="text-[#f47b00] underline">hello@bovan.africa</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
