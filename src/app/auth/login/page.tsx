"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { navigateAfterAuthChange } from "@/lib/utils";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

/* Seeded accounts from src/db/seed.ts, all sharing the same password. */
const DEMO_PASSWORD = "password123";
const DEMO_ACCOUNTS = [
  { role: "Talent", email: "graca.onesim@bovan.dev", initials: "GO" },
  { role: "Entreprise", email: "hr@wave-senegal.com", initials: "WS" },
] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(loginEmail: string, loginPassword: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de connexion.");
        return false;
      }
      // A full load, not a client-side push: the root layout renders the
      // session and is preserved across a push, so the Navbar would keep
      // showing the logged-out state.
      navigateAfterAuthChange(
        data.user?.role === "COMPANY"
          ? "/company/dashboard"
          : data.user?.role === "ADMIN"
            ? "/admin"
            : "/dashboard"
      );
      return true;
    } catch {
      setError("Erreur réseau.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
  }

  /** Pre-fills the form so the credentials are visible/editable, then logs in. */
  async function handleDemoClick(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    await signIn(demoEmail, DEMO_PASSWORD);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h1 className="heading-3">Bon retour 👋</h1>
          <p className="text-[#525252] mt-2 mb-8">
            Connectez-vous pour continuer votre aventure OCD.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPw}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#0a0a0a]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Connexion…" : "Se connecter"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-[#525252] mt-6 text-center">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-[#f47b00] font-semibold">
              S&apos;inscrire
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-xl bg-[#f47b00]/5 border border-[#f47b00]/20 text-sm">
            <p className="font-semibold text-[#c56200] mb-1">Comptes de démo</p>
            <p className="text-xs text-[#525252] mb-3">
              Cliquez pour vous connecter immédiatement avec un compte pré-rempli.
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoClick(account.email)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white border border-[#e5e5e5] text-left hover:border-[#f47b00] hover:bg-[#f47b00]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span
                    aria-hidden="true"
                    className="w-9 h-9 shrink-0 rounded-full bg-[#0a0a0a] text-white text-xs font-bold flex items-center justify-center"
                  >
                    {account.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[#0a0a0a]">
                      {account.role}
                    </span>
                    <span className="block text-xs font-mono text-[#737373] truncate">
                      {account.email}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0 text-[#f47b00]" />
                </button>
              ))}
            </div>
            <p className="text-xs text-[#525252] mt-3">
              Mot de passe commun:{" "}
              <span className="font-mono">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative bg-[#0a0a0a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 glow-orange opacity-40" />
        <div className="relative h-full flex flex-col justify-center p-12">
          <Logo variant="light" />
          <h2 className="mt-12 heading-2">
            Les opportunités
            <br />
            <span className="text-[#f47b00]">c&apos;est dehors.</span>
          </h2>
          <p className="mt-6 text-white/60 max-w-md leading-relaxed">
            Connectez-vous pour retrouver vos talents favoris, gérer vos
            candidatures et publier vos prochaines opportunités.
          </p>
          <div className="mt-12 flex items-center gap-8 text-sm text-white/40">
            <div>
              <div className="stat-sm text-white">52</div>
              <div>Pays</div>
            </div>
            <div>
              <div className="stat-sm text-white">21k+</div>
              <div>Talents</div>
            </div>
            <div>
              <div className="stat-sm text-white">3k+</div>
              <div>Entreprises</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
