import Link from "next/link";
import { MapPin, Briefcase, ArrowUpRight, Globe2 } from "lucide-react";
import {
  formatCurrency,
  employmentTypeLabel,
  experienceLevelLabel,
} from "@/lib/utils";
import { CompanyLogo } from "./CompanyCard";

export interface OpportunityCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  remote: boolean;
  skills: string[] | null;
  companyName: string;
  companySlug: string;
  companyLogo: string | null;
  companyVerified: string;
}

export function OpportunityCard({
  opportunity,
}: {
  opportunity: OpportunityCardData;
}) {
  const salary =
    formatCurrency(opportunity.salaryMin, opportunity.currency || "USD") +
    (opportunity.salaryMax
      ? " – " + formatCurrency(opportunity.salaryMax, opportunity.currency || "USD")
      : "");
  return (
    <Link
      href={`/opportunites/${opportunity.slug}`}
      className="card-hover p-6 group block"
    >
      <div className="flex items-start gap-3 mb-4">
        <CompanyLogo
          name={opportunity.companyName}
          logo={opportunity.companyLogo}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#737373]">
            {opportunity.companyName}
          </div>
          <h3 className="font-semibold mt-0.5 group-hover:text-[#f47b00] transition-colors line-clamp-2">
            {opportunity.title}
          </h3>
        </div>
        <ArrowUpRight aria-hidden="true" className="w-4 h-4 text-[#a3a3a3] group-hover:text-[#f47b00] transition-colors shrink-0" />
      </div>

      <p className="text-sm text-[#525252] line-clamp-2 mb-4">
        {opportunity.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="chip-orange text-[10px]">
          <Briefcase aria-hidden="true" className="w-3 h-3" />
          {employmentTypeLabel(opportunity.employmentType)}
        </span>
        <span className="chip-neutral text-[10px]">
          {experienceLevelLabel(opportunity.experienceLevel)}
        </span>
        {opportunity.remote && (
          <span className="chip-success text-[10px]">
            <Globe2 aria-hidden="true" className="w-3 h-3" />
            Remote
          </span>
        )}
      </div>

      {opportunity.skills && opportunity.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {opportunity.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[#f1f1f1] text-[#525252] font-mono"
            >
              {s}
            </span>
          ))}
          {opportunity.skills.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 text-[#737373]">
              +{opportunity.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-[#f1f1f1]">
        <span className="flex items-center gap-1 text-[#737373]">
          <MapPin aria-hidden="true" className="w-3 h-3" />
          {opportunity.location}
        </span>
        {salary && <span className="font-semibold text-[#0a0a0a]">{salary}</span>}
      </div>
    </Link>
  );
}
