"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { href: "/#concept", label: "Le concept" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#services", label: "Services" },
  { href: "/#tarifs", label: "Formules" },
  { href: "/a-propos", label: "À propos" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => href === "/a-propos" && pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e3dc] bg-[#fbf9f6]/90 backdrop-blur-xl">
      <div className="container-bovan flex h-[72px] items-center justify-between">
        <Link href="/" aria-label="OCD — accueil" className="flex items-center gap-2 py-2">
          <Logo showText={false} />
          <span className="ml-1 border-l border-[#ded6cd] pl-3 text-[10px] leading-tight font-semibold tracking-[.18em] text-[#716a62] uppercase">Visibilité<br/>commerciale</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={`rounded-full px-3 py-2 text-[13px] font-medium transition ${isActive(link.href) ? "text-[#b85100]" : "text-[#5c554d] hover:bg-[#f0ebe4] hover:text-[#1d1a17]"}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/contact#reservation" className="hidden items-center gap-2 rounded-full bg-[#f47b00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c56200] sm:inline-flex">
          Réserver un passage <ArrowRight className="h-4 w-4" />
        </Link>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-xl p-3 text-[#1d1a17] transition hover:bg-[#f0ebe4] lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>
      {open && <div id="mobile-menu" className="border-t border-[#e9e3dc] bg-[#fbf9f6] lg:hidden"><nav aria-label="Navigation mobile" className="container-bovan flex flex-col gap-1 py-3">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? "page" : undefined} className="rounded-xl px-4 py-3 text-sm font-medium text-[#49433d] hover:bg-[#f0ebe4]">{link.label}</Link>)}<Link href="/contact#reservation" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#f47b00] px-5 py-3 text-sm font-semibold text-white">Réserver un passage <ArrowRight className="h-4 w-4" /></Link></nav></div>}
    </header>
  );
}
