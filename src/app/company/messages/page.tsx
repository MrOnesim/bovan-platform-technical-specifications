import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompanySidebar } from "@/components/CompanySidebar";
import { MessagingUI } from "@/components/MessagingUI";

export const dynamic = "force-dynamic";

export default async function CompanyMessagesPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "COMPANY" || !session.company) redirect("/");

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.company.id))
    .limit(1);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <CompanySidebar 
            active="messages" 
            companyName={company?.name || ""} 
            companyLogo={company?.logo || null} 
          />
          <div className="space-y-6">
            <div>
              <h1 className="page-title">Messages</h1>
              <p className="text-[#525252] mt-1">Vos échanges avec les talents africains.</p>
            </div>
            <MessagingUI currentUserId={session.user.id} userRole="COMPANY" />
          </div>
        </div>
      </div>
    </div>
  );
}
