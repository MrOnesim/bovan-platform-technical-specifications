"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ArrowRight, Mail, Lock, User, Building2, Check } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"TALENT" | "COMPANY">(
    (searchParams.get("role") as "TALENT" | "COMPANY") || "TALENT"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          firstName: role === "TALENT" ? firstName : undefined,
          lastName: role === "TALENT" ? lastName : undefined,
          companyName: role === "COMPANY" ? companyName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur d'inscription.");
      } else {
        router.push(role === "COMPANY" ? "/company/dashboard" : "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-[#0a0a0a] text-white overflow-hidden order-2">
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 glow-orange opacity-40" />
        <div className="relative h-full flex flex-col justify-center p-12">
          <Logo variant="light" />
          <h2 className="mt-12 heading-2">
            Sors.
            <br />
            <span className="text-[#f47b00]">Montre-toi.</span>
            <br />
            Connecte-toi.
          </h2>
          <p className="mt-6 text-white/60 max-w-md leading-relaxed">
            Rejoignez la première communauté panafricaine qui valorise les
            talents du continent et aide les entreprises à les découvrir.
          </p>
          <div className="mt-12 space-y-3">
            {[
              "Profil public en 2 minutes",
              "Visible par les recruteurs de tout le continent",
              "Candidature spontanée en un clic",
              "100% gratuit pendant le lancement",
            ].map((b) => (
              <div key={b} className="flex items-center gap-3 text-sm text-white/80">
                <span className="w-5 h-5 rounded-full bg-[#f47b00] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </span>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 order-1">
        <div className="w-full max-w-md">
          <h1 className="heading-3">Rejoindre OCD</h1>
          <p className="text-[#525252] mt-2 mb-8">
            Créez votre compte en moins d&apos;une minute.
          </p>

          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f1f1] rounded-full mb-6">
            <button
              onClick={() => setRole("TALENT")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
                role === "TALENT"
                  ? "bg-white text-[#0a0a0a] shadow-sm"
                  : "text-[#525252] hover:text-[#0a0a0a]"
              }`}
            >
              <User className="w-4 h-4" />
              Talent
            </button>
            <button
              onClick={() => setRole("COMPANY")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
                role === "COMPANY"
                  ? "bg-white text-[#0a0a0a] shadow-sm"
                  : "text-[#525252] hover:text-[#0a0a0a]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Entreprise
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "TALENT" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="label">Nom de l&apos;entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  required
                  minLength={6}
                />
              </div>
              <p className="helper">Au moins 6 caractères.</p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Création..." : "Créer mon compte OCD"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-[#737373] text-center">
              En vous inscrivant, vous acceptez nos conditions et notre
              politique de confidentialité.
            </p>
          </form>

          <p className="text-sm text-[#525252] mt-6 text-center">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-[#f47b00] font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
