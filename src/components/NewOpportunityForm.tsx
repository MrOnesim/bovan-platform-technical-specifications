"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Check } from "lucide-react";

interface Country {
  id: string;
  iso2: string;
  nameFr: string;
  flag: string;
}

interface Skill {
  id: string;
  name: string;
  slug: string;
}

export function NewOpportunityForm({
  countries,
  skills,
}: {
  countries: Country[];
  skills: Skill[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    countryIso2: "",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    remote: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm({ ...form, [key]: value });
  }

  function toggleSkill(name: string) {
    setSelectedSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  function addCustomSkill() {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
          skills: selectedSkills,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur.");
      } else {
        router.push(`/opportunites/${data.slug}`);
        router.refresh();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e5e5] space-y-6">
      <div>
        <label className="label" htmlFor="title">Titre du poste *</label>
        <input
          id="title"
          name="title"
          required
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="input"
          placeholder="ex : Développeur Full Stack Senior"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          required
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="input min-h-[160px] resize-y"
          placeholder="Décrivez le poste, les missions, l'équipe, ce que vous offrez…"
        />
        <p className="helper">
          Soignez cette description : c&apos;est ce qui donne envie de postuler.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="employmentType">Type de contrat *</label>
          <select
            id="employmentType"
            name="employmentType"
            value={form.employmentType}
            onChange={(e) => update("employmentType", e.target.value)}
            className="select"
          >
            <option value="FULL_TIME">Temps plein</option>
            <option value="PART_TIME">Temps partiel</option>
            <option value="FREELANCE">Freelance</option>
            <option value="INTERNSHIP">Stage</option>
            <option value="CONTRACT">Contrat</option>
            <option value="PROJECT">Projet</option>
            <option value="VOLUNTEER">Bénévolat</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="experienceLevel">Niveau d&apos;expérience *</label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={(e) => update("experienceLevel", e.target.value)}
            className="select"
          >
            <option value="INTERN">Stagiaire</option>
            <option value="ENTRY">Débutant</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Intermédiaire</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="EXECUTIVE">Direction</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="countryIso2">Pays</label>
          <select
            id="countryIso2"
            name="countryIso2"
            value={form.countryIso2}
            onChange={(e) => update("countryIso2", e.target.value)}
            className="select"
          >
            <option value="">— Sélectionner —</option>
            {countries.map((c) => (
              <option key={c.iso2} value={c.iso2}>
                {c.flag} {c.nameFr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="location">Ville / Lieu</label>
          <input
            id="location"
            name="location"
            type="text"
            autoComplete="address-level2"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className="input"
            placeholder="ex : Cotonou, Bénin"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="salaryMin">Salaire min</label>
          <input
            id="salaryMin"
            name="salaryMin"
            type="number"
            value={form.salaryMin}
            onChange={(e) => update("salaryMin", e.target.value)}
            className="input"
            placeholder="ex : 20000"
          />
        </div>
        <div>
          <label className="label" htmlFor="salaryMax">Salaire max</label>
          <input
            id="salaryMax"
            name="salaryMax"
            type="number"
            value={form.salaryMax}
            onChange={(e) => update("salaryMax", e.target.value)}
            className="input"
            placeholder="ex : 35000"
          />
        </div>
        <div>
          <label className="label" htmlFor="currency">Devise</label>
          <select
            id="currency"
            name="currency"
            value={form.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="select"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="XOF">XOF (FCFA)</option>
            <option value="XAF">XAF (FCFA)</option>
            <option value="NGN">NGN (Naira)</option>
            <option value="KES">KES (Shilling)</option>
            <option value="ZAR">ZAR (Rand)</option>
            <option value="MAD">MAD (Dirham)</option>
            <option value="EGP">EGP (Livre)</option>
            <option value="GHS">GHS (Cedi)</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.remote}
          onChange={(e) => update("remote", e.target.checked)}
          className="w-4 h-4 rounded text-[#f47b00] focus:ring-[#f47b00]"
        />
        <span>Poste ouvert en full remote</span>
      </label>

      <div>
        <label className="label" htmlFor="skillInput">Compétences recherchées</label>
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f47b00]/10 text-[#c56200] text-sm font-medium"
              >
                {s}
                <button
                  type="button"
                  onClick={() => toggleSkill(s)}
                  aria-label={`Retirer la compétence ${s}`}
                  className="hover:bg-[#f47b00]/20 rounded-full p-0.5"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            id="skillInput"
            name="skillInput"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            className="input"
            placeholder="Ajouter une compétence (Entrée pour valider)"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            aria-label="Ajouter la compétence saisie"
            className="btn-light shrink-0"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
        {skills.length > 0 && (
          <div className="mt-3">
            <p className="helper mb-2">Suggestions :</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 16).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSkill(s.name)}
                  aria-pressed={selectedSkills.includes(s.name)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedSkills.includes(s.name)
                      ? "bg-[#f47b00] text-white border-[#f47b00]"
                      : "border-[#e5e5e5] text-[#525252] hover:border-[#f47b00]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f1f1]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-full hover:bg-[#f1f1f1] font-medium"
        >
          Annuler
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
          ) : (
            <Check aria-hidden="true" className="w-4 h-4" />
          )}
          Publier l&apos;opportunité
        </button>
      </div>
    </form>
  );
}
