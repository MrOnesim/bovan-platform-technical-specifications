"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Menu, X, User, Building2, LayoutDashboard, MessageCircle } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/talents", label: "Talents" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/pays", label: "Pays" },
];

export function Navbar({ session }: { session: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const dashHref =
    session?.user.role === "COMPANY"
      ? "/company/dashboard"
      : session?.user.role === "ADMIN"
        ? "/admin"
        : "/dashboard";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fafafa]/80 border-b border-[#e5e5e5]">
      <div className="container-bovan flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 py-2 -my-2">
          <Logo showText={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="px-4 py-2 text-sm font-medium text-[#404040] hover:text-[#0a0a0a] rounded-full hover:bg-[#f1f1f1] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href={session.user.role === "COMPANY" ? "/company/messages" : "/dashboard/messages"}
                className="p-2 text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f1f1f1] rounded-full transition-colors relative"
                aria-label="Messages"
              >
                <MessageCircle aria-hidden="true" className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f47b00] rounded-full border-2 border-[#fafafa]" />
              </Link>
              <Link
                href={dashHref}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[#0a0a0a] text-white hover:bg-[#262626]"
              >
                <LayoutDashboard aria-hidden="true" className="w-4 h-4" />
                {session.user.firstName
                  ? `${session.user.firstName}${session.user.role === "ADMIN" ? " · Admin" : session.user.role === "COMPANY" ? " · Entreprise" : ""}`
                  : session.user.role === "ADMIN"
                  ? "Tableau de bord · Admin"
                  : session.user.role === "COMPANY"
                  ? "Tableau de bord · Entreprise"
                  : "Tableau de bord"}
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-[#0a0a0a] hover:bg-[#f1f1f1] rounded-full"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[#f47b00] text-white hover:bg-[#c56200]"
              >
                Rejoindre OCD
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-3 rounded-lg hover:bg-[#f1f1f1]"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-[#e5e5e5] bg-white">
          <div className="container-bovan py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="px-4 py-3 text-sm font-medium rounded-lg hover:bg-[#f1f1f1]"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-[#e5e5e5] my-2" />
            {session ? (
              <Link
                href={dashHref}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-lg bg-[#0a0a0a] text-white"
              >
                {session.user.firstName
                  ? `${session.user.firstName}${session.user.role === "ADMIN" ? " · Admin" : session.user.role === "COMPANY" ? " · Entreprise" : ""}`
                  : session.user.role === "ADMIN"
                  ? "Tableau de bord · Admin"
                  : session.user.role === "COMPANY"
                  ? "Tableau de bord · Entreprise"
                  : "Tableau de bord"}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg hover:bg-[#f1f1f1]"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg bg-[#f47b00] text-white text-center"
                >
                  Rejoindre OCD
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
