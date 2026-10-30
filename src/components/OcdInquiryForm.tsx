"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

export function OcdInquiryForm({ initialPackage, contactEmail }: { initialPackage: string; contactEmail: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!contactEmail.trim()) {
      setError("Le formulaire n’est pas encore relié à une adresse de réception OCD. Votre demande n’a pas été envoyée. L’équipe doit configurer NEXT_PUBLIC_OCD_CONTACT_EMAIL.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const business = String(data.get("business") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const selectedPackage = String(data.get("package") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = `Demande OCD — ${selectedPackage || business || name}`;
    const body = [
      `Nom : ${name}`,
      `Activité : ${business}`,
      `Téléphone : ${phone || "Non renseigné"}`,
      `Email : ${email}`,
      `Formule souhaitée : ${selectedPackage || "À discuter"}`,
      "",
      "Message :",
      message,
    ].join("\n");
    window.location.href = `mailto:${contactEmail.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e9e3dc] bg-white p-6 shadow-[0_24px_80px_-64px_rgba(55,39,25,.6)] sm:p-8">
      <div className="mb-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1e2] text-[#df6800]"><Mail className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-semibold">Parlez-nous de votre projet</h2><p className="mt-2 text-sm leading-6 text-[#716a62]">Les champs marqués d’un astérisque sont obligatoires.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="name" className="mb-1.5 block text-sm font-medium">Votre nom <span className="text-[#c65c00]">*</span></label><input id="name" name="name" required autoComplete="name" className="input" placeholder="Ex. Aïcha K." /></div>
        <div><label htmlFor="business" className="mb-1.5 block text-sm font-medium">Votre activité <span className="text-[#c65c00]">*</span></label><input id="business" name="business" required className="input" placeholder="Ex. Boutique de vêtements" /></div>
        <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium">Votre adresse email <span className="text-[#c65c00]">*</span></label><input id="email" name="email" required type="email" autoComplete="email" className="input" placeholder="vous@exemple.com" /></div>
        <div><label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Téléphone / WhatsApp</label><input id="phone" name="phone" type="tel" autoComplete="tel" className="input" placeholder="+229 …" /></div>
        <div className="sm:col-span-2"><label htmlFor="package" className="mb-1.5 block text-sm font-medium">Formule qui vous intéresse</label><select id="package" name="package" defaultValue={initialPackage} className="input"><option value="">À discuter</option><option value="Découverte — 1 heure — 5 000 FCFA">Découverte · 1 heure · 5 000 FCFA (à confirmer)</option><option value="Visibilité — 4 heures — 15 000 FCFA">Visibilité · 4 heures · 15 000 FCFA (à confirmer)</option><option value="Régularité — 3 × 4 heures — 40 000 FCFA">Régularité · 3 × 4 heures · 40 000 FCFA (à confirmer)</option><option value="Autre besoin">Autre besoin</option></select></div>
        <div className="sm:col-span-2"><label htmlFor="message" className="mb-1.5 block text-sm font-medium">Parlez-nous de votre besoin <span className="text-[#c65c00]">*</span></label><textarea id="message" name="message" required minLength={10} maxLength={2000} className="input min-h-32 resize-y" placeholder="Que souhaitez-vous présenter ? Quel créneau ou quel accompagnement recherchez-vous ?" /></div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-[#f0c9aa] bg-[#fff5ec] p-3 text-sm leading-6 text-[#7a3700]">{error}</p>}
      {sent && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">Votre application de messagerie devrait s’ouvrir avec votre demande prête à envoyer. Vérifiez puis envoyez le message.</p>}
      <button type="submit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f47b00] px-5 py-3 font-semibold text-white transition hover:bg-[#c56200]">Préparer ma demande <Send className="h-4 w-4" /></button>
      <p className="mt-3 text-center text-xs leading-5 text-[#81796f]">Ce formulaire prépare un email sur votre appareil. Il ne réserve pas automatiquement un créneau.</p>
    </form>
  );
}
