"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for observability; the reference is logged so the
    // component can be matched back to the server log line.
    console.error("Page error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f47b00]/10 text-[#f47b00] mb-6">
          <RefreshCw className="w-7 h-7" />
        </div>
        <p className="eyebrow">Un souci est survenu</p>
        <h1 className="heading-3 mt-3">On n&apos;a pas pu charger cette page.</h1>
        <p className="text-[#525252] mt-4 leading-relaxed">
          C&apos;est temporaire. Réessayez — si le problème persiste, revenez à
          l&apos;accueil.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link href="/" className="btn-outline">
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-[#a3a3a3] font-mono">
            Réf. {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}