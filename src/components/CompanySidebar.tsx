import Link from "next/link";
import { LayoutDashboard, Building2, Briefcase, Send, Users, MessageCircle } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface Props {
  active: string;
  companyName: string;
  companyLogo: string | null;
}

const items = [
  { key: "dashboard", icon: LayoutDashboard, label: "Vue d'ensemble", href: "/company/dashboard" },
  { key: "profile", icon: Building2, label: "Mon entreprise", href: "/company/profile" },
  { key: "opportunities", icon: Briefcase, label: "Mes opportunités", href: "/company/opportunities" },
  { key: "applications", icon: Send, label: "Candidatures reçues", href: "/company/applications" },
  { key: "talents", icon: Users, label: "Chercher des talents", href: "/company/talents" },
  { key: "messages", icon: MessageCircle, label: "Messages", href: "/company/messages" },
];

export { CompanyLogo } from "./CompanyCard";

export function CompanySidebar({ active, companyName, companyLogo }: Props) {
  return (
    <aside className="space-y-2">
      <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] sticky top-20">
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                active === item.key
                  ? "bg-[#f47b00]/10 text-[#c56200]"
                  : "text-[#525252] hover:bg-[#f1f1f1]"
              }`}
            >
              <item.icon aria-hidden="true" className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <div className="pt-3">
            <LogoutButton className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left" />
          </div>
        </nav>
      </div>
    </aside>
  );
}
