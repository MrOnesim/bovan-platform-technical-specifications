"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2 } from "lucide-react";

interface Country {
  id: string;
  iso2: string;
  nameFr: string;
  flag: string;
}

interface Props {
  company: any;
  countries: Country[];
}

export function CompanyProfileForm({ company, countries }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(company?.logo || null);

  const [form, setForm] = useState({
    name: company?.name || "",
    industry: company?.industry || "",
    description: company?.description || "",
    website: company?.website || "",
    email: company?.email || "",
    phone: company?.phone || "",
    employeeCount: company?.employeeCount || "",
    foundedYear: company?.foundedYear || "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm({ ...form, [key]: value });
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload du logo.");
      } else {
        setLogoUrl(data.url);
      }
    } catch {
      setError("Erreur réseau lors de l'upload.");
    } finally {
      setLogoLoading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/company/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logo: logoUrl,
          employeeCount: form.employeeCount ? parseInt(form.employeeCount.toString()) : null,
          foundedYear: form.foundedYear ? parseInt(form.foundedYear.toString()) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur.");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5] space-y-6">
      <div className="flex items-start gap-5 pb-6 border-b border-[#f1f1f1]">
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-[#f1f1f1] flex items-center justify-center text-[#525252] font-semibold shrink-0">
          {logoUrl ? (
            <Image src={logoUrl} alt="Logo de l'entreprise" fill sizes="80px" className="object-cover" />
          ) : (
            company?.name?.[0]?.toUpperCase() || "OCD"
          )}
        </div>
        <div>
          <label htmlFor="logo" className="btn-light inline-flex cursor-pointer items-center gap-2">
            {logoLoading ? (
              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
            ) : (
              <Camera aria-hidden="true" className="w-4 h-4" />
            )}
            {logoLoading ? "Envoi…" : "Changer le logo"}
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={handleLogoChange}
            disabled={logoLoading}
          />
          <p className="helper mt-1">JPG, PNG, WEBP ou GIF · 5 Mo max.</p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="name">Nom de l&apos;entreprise *</label>
        <input id="name" name="name" required type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
      </div>

      <div>
        <label className="label" htmlFor="industry">Secteur d&apos;activité</label>
        <input id="industry" name="industry" type="text" value={form.industry} onChange={(e) => update("industry", e.target.value)} className="input" placeholder="ex : Technologie, Finance, Agri-business…" />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" value={form.description} onChange={(e) => update("description", e.target.value)} className="input min-h-[140px] resize-y" placeholder="Présentez votre entreprise, votre mission, vos valeurs…" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="website">Site web</label>
          <input id="website" name="website" type="url" value={form.website} onChange={(e) => update("website", e.target.value)} className="input" placeholder="https://…" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email de contact</label>
          <input id="email" name="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" placeholder="contact@entreprise.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="+221 77 123 45 67" />
        </div>
        <div>
          <label className="label" htmlFor="country">Pays</label>
          <select id="country" name="country" className="select" disabled>
            <option>{company?.countryName || "À définir (bientôt modifiable)"}</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="employeeCount">Effectif</label>
          <input id="employeeCount" name="employeeCount" type="number" min="1" value={form.employeeCount} onChange={(e) => update("employeeCount", e.target.value)} className="input" placeholder="ex : 25" />
        </div>
        <div>
          <label className="label" htmlFor="foundedYear">Année de création</label>
          <input id="foundedYear" name="foundedYear" type="number" min="1800" max={new Date().getFullYear()} value={form.foundedYear} onChange={(e) => update("foundedYear", e.target.value)} className="input" placeholder="ex : 2018" />
        </div>
      </div>

      {error && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {saved && (
        <div role="status" className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check aria-hidden="true" className="w-4 h-4" />
          Profil enregistré avec succès.
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f1f1]">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> : <Check aria-hidden="true" className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>
    </form>
  );
}
