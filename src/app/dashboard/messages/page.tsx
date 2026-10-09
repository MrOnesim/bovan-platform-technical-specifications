import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MessagingUI } from "@/components/MessagingUI";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "TALENT" || !session.talent) redirect("/");

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <DashboardSidebar active="messages" />
          <div className="space-y-6">
            <div>
              <h1 className="page-title">Messages</h1>
              <p className="text-[#525252] mt-1">Vos échanges avec les entreprises du continent.</p>
            </div>
            <MessagingUI currentUserId={session.user.id} userRole="TALENT" />
          </div>
        </div>
      </div>
    </div>
  );
}
