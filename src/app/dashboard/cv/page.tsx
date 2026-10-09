import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ComingSoon } from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export default async function CVPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "TALENT" || !session.talent) redirect("/");

  return (
    <ComingSoon
      title="CV & Portfolio"
      description="Importez votre CV, mettez en avant vos projets."
      sidebar={<DashboardSidebar active="cv" />}
      backHref="/dashboard"
      backLabel="Tableau de bord"
    />
  );
}
