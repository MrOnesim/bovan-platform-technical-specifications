"use client";

import { useState } from "react";
import { Mail, MessageCircle, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Open mailto as a fallback (no backend for contact yet)
    const mailto = `mailto:hello@bovan.africa?subject=${encodeURIComponent(
      form.subject || "Contact OCD"
    )}&body=${encodeURIComponent(
      `${form.message}\n\n— ${form.name} (${form.email})`
    )}`;
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="bg-[#0a0a0a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative">
          <div className="max-w-2xl">
            <p className="eyebrow text-[#ff9520]">Contact</p>
            <h1 className="heading-1 text-white mt-3">
              On veut
              <br />
              <span className="text-[#f47b00]">vous entendre.</span>
            </h1>
            <p className="mt-4 text-white/60 text-lg">
              Question, partenariat, bug, idée : écrivez-nous, on répond
              toujours.
            </p>
          </div>
        </div>
      </section>

      <section className="container-bovan py-12 max-w-4xl">
        <div className="grid md:grid-cols-[1fr,1fr] gap-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5] space-y-4"
          >
            <h2 className="text-xl font-bold">Envoyer un message</h2>
            <div>
              <label className="label" htmlFor="contactName">Nom</label>
              <input
                id="contactName"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="contactEmail">Email</label>
              <input
                id="contactEmail"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="contactSubject">Sujet</label>
              <input
                id="contactSubject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="contactMessage">Message</label>
              <textarea
                id="contactMessage"
                name="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input min-h-[140px] resize-y"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              {sent ? (
                <Check className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sent ? "Ouverture de votre client mail…" : "Envoyer"}
            </button>
          </form>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <Mail className="w-6 h-6 text-[#f47b00] mb-3" />
              <h3 className="font-semibold">Email</h3>
              <a
                href="mailto:hello@bovan.africa"
                className="text-[#f47b00] font-medium hover:underline"
              >
                hello@bovan.africa
              </a>
              <p className="text-sm text-[#737373] mt-1">
                On répond sous 24h.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
              <MessageCircle className="w-6 h-6 text-[#f47b00] mb-3" />
              <h3 className="font-semibold">Partenariats</h3>
              <a
                href="mailto:partners@bovan.africa"
                className="text-[#f47b00] font-medium hover:underline"
              >
                partners@bovan.africa
              </a>
              <p className="text-sm text-[#737373] mt-1">
                Pour les organisations et institutions.
              </p>
            </div>
            <div className="bg-linear-to-br from-[#f47b00] to-[#c56200] text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg">Vous êtes une entreprise ?</h3>
              <p className="text-white/90 text-sm mt-2">
                Inscrivez-vous et commencez à recevoir des candidatures de
                talents africains qualifiés dès aujourd&apos;hui.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
