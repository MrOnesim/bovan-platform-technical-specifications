"use client";

import { useState } from "react";
import { Star, Loader2, Check } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  authorId: string;
}

interface Props {
  targetType: "TALENT" | "COMPANY";
  targetId: string;
  canReview: boolean;
  reviews: Review[];
}

export function ReviewSection({ targetType, targetId, canReview, reviews }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = reviews;
  const avg = list.length > 0 ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Veuillez choisir une note entre 1 et 5.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi de l'avis.");
      } else {
        setSaved(true);
        setRating(0);
        setComment("");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star aria-hidden="true" className="w-5 h-5 text-[#f47b00]" />
          Avis ({list.length})
        </h2>
        {list.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#525252]">
            <span className="font-semibold">{avg.toFixed(1)}/5</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className={`w-4 h-4 ${i <= Math.round(avg) ? "text-[#f47b00] fill-[#f47b00]" : "text-[#d4d4d4]"}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {canReview && (
        <form onSubmit={submit} className="mb-8 p-5 rounded-xl border border-[#f1f1f1] bg-[#fafafa] space-y-4">
          <div>
            <label className="label">Votre note</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Noter ${i} sur 5`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="p-1"
                >
                  <Star
                    aria-hidden="true"
                    className={`w-6 h-6 ${
                      i <= (hover || rating) ? "text-[#f47b00] fill-[#f47b00]" : "text-[#d4d4d4]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="comment">Votre avis (facultatif)</label>
            <textarea
              id="comment"
              className="input min-h-[100px] resize-y"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience…"
            />
          </div>
          {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
          {saved && (
            <div role="status" className="text-sm text-emerald-700 flex items-center gap-2">
              <Check aria-hidden="true" className="w-4 h-4" />
              Avis envoyé. Il sera publié après validation par un administrateur.
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> : "Envoyer l'avis"}
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <p className="text-[#525252] text-sm">Aucun avis validé pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <div key={r.id} className="border-b border-[#f1f1f1] last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={`w-4 h-4 ${i <= r.rating ? "text-[#f47b00] fill-[#f47b00]" : "text-[#d4d4d4]"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#737373]">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {r.comment && <p className="text-sm text-[#525252] mt-2 whitespace-pre-line">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
