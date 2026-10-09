"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

interface Props {
  opportunityId: string;
  opportunityTitle: string;
  className?: string;
}

export function ApplyButton({ opportunityId, opportunityTitle, className }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, coverLetter }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur.");
        if (res.status === 401) {
          setTimeout(() => router.push("/auth/login"), 1000);
        }
      } else {
        setOpen(false);
        alert("Candidature envoyée !");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        <Send className="w-4 h-4" />
        Postuler
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Postuler à {opportunityTitle}</h3>
            <p className="text-sm text-[#525252] mb-4">
              Présentez-vous en quelques lignes. Le recruteur verra votre profil
              automatiquement.
            </p>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="input min-h-[140px] resize-y"
              placeholder="Bonjour, je suis très intéressé par ce poste car..."
            />
            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-[#f1f1f1] rounded-full"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="btn-primary text-sm py-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Envoyer ma candidature
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
