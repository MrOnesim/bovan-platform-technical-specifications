"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Check, Camera } from "lucide-react";
import { initials } from "@/lib/utils";

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

interface Props {
  talent: any;
  user: any;
  countries: Country[];
  allSkills: Skill[];
  initialSkills: string[];
}

export function ProfileForm({ talent, user, countries, allSkills, initialSkills }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    headline: talent?.headline || "",
    profession: talent?.profession || "",
    biography: talent?.biography || "",
    availability: talent?.availability || "OPEN_TO_OPPORTUNITIES",
    experienceLevel: talent?.experienceLevel || "ENTRY",
    yearsExperience: talent?.yearsExperience || 0,
    salaryExpectation: talent?.salaryExpectation || "",
    currency: talent?.currency || "USD",
    remotePreference: talent?.remotePreference || "ANY",
    countryIso2: "",
    linkedinUrl: talent?.linkedinUrl || "",
    githubUrl: talent?.githubUrl || "",
    websiteUrl: talent?.websiteUrl || "",
    portfolioUrl: talent?.portfolioUrl || "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm({ ...form, [key]: value });
  }

  function toggleSkill(name: string) {
    setSelectedSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  function addCustom() {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload de la photo.");
      } else {
        setAvatarUrl(data.url);
      }
    } catch {
      setError("Erreur réseau lors de l'upload.");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          avatarUrl,
          yearsExperience: parseInt(form.yearsExperience.toString()) || 0,
          salaryExpectation: form.salaryExpectation
            ? parseInt(form.salaryExpectation.toString())
            : null,
          skills: selectedSkills,
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
      <div className="flex items-center gap-5 pb-6 border-b border-[#f1f1f1]">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-[#f47b00] to-[#c56200] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Photo de profil"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            initials(form.firstName, form.lastName)
          )}
        </div>
        <div>
          <label
            htmlFor="avatar"
            className="btn-light inline-flex cursor-pointer items-center gap-2"
          >
            {avatarLoading ? (
              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
            ) : (
              <Camera aria-hidden="true" className="w-4 h-4" />
            )}
            {avatarLoading ? "Envoi…" : "Changer la photo"}
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={handleAvatarChange}
            disabled={avatarLoading}
          />
          <p className="helper mt-1">JPG, PNG, WEBP ou GIF · 5 Mo max.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="firstName">Prénom</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Nom</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="headline">Titre professionnel *</label>
        <input
          id="headline"
          name="headline"
          required
          type="text"
          value={form.headline}
          onChange={(e) => update("headline", e.target.value)}
          className="input"
          placeholder="ex : Développeur Web Full Stack"
        />
        <p className="helper">Une phrase qui dit qui vous êtes.</p>
      </div>

      <div>
        <label className="label" htmlFor="profession">Profession / Métier</label>
        <input
          id="profession"
          name="profession"
          type="text"
          value={form.profession}
          onChange={(e) => update("profession", e.target.value)}
          className="input"
          placeholder="ex : Développeur, Designer, Marketing…"
        />
      </div>

      <div>
        <label className="label" htmlFor="biography">À propos</label>
        <textarea
          id="biography"
          name="biography"
          value={form.biography}
          onChange={(e) => update("biography", e.target.value)}
          className="input min-h-[140px] resize-y"
          placeholder="Présentez-vous, vos expériences, votre vision…"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="availability">Disponibilité *</label>
          <select
            id="availability"
            name="availability"
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
            className="select"
          >
            <option value="AVAILABLE">🟢 Disponible immédiatement</option>
            <option value="OPEN_TO_OPPORTUNITIES">
              Ouvert aux opportunités
            </option>
            <option value="EMPLOYED">En poste (ouvert à l&apos;écoute)</option>
            <option value="NOT_AVAILABLE">Non disponible</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="experienceLevel">Niveau d&apos;expérience</label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={(e) => update("experienceLevel", e.target.value)}
            className="select"
          >
            <option value="INTERN">Stagiaire</option>
            <option value="ENTRY">Débutant (0-1 an)</option>
            <option value="JUNIOR">Junior (1-3 ans)</option>
            <option value="MID">Intermédiaire (3-5 ans)</option>
            <option value="SENIOR">Senior (5-10 ans)</option>
            <option value="LEAD">Lead (10+ ans)</option>
            <option value="EXECUTIVE">Direction</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="yearsExperience">Années d&apos;expérience</label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min="0"
            value={form.yearsExperience}
            onChange={(e) => update("yearsExperience", parseInt(e.target.value) || 0)}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="salaryExpectation">Prétention salariale</label>
          <input
            id="salaryExpectation"
            name="salaryExpectation"
            type="number"
            value={form.salaryExpectation}
            onChange={(e) => update("salaryExpectation", e.target.value)}
            className="input"
            placeholder="ex : 25000"
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
            <option value="XOF">XOF</option>
            <option value="XAF">XAF</option>
            <option value="NGN">NGN</option>
            <option value="KES">KES</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="remotePreference">Mode de travail préféré</label>
          <select
            id="remotePreference"
            name="remotePreference"
            value={form.remotePreference}
            onChange={(e) => update("remotePreference", e.target.value)}
            className="select"
          >
            <option value="ON_SITE">Sur site</option>
            <option value="HYBRID">Hybride</option>
            <option value="REMOTE">Full remote</option>
            <option value="ANY">Pas de préférence</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="countryIso2">Pays</label>
          <select id="countryIso2" name="countryIso2" className="select" disabled>
            <option>À définir (bientôt modifiable)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="skillInput">Compétences</label>
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
                addCustom();
              }
            }}
            className="input"
            placeholder="Ajouter une compétence"
          />
          <button
            type="button"
            onClick={addCustom}
            aria-label="Ajouter la compétence saisie"
            className="btn-light shrink-0"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allSkills.slice(0, 24).map((s) => (
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

      <div>
        <h3 className="font-semibold mb-3">Liens</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="linkedinUrl">LinkedIn</label>
            <input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              className="input"
              placeholder="https://linkedin.com/in/…"
            />
          </div>
          <div>
            <label className="label" htmlFor="githubUrl">GitHub</label>
            <input
              id="githubUrl"
              name="githubUrl"
              type="url"
              value={form.githubUrl}
              onChange={(e) => update("githubUrl", e.target.value)}
              className="input"
              placeholder="https://github.com/…"
            />
          </div>
          <div>
            <label className="label" htmlFor="websiteUrl">Site web</label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              value={form.websiteUrl}
              onChange={(e) => update("websiteUrl", e.target.value)}
              className="input"
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="label" htmlFor="portfolioUrl">Portfolio</label>
            <input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              value={form.portfolioUrl}
              onChange={(e) => update("portfolioUrl", e.target.value)}
              className="input"
              placeholder="https://…"
            />
          </div>
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
