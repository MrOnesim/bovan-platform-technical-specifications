"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js";

declare global {
  interface Window {
    UnicornStudio?: {
      init: () => void;
      [key: string]: unknown;
    };
  }
}

interface EnergyBeamProps {
  /** Unicorn Studio project id. */
  projectId?: string;
  className?: string;
  /** Rendered above the beam, inside the same stacking context. */
  children?: ReactNode;
}

/**
 * Loaded at most once per document, no matter how many beams mount. Concurrent
 * callers await the same promise, so a second mount never appends a second
 * copy of the script.
 */
let scriptPromise: Promise<boolean> | null = null;

function loadUnicornStudio(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  if (window.UnicornStudio) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = (async () => {
    try {
      // Fetch + evaluate rather than a <script src> tag: the UMD bundle does
      // not reliably fire onload when injected asynchronously in every
      // browser/CSP combination, and fetching lets us surface load failures.
      const res = await fetch(SCRIPT_SRC, { mode: "cors" });
      if (!res.ok) return false;
      const code = await res.text();
      // Execute with `window` as `this` so the UMD factory attaches the
      // `UnicornStudio` global to the page rather than to a local scope.
      new Function(code).call(window);
      return typeof window.UnicornStudio !== "undefined";
    } catch {
      return false;
    }
  })();

  return scriptPromise;
}

export default function EnergyBeam({
  projectId = process.env.NEXT_PUBLIC_UNICORN_PROJECT_ID || "hRFfUymDGOHwtFe7evR2",
  className = "",
  children,
}: EnergyBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    // This beam renders a WebGL scene. Honour the OS motion preference rather
    // than shipping a heavy animated background to users who asked us not to.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      // Deferred so the state update lands outside the effect body.
      const t = setTimeout(() => setStatus("failed"), 0);
      return () => clearTimeout(t);
    }

    let cancelled = false;

    loadUnicornStudio()
      .then((ok) => {
        if (cancelled) return;
        if (!ok || !containerRef.current) {
          setStatus("failed");
          return;
        }
        try {
          window.UnicornStudio?.init();
          setStatus("ready");
        } catch {
          setStatus("failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-ink ${className}`}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={containerRef}
        data-us-project={projectId}
        className="h-full w-full"
        style={{
          opacity: status === "ready" ? 1 : 0,
          transition: "opacity 600ms ease-out",
        }}
      />
      {children}
    </div>
  );
}