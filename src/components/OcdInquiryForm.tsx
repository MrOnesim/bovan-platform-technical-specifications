"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

export function OcdInquiryForm({
  initialPackage,
  contactEmail,
}: {
  initialPackage: string;
  contactEmail: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const successRef = useRef<HTMLDivElement>(null);

  // The form can be taller than the viewport: without this the confirmation
  // replaces the fields off-screen and the visitor sees nothing happen.
  useEffect(() => {
    if (status !== "sent") return;
    successRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    successRef.current?.focus({ preventScroll: true });
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      business: String(data.get("business") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      packageLabel: String(data.get("package") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
      source: "contact",
    };

    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(
          typeof detail?.error === "string"
            ? detail.error
            : "Votre demande n'a pas pu être envoyée."
        );
      }

      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof Error
          ? e.message
          : "Votre demande n'a pas pu être envoyée. Réessayez dans un instant."
      );
    }
  }

  if (status === "sent") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-[0_24px_80px_-64px_rgba(55,39,25,.6)] outline-none sm:p-8"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">Demande enregistrée.</h2>
        <p className="mt-2 text-sm leading-6 text-[#4b5a4f]">
          Merci. Votre demande a bien été enregistrée. L&apos;équipe OCD vous
          recontactera pour confirmer le créneau, les prestations et les tarifs.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormKey((k) => k + 1);
            setStatus("idle");
          }}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cfe3d5] bg-white px-5 py-2.5 text-sm font-semibold text-[#2f5d43] transition hover:border-[#2f5d43]/40"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#e9e3dc] bg-white p-6 shadow-[0_24px_80px_-64px_rgba(55,39,25,.6)] sm:p-8"
    >
      <div className="mb-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1e2] text-[#df6800]">
          <Mail className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">Parlez-nous de votre projet</h2>
        <p className="mt-2 text-sm leading-6 text-[#716a62]">
          Les champs marqués d&apos;un astérisque sont obligatoires.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Votre nom <span className="text-[#c65c00]">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="input"
            placeholder="Ex. Aïcha K."
          />
        </div>
        <div>
          <label htmlFor="business" className="mb-1.5 block text-sm font-medium">
            Votre activité <span className="text-[#c65c00]">*</span>
          </label>
          <input
            id="business"
            name="business"
            required
            className="input"
            placeholder="Ex. Boutique de vêtements"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Votre adresse email <span className="text-[#c65c00]">*</span>
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            autoComplete="email"
            className="input"
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Téléphone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="input"
            placeholder="+229 …"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="package" className="mb-1.5 block text-sm font-medium">
            Formule qui vous intéresse
          </label>
          <select
            id="package"
            name="package"
            defaultValue={initialPackage}
            className="input"
          >
            <option value="">À discuter</option>
            <option value="Découverte — 1 heure — 5 000 FCFA">
              Découverte · 1 heure · 5 000 FCFA (à confirmer)
            </option>
            <option value="Visibilité — 4 heures — 15 000 FCFA">
              Visibilité · 4 heures · 15 000 FCFA (à confirmer)
            </option>
            <option value="Régularité — 3 × 4 heures — 40 000 FCFA">
              Régularité · 3 × 4 heures · 40 000 FCFA (à confirmer)
            </option>
            <option value="Autre besoin">Autre besoin</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
            Parlez-nous de votre besoin <span className="text-[#c65c00]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={2000}
            className="input min-h-32 resize-y"
            placeholder="Que souhaitez-vous présenter ? Quel créneau ou quel accompagnement recherchez-vous ?"
          />
        </div>
      </div>

      {/* Honeypot: hidden from people, filled by naive bots. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div aria-live="polite">
        {status === "error" && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-[#f0c9aa] bg-[#fff5ec] p-3 text-sm leading-6 text-[#7a3700]"
          >
            {error}
            {contactEmail.trim() && (
              <>
                {" "}
                Vous pouvez aussi écrire directement à{" "}
                <a
                  href={`mailto:${contactEmail.trim()}`}
                  className="font-semibold underline"
                >
                  {contactEmail.trim()}
                </a>
                .
              </>
            )}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={sending}
        aria-busy={sending}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f47b00] px-5 py-3 font-semibold text-white transition hover:bg-[#c56200] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {sending ? "Envoi en cours…" : "Envoyer ma demande"}
        {!sending && <Send className="h-4 w-4" />}
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-[#81796f]">
        Votre demande est enregistrée pour traitement par l&apos;équipe OCD.
        Elle ne réserve pas automatiquement un créneau : les disponibilités sont
        confirmées par retour.
      </p>
    </form>
  );
}
