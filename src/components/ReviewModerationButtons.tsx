"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export function ReviewModerationButtons({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function moderate(action: "approve" | "reject") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Erreur.");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex sm:flex-col gap-2 shrink-0">
      <button
        type="button"
        onClick={() => moderate("approve")}
        disabled={loading !== null}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {loading === "approve" ? (
          <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
        ) : (
          <Check aria-hidden="true" className="w-4 h-4" />
        )}
        Approuver
      </button>
      <button
        type="button"
        onClick={() => moderate("reject")}
        disabled={loading !== null}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {loading === "reject" ? (
          <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
        ) : (
          <X aria-hidden="true" className="w-4 h-4" />
        )}
        Rejeter
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}