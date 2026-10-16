"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { navigateAfterAuthChange } from "@/lib/utils";
import { ArrowRight, Mail, Lock, User, Building2, Check } from "lucide-react";

interface Country {
  id: string;
  iso2: string;
  nameFr: string;
  flag: string;
}

interface Props {
  countries: Country[];
}

export function RegisterForm({ countries }: Props) {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"TALENT" | "COMPANY">(
    (searchParams.get("role") as "TALENT" | "COMPANY") || "TALENT"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryIso2, setCountryIso2] = useState("");
  const [cityName, setCityName] = useState("");
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
          countryIso2: countryIso2 || undefined,
          cityName: cityName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur d'inscription.");
      } else {
        navigateAfterAuthChange(
          role === "COMPANY" ? "/company/dashboard" : "/dashboard"
        );
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  const country = countries.find((c) => c.iso2 === countryIso2);

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
            Rejoignez la première communauté panafricaine qui valorise les talents du continent et aide les entreprises à les découvrir.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 order-1">
        <div className="w-full max-w-md">
          <h1 className="heading-3">Rejoindre OCD</h1>
          <p className="text-[#525252] mt-2 mb-8">Créez votre compte en moins d&apos;une minute.</p>

          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f1f1] rounded-full mb-6">
            <button
              type="button"
              onClick={() => setRole("TALENT")}
              aria-pressed={role === "TALENT"}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition ${
                role === "TALENT"
                  ? "bg-white text-[#0a0a0a] shadow-sm"
                  : "text-[#525252] hover:text-[#0a0a0a]"
              }`}
            >
              <User aria-hidden="true" className="w-4 h-4" />
              Talent
            </button>
            <button
              type="button"
              onClick={() => setRole("COMPANY")}
              aria-pressed={role === "COMPANY"}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition ${
                role === "COMPANY"
                  ? "bg-white text-[#0a0a0a] shadow-sm"
                  : "text-[#525252] hover:text-[#0a0a0a]"
              }`}
            >
              <Building2 aria-hidden="true" className="w-4 h-4" />
              Entreprise
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "TALENT" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="firstName">Prénom</label>
                  <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="label" htmlFor="lastName">Nom</label>
                  <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" required />
                </div>
              </div>
            ) : (
              <div>
                <label className="label" htmlFor="companyName">Nom de l&apos;entreprise</label>
                <input id="companyName" name="companyName" type="text" autoComplete="organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input" required />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="countryIso2">Pays</label>
                <select
                  id="countryIso2"
                  name="countryIso2"
                  className="select"
                  value={countryIso2}
                  onChange={(e) => {
                    setCountryIso2(e.target.value);
                    setCityName("");
                  }}
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.iso2}>
                      {c.flag} {c.nameFr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="cityName">Ville</label>
                <input id="cityName" name="cityName" type="text" className="input" value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder={country ? "ex : Dakar…" : "Votre ville"} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="registerEmail">Email</label>
              <input id="registerEmail" name="email" type="email" autoComplete="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
            </div>

            <div>
              <label className="label" htmlFor="registerPassword">Mot de passe</label>
              <input id="registerPassword" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required minLength={6} />
              <p className="helper">Au moins 6 caractères.</p>
            </div>

            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Création…" : "Créer mon compte OCD"}
              <ArrowRight className="w-4 h-4" />
            </button>
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
