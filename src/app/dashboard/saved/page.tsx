import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ComingSoon } from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "TALENT" || !session.talent) redirect("/");

  return (
    <ComingSoon
      title="Mes favoris"
      description="Retrouvez vos opportunités et entreprises préférées."
      sidebar={<DashboardSidebar active="saved" />}
      backHref="/dashboard"
      backLabel="Tableau de bord"
    />
  );
}
