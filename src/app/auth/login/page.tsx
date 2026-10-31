"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { navigateAfterAuthChange } from "@/lib/utils";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
        data.user?.role === "ADMIN" ? "/admin" : "/"
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
            Connectez-vous à l&apos;espace OCD.
          </p>
        </div>
      </div>
    </div>
  );
}
