"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface Props {
  talentId: string;
  talentName: string;
  className?: string;
}

export function ContactTalentButton({ talentId, talentName, className }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentId, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur.");
        if (res.status === 401) {
          setTimeout(() => router.push("/auth/login"), 1000);
        }
      } else {
        setSent(true);
        setMessage("");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={className}>
        <Send aria-hidden="true" className="w-4 h-4" />
        Contacter
      </button>
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="contact-modal-title" className="text-lg font-bold mb-1">
              Contacter {talentName}
            </h3>
            {sent ? (
              <>
                <p role="status" className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl">
                  Message envoyé à {talentName} !
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-primary text-sm py-2"
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[#525252] mb-4">
                  Envoyez un message pour proposer une opportunité ou démarrer la
                  conversation.
                </p>
                <label htmlFor="contactMessage" className="sr-only">
                  Message
                </label>
                <textarea
                  id="contactMessage"
                  name="contactMessage"
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input min-h-[120px] resize-y"
                  placeholder="Bonjour, j'ai une opportunité qui pourrait vous intéresser…"
                />
                {error && (
                  <div role="alert" className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm font-medium hover:bg-[#f1f1f1] rounded-full"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className="btn-primary text-sm py-2"
                  >
                    {loading ? (
                      <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send aria-hidden="true" className="w-4 h-4" />
                    )}
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
