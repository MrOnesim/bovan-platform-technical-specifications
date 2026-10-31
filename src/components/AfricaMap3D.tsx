"use client";

import { useState } from "react";
import { AFRICA_COUNTRIES, AFRICA_VIEWBOX } from "@/data/africa-countries";

/* Carte d'Afrique en pseudo-3D : les pays sont blancs, les limites noires.
   L'effet de relief vient d'une rotation CSS du bloc + une ombre portée
   décalée déposée sous la carte entière, pas path par path. Aucune lib
   3D : la carte reste une cinquantaine de paths légers. */

export function AfricaMap3D() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 10, y: px * 14 });
  }

  const country = AFRICA_COUNTRIES.find((c) => c.iso2 === hovered);

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <div
        className="relative mx-auto w-full max-w-[520px]"
        style={{ perspective: "1400px" }}
        onMouseMove={onMove}
        onMouseLeave={() => {
          setTilt({ x: 0, y: 0 });
          setHovered(null);
        }}
      >
        {/* Socle : l'ombre qui donne la profondeur */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-0 h-10 rounded-full bg-black/25 blur-2xl"
          style={{
            transform: `translateY(${18 - Math.abs(tilt.x) * 0.6}px) scale(${1.02 + Math.abs(tilt.y) * 0.004})`,
          }}
        />
        <div
          className="transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox={AFRICA_VIEWBOX}
            className="block h-auto w-full"
            role="img"
            aria-label="Carte de l'Afrique en relief"
          >
            {/* Couche d'ombre : la même carte décalée vers le bas en gris */}
            <g
              aria-hidden="true"
              fill="#c9c3bc"
              stroke="none"
              transform="translate(7, 10)"
              opacity={0.55}
            >
              {AFRICA_COUNTRIES.map((c) => (
                <path key={`shadow-${c.num}`} d={c.d} />
              ))}
            </g>
            {/* Couche face : blanc + limites noires */}
            <g stroke="#000000" strokeWidth={0.7} strokeLinejoin="round">
              {AFRICA_COUNTRIES.map((c) => {
                const active = hovered === c.iso2;
                return (
                  <path
                    key={c.num}
                    d={c.d}
                    fill={active ? "#fff7ee" : "#ffffff"}
                    strokeWidth={active ? 1.6 : 0.7}
                    style={{
                      transform: active ? "translate(-3px, -4px)" : undefined,
                      transition: "transform .15s ease, stroke-width .15s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHovered(c.iso2)}
                    tabIndex={0}
                    role="button"
                    aria-label={c.nameFr}
                    onFocus={() => setHovered(c.iso2)}
                    onBlur={() => setHovered(null)}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* Étiquette du pays survolé */}
        {country && (
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-[#e9e3dc] bg-white px-4 py-1.5 text-sm font-semibold shadow-lg">
            {country.nameFr}
          </div>
        )}
      </div>

      <div className="max-w-md text-center lg:text-left">
        <p className="eyebrow">Présence continentale</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Un réseau qui grandit,
          <br />
          <span className="text-[#f47b00]">pays par pays.</span>
        </h3>
        <p className="mt-4 text-sm leading-6 text-[#716a62]">
          OCD est né en Afrique et s&apos;adresse d&apos;abord aux
          entrepreneurs du continent. La carte évolue avec chaque nouveau
          partenaire : chaque pays qui s&apos;allume est une ville de plus où
          vos produits peuvent être découverts en direct.
        </p>
      </div>
    </div>
  );
}
