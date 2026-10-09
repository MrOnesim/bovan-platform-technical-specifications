import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { talentProfiles, talentSkills, skills, countries, cities, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "TALENT" || !session.talent) redirect("/");

  const [talent] = await db
    .select()
    .from(talentProfiles)
    .where(eq(talentProfiles.id, session.talent.id))
    .limit(1);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const [mySkills, allCountries, allSkills] = await Promise.all([
    db
      .select({ name: skills.name, slug: skills.slug })
      .from(talentSkills)
      .innerJoin(skills, eq(skills.id, talentSkills.skillId))
      .where(eq(talentSkills.talentId, session.talent.id)),
    db.select().from(countries).orderBy(countries.nameFr),
    db.select().from(skills).orderBy(skills.name),
  ]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8 max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm text-[#737373] hover:text-[#0a0a0a] inline-flex items-center gap-1 mb-6"
        >
          ← Tableau de bord
        </Link>
        <h1 className="page-title">Mon profil</h1>
        <p className="text-[#525252] mt-1 mb-8">
          Rendez votre profil attractif pour les recruteurs.
        </p>

        <ProfileForm
          talent={talent}
          user={user}
          countries={allCountries}
          allSkills={allSkills}
          initialSkills={mySkills.map((s) => s.name)}
        />
      </div>
    </div>
  );
}
