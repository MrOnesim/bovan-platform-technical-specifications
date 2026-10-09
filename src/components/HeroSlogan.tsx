"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSlogan() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 450),
      setTimeout(() => setStage(3), 700),
      setTimeout(() => setStage(4), 950),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="slogan-stage text-center">
      <h1 className="relative inline-block">
        <span className="slogan-line slogan-line-1 text-white/95 text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em] block">
          LES OPPORTUNITÉS
        </span>
        <span
          className={`slogan-line slogan-line-2 text-white/95 text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em] block transition-opacity duration-700 ${
            stage >= 1 ? "opacity-100" : "opacity-0"
          }`}
          style={{ marginTop: "0.2em" }}
        >
          <span className="inline-block w-8 h-1 bg-[#f47b00] align-middle mr-3" />
          C&apos;EST
        </span>
        <span
          className={`slogan-line slogan-line-3 text-[clamp(3rem,9vw,7rem)] font-black leading-[0.95] tracking-[-0.05em] block transition-all duration-700 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ color: "#f47b00" }}
        >
          <span className="shimmer-text">DEHORS.</span>
          <span className="slogan-cursor" style={{ background: "#f47b00" }} />
        </span>
      </h1>
      {stage >= 3 && (
        <div
          className="slogan-line slogan-line-4 mt-8 text-white/70 text-base sm:text-lg max-w-xl mx-auto"
          style={{ animationDelay: "0.1s" }}
        >
          Explore. Connecte. Crée.
          <br />
          <span className="text-white/50">
            La plateforme panafricaine qui rend les talents visibles et les
            entreprises curieuses.
          </span>
        </div>
      )}
      {stage >= 4 && (
        <div
          className="slogan-line slogan-line-5 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          style={{ animationDelay: "0.15s" }}
        >
          <Link
            href="/auth/register?role=talent"
            className="btn-primary group"
          >
            Je suis un talent
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/register?role=company"
            className="btn-ghost"
          >
            Je suis une entreprise
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
