"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AFRICA_COUNTRIES,
  AFRICA_VIEWBOX,
} from "@/data/africa-countries";

interface CountryStat {
  iso2: string;
  nameFr: string;
  flag: string;
  talentsCount: number;
  companiesCount: number;
  opportunitiesCount: number;
}

/* Four-step ramp, so the map reads as a heat map rather than a binary
   "has data / has no data" split. Index 0 is the empty state. */
const RAMP = ["#141414", "#7a3900", "#b35400", "#e06a00", "#f47b00"] as const;

function rampIndex(total: number, max: number): number {
  if (total <= 0) return 0;
  if (max <= 0) return 1;
  // Thresholds at 20 / 50 / 80 % of the busiest country.
  const r = total / max;
  if (r > 0.8) return 4;
  if (r > 0.5) return 3;
  if (r > 0.2) return 2;
  return 1;
}

export function AfricaMap({ stats }: { stats: CountryStat[] }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CountryStat | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const byIso = new Map(stats.map((s) => [s.iso2, s]));
  const [box, setBox] = useState({ width: 0, height: 0 });
  const max = Math.max(
    1,
    ...stats.map((s) => s.talentsCount + s.companiesCount + s.opportunitiesCount)
  );

  return (
    <div className="relative w-full">
      <svg
        viewBox={AFRICA_VIEWBOX}
        className="africa-map"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setBox({ width: r.width, height: r.height });
          setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseLeave={() => {
          setHovered(null);
          setActive(null);
        }}
        role="group"
        aria-label="Carte de l'Afrique, interactif"
      >
        <g>
          {AFRICA_COUNTRIES.map((c) => {
            const s = byIso.get(c.iso2);
            const total = s
              ? s.talentsCount + s.companiesCount + s.opportunitiesCount
              : 0;
            const idx = rampIndex(total, max);
            const isActive = active === c.iso2;
            const fill = isActive ? RAMP[RAMP.length - 1] : RAMP[idx];

            return (
              <path
                key={c.num}
                d={c.d}
                fill={fill}
                className="africa-country"
                data-iso={c.iso2}
                data-has-data={total > 0 ? "true" : "false"}
                tabIndex={0}
                role="button"
                aria-label={`${c.nameFr}${
                  s
                    ? ` — ${s.talentsCount} talents, ${s.companiesCount} entreprises, ${s.opportunitiesCount} opportunités`
                    : " — aucune donnée"
                }`}
                onMouseEnter={() => {
                  setActive(c.iso2);
                  setHovered(s ?? null);
                }}
                onFocus={(e) => {
                  setActive(c.iso2);
                  setHovered(s ?? null);
                  const svg = e.currentTarget.ownerSVGElement;
                  if (svg) {
                    const r = svg.getBoundingClientRect();
                    const pr = e.currentTarget.getBoundingClientRect();
                    setBox({ width: r.width, height: r.height });
                    setPointer({
                      x: pr.left - r.left + pr.width / 2,
                      y: pr.top - r.top + pr.height / 2,
                    });
                  }
                }}
                onBlur={() => {
                  setActive(null);
                  setHovered(null);
                }}
                onClick={() => router.push(`/pays/${c.iso2.toLowerCase()}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/pays/${c.iso2.toLowerCase()}`);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Hover card. Positioned from the pointer so it never relies on the
          (removed) hand-placed label coordinates. */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: `${pointer.x}px`,
            top: `${pointer.y}px`,
            // Flip to the other side of the cursor near the right edge so the
            // card never runs off the container.
            transform: pointer.x > box.width - 220
              ? "translate(calc(-100% - 16px), -50%)"
              : "translate(16px, -50%)",
          }}
        >
          <div className="bg-[#0a0a0a] text-white rounded-xl px-4 py-3 shadow-2xl min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span aria-hidden="true" className="text-xl">{hovered.flag}</span>
              <span className="font-semibold">{hovered.nameFr}</span>
            </div>
            <div className="space-y-1 text-sm">
              <Row label="Talents" value={hovered.talentsCount} />
              <Row label="Entreprises" value={hovered.companiesCount} />
              <Row label="Opportunités" value={hovered.opportunitiesCount} />
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-[#f47b00] font-medium">
              Cliquer pour explorer →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/60">{label}</span>
      <span className="font-mono font-semibold tabular-nums">
        {value.toLocaleString("fr-FR")}
      </span>
    </div>
  );
}