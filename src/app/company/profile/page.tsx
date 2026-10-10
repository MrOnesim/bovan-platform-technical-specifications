import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { companies, countries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompanySidebar, CompanyLogo } from "@/components/CompanySidebar";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";

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
      countryId: companies.countryId,
    })
    .from(companies)
    .leftJoin(countries, eq(countries.id, companies.countryId))
    .where(eq(companies.id, session.company.id))
    .limit(1);

  const allCountries = await db.select().from(countries).orderBy(countries.nameFr);

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
            <h1 className="page-title">Mon entreprise</h1>
            <p className="text-[#525252] mt-1">Gérez les informations visibles par les talents.</p>
          </div>

          <CompanyProfileForm company={company} countries={allCountries || []} />
        </div>
        </div>
      </div>
    </div>
  );
}
