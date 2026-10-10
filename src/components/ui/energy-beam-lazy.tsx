"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * The energy beam pulls a WebGL runtime plus scene assets off a third-party
 * CDN. None of that is needed to read the headline or reach the CTAs, so it is
 * kept out of the initial bundle and only mounted once the browser is idle and
 * the visitor has scrolled to the hero. Until then the existing grid, glow and
 * ember layers carry the hero on their own.
 */
const Beam = dynamic(() => import("./energy-beam"), {
  ssr: false,
  loading: () => null,
});

export default function EnergyBeamLazy() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 200);

    let handle: number | undefined;
    handle = idle(() => setAllowed(true));

    return () => {
      if (handle !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  if (!allowed) return null;
  return <Beam />;
}