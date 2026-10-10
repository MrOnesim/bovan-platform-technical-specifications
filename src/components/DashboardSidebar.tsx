import Link from "next/link";
import {
  LayoutDashboard,
  User as UserIcon,
  FileText,
  Send,
  Bookmark,
  MessageCircle,
  Settings,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface Props {
  active: string;
}

const items = [
  { key: "dashboard", icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard" },
  { key: "profile", icon: UserIcon, label: "Mon profil", href: "/dashboard/profile" },
  { key: "cv", icon: FileText, label: "CV & Portfolio", href: "/dashboard/cv" },
  { key: "applications", icon: Send, label: "Mes candidatures", href: "/dashboard/applications" },
  { key: "saved", icon: Bookmark, label: "Favoris", href: "/dashboard/saved" },
  { key: "messages", icon: MessageCircle, label: "Messages", href: "/dashboard/messages" },
  { key: "settings", icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

export function DashboardSidebar({ active }: Props) {
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
