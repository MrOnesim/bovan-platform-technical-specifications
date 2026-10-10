import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { initials, availabilityLabel } from "@/lib/utils";

export interface TalentCardData {
  id: string;
  slug: string;
  headline: string | null;
  profession: string | null;
  availability: string;
  yearsExperience: number;
  experienceLevel: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  countryName: string | null;
  countryFlag: string | null;
  city: string | null;
}

const availabilityStyles: Record<string, string> = {
  AVAILABLE: "chip-success",
  OPEN_TO_OPPORTUNITIES: "chip-orange",
  EMPLOYED: "chip-neutral",
  NOT_AVAILABLE: "chip-neutral",
};

export function TalentCard({ talent }: { talent: TalentCardData }) {
  return (
    <Link
      href={`/talents/${talent.slug}`}
      className="card-hover p-5 group block relative overflow-hidden"
    >
      {/* "Dehors" badge for spontaneous talents */}
      <div className="absolute top-0 right-0 p-2">
         <div className="bg-[#f47b00] text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">
            Dehors
         </div>
      </div>
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          {talent.avatarUrl ? (
            <Image
              src={talent.avatarUrl}
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white font-bold text-sm">
              {initials(talent.firstName, talent.lastName)}
            </div>
          )}
          {talent.availability === "AVAILABLE" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate group-hover:text-[#f47b00] transition-colors">
            {talent.firstName} {talent.lastName}
          </h3>
          <p className="text-sm text-[#525252] truncate">{talent.headline}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className={`text-[10px] ${availabilityStyles[talent.availability] || "chip-neutral"}`}
        >
          {availabilityLabel(talent.availability)}
        </span>
        {talent.experienceLevel && (
          <span className="chip-neutral text-[10px]">
            {talent.experienceLevel}
          </span>
        )}
        {talent.yearsExperience > 0 && (
          <span className="chip-neutral text-[10px]">
            {talent.yearsExperience} an{talent.yearsExperience > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[#737373] mt-4 pt-4 border-t border-[#f1f1f1]">
        <span className="flex items-center gap-1">
          <MapPin aria-hidden="true" className="w-3 h-3" />
          {talent.city ? `${talent.city}, ` : ""}
          {talent.countryFlag && <span aria-hidden="true">{talent.countryFlag}</span>} {talent.countryName}
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#f47b00] font-medium flex items-center gap-1">
          Voir
          <ArrowRight aria-hidden="true" className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
