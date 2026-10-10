"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

interface CountryStat {
  iso2: string;
  nameFr: string;
  flag: string;
  talentsCount: number;
  companiesCount: number;
  opportunitiesCount: number;
}

/* The map ships ~34 KB of SVG path data plus the interactivity for 50 paths.
   It sits far below the hero, so deferring it until it is about to enter the
   viewport keeps that cost off the critical path for the first paint. */
const AfricaMap = dynamic(() => import("./AfricaMap").then((m) => m.AfricaMap), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[620px] mx-auto aspect-[1000/1042]" aria-hidden="true" />
  ),
});

export function AfricaMapLazy({ stats }: { stats: CountryStat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      // No observer available: load on the next tick to stay outside the
      // effect body (and satisfy react-hooks/set-state-in-effect).
      const t = setTimeout(() => setShouldLoad(true), 0);
      return () => clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {shouldLoad ? <AfricaMap stats={stats} /> : null}
    </div>
  );
}