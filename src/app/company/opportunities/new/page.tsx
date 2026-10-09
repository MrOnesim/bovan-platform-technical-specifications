import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { countries, skills } from "@/db/schema";
import { NewOpportunityForm } from "@/components/NewOpportunityForm";

export const dynamic = "force-dynamic";

export default async function NewOpportunityPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) {
    if (session.user.role === "TALENT") redirect("/dashboard");
    redirect("/");
  }

  const [allCountries, allSkills] = await Promise.all([
    db.select().from(countries).orderBy(countries.nameFr),
    db.select().from(skills).orderBy(skills.name),
  ]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8 max-w-3xl">
        <Link
          href="/company/dashboard"
          className="text-sm text-[#737373] hover:text-[#0a0a0a] inline-flex items-center gap-1 mb-6"
        >
          ← Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="page-title">
            Nouvelle opportunité
          </h1>
          <p className="text-[#525252] mt-1">
            Décrivez le poste et touchez les meilleurs talents d&apos;Afrique.
          </p>
        </div>

        <NewOpportunityForm
          countries={allCountries}
          skills={allSkills}
        />
      </div>
    </div>
  );
}
