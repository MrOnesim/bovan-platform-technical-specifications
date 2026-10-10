import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Briefcase, ArrowUpRight } from "lucide-react";

export interface CompanyCardData {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  description: string | null;
  logo: string | null;
  verification: string;
  countryName: string | null;
  countryFlag: string | null;
  opportunitiesCount: number;
}

function CompanyLogo({
  name,
  logo,
  size = "md",
}: {
  name: string;
  logo: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
  }[size];
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "from-[#f47b00] to-[#c56200]",
    "from-[#0a0a0a] to-[#404040]",
    "from-[#7c3aed] to-[#5b21b6]",
    "from-[#0ea5e9] to-[#0369a1]",
    "from-[#16a34a] to-[#15803d]",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (logo) {
    return (
      <Image
        src={logo}
        alt={name}
        width={size === "lg" ? 64 : size === "sm" ? 40 : 48}
        height={size === "lg" ? 64 : size === "sm" ? 40 : 48}
        className={`${sizeClass} rounded-xl object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white font-black`}
    >
      {initials}
    </div>
  );
}

export { CompanyLogo };

export function CompanyCard({ company }: { company: CompanyCardData }) {
  return (
    <Link
      href={`/entreprises/${company.slug}`}
      className="card-hover p-5 group block"
    >
      <CompanyLogo name={company.name} logo={company.logo} size="md" />
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate group-hover:text-[#f47b00] transition-colors flex items-center gap-1.5">
            {company.name}
            {company.verification === "VERIFIED" && (
              <CheckCircle2 aria-label="Entreprise vérifiée" className="w-4 h-4 text-[#f47b00] shrink-0" />
            )}
          </h3>
          {company.industry && (
            <p className="text-xs text-[#737373] mt-0.5">{company.industry}</p>
          )}
        </div>
        <ArrowUpRight aria-hidden="true" className="w-4 h-4 text-[#a3a3a3] group-hover:text-[#f47b00] transition-colors shrink-0" />
      </div>
      {company.description && (
        <p className="text-sm text-[#525252] mt-3 line-clamp-2">
          {company.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs text-[#737373] mt-4 pt-4 border-t border-[#f1f1f1]">
        <span>
          {company.countryFlag && <span aria-hidden="true">{company.countryFlag}</span>} {company.countryName}
        </span>
        {company.opportunitiesCount > 0 && (
          <span className="chip-orange text-[10px]">
            <Briefcase aria-hidden="true" className="w-3 h-3" />
            {company.opportunitiesCount} offre
            {company.opportunitiesCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
