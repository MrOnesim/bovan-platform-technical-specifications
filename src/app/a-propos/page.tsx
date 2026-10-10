import Link from "next/link";
import { Eye, Globe2, Users, Building2, Heart, ArrowRight } from "lucide-react";

export const metadata = {
  title: "À propos",
  description: "La plateforme panafricaine qui rend les talents visibles.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#fafafa]">
      <section className="bg-[#0a0a0a] text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 glow-orange opacity-30" />
        <div className="container-bovan relative">
          <div className="max-w-3xl">
            <p className="eyebrow text-[#ff9520]">À propos d&apos;OCD</p>
            <h1 className="heading-1 text-white mt-3">
              On construit
              <br />
              <span className="text-[#f47b00]">le pont.</span>
            </h1>
            <p className="mt-6 text-white/70 text-lg max-w-2xl leading-relaxed">
              OCD est né d&apos;un constat simple : l&apos;Afrique regorge de
              talents formidables, mais ces talents sont souvent invisibles.
              Notre mission ? Les rendre visibles et permettre aux entreprises
              de les découvrir, partout sur le continent.
            </p>
            <p className="mt-4 text-white/50 text-sm">
              Le mouvement OCD a été lancé par BOVAN.
            </p>
          </div>
        </div>
      </section>

      <section className="container-bovan py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Eye,
              title: "Se montrer",
              text: "Nous croyons que chaque talent africain mérite d'être vu. Pas d'attendre une offre : rendez votre potentiel visible.",
            },
            {
              icon: Globe2,
              title: "Explorer",
              text: "Du Cap au Caire, de Dakar à Dar es Salaam. Parcourez l'Afrique comme on parcourt un continent d'opportunités.",
            },
            {
              icon: Heart,
              title: "Connecter",
              text: "Un message, un appel, un déclic. Nous créons les conditions pour que les bonnes rencontres arrivent.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl p-6 border border-[#e5e5e5] hover:border-[#f47b00] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f47b00]/10 text-[#f47b00] flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-[#525252] leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-bovan pb-20">
        <div className="bg-linear-to-br from-[#0a0a0a] to-[#262626] text-white rounded-3xl p-10 md:p-16 text-center">
          <h2 className="heading-2 text-white">
            Les opportunités
            <br />
            <span className="text-[#f47b00]">c&apos;est dehors.</span>
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Rejoignez le mouvement. S&apos;inscrire est gratuit, et c&apos;est le
            premier pas vers votre prochaine opportunité.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register?role=talent" className="btn-primary">
              Je crée mon profil talent
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/register?role=company" className="btn-ghost">
              Je recrute
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
