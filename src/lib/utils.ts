import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency = "USD") {
  if (amount == null) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function timeAgo(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(date);
}

/** Navigates with a full document load, for the moments right after a
    mutation changed who the visitor is: login, register, logout.

    `router.push()` alone is not enough — the root layout is preserved across
    a client-side navigation, so the Navbar would keep rendering the session
    it had before the cookie changed. The usual `router.push(); router.refresh()`
    pair does fix that, but firing the refresh while the push is still in
    flight intermittently cancels the navigation and leaves the visitor on the
    page they started from. A full load re-renders layout and page together,
    from the server, with no ordering to get wrong. */
export function navigateAfterAuthChange(href: string) {
  window.location.assign(href);
}

export function initials(firstName?: string | null, lastName?: string | null) {
  const f = (firstName || "").trim()[0] || "";
  const l = (lastName || "").trim()[0] || "";
  return (f + l).toUpperCase() || "B";
}

export function employmentTypeLabel(t: string) {
  const map: Record<string, string> = {
    FULL_TIME: "Temps plein",
    PART_TIME: "Temps partiel",
    FREELANCE: "Freelance",
    INTERNSHIP: "Stage",
    CONTRACT: "Contrat",
    VOLUNTEER: "Bénévolat",
    PROJECT: "Projet",
    REMOTE: "À distance",
  };
  return map[t] || t;
}

export function availabilityLabel(a: string) {
  const map: Record<string, string> = {
    AVAILABLE: "Disponible",
    OPEN_TO_OPPORTUNITIES: "Ouvert aux opportunités",
    EMPLOYED: "En poste",
    NOT_AVAILABLE: "Non disponible",
  };
  return map[a] || a;
}

export function experienceLevelLabel(e: string) {
  const map: Record<string, string> = {
    JUNIOR: "Junior",
    MID: "Intermédiaire",
    SENIOR: "Senior",
    LEAD: "Lead",
    EXECUTIVE: "Direction",
    INTERN: "Stagiaire",
    ENTRY: "Débutant",
  };
  return map[e] || e;
}
