import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Handshake, Radio, ShieldAlert, Target, Users } from "lucide-react";

export const metadata = {
  title: "À propos d’OCD",
  description: "La mission, le fonctionnement et les principes de la plateforme de promotion commerciale OCD.",
};

const objectives = [
  "Aider les professionnels à toucher un public plus large.",
  "Présenter des produits et services de façon vivante et interactive.",
  "Accroître la notoriété des activités participantes.",
  "Faciliter la prise de contact et le suivi des prospects.",
  "Accompagner les petites entreprises dans leur communication numérique.",
  "Créer des liens entre vendeurs, entrepreneurs et consommateurs.",
];

const indicators = ["Entrepreneurs inscrits et fidélisés", "Lives réalisés et audience moyenne", "Commentaires et interactions", "Appels et messages reçus", "Prospects et ventes déclarés", "Chiffre d’affaires et satisfaction client"];

export default function AboutPage() {
  return (
    <div className="bg-[#fbf9f6]">
      <section className="relative overflow-hidden bg-[#171512] py-20 text-white md:py-28">
        <div aria-hidden="true" className="absolute -top-40 right-[-8rem] h-[32rem] w-[32rem] rounded-full border border-[#f47b00]/20" />
        <div aria-hidden="true" className="absolute -top-20 right-[-2rem] h-[20rem] w-[20rem] rounded-full border border-[#f47b00]/20" />
        <div className="container-bovan relative z-10 max-w-5xl">
          <p className="eyebrow text-[#ff9a3d]">À propos d’OCD</p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-.05em] sm:text-6xl">Mettre les entrepreneurs <span className="text-[#ff9a3d]">en lumière.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">OCD est un dispositif de promotion commerciale qui aide les commerçants, artisans, prestataires et entreprises à présenter leur activité sur les réseaux sociaux, notamment à travers des émissions en direct.</p>
          <div className="mt-9"><Link href="/#comment-ca-marche" className="inline-flex items-center gap-2 rounded-full bg-[#f47b00] px-5 py-3 font-semibold text-white transition hover:bg-[#c56200]">Découvrir le fonctionnement <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="container-bovan py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[.78fr_1.22fr]">
          <div><p className="eyebrow">Notre ambition</p><h2 className="heading-2 mt-3">Transformer la visibilité en <span className="text-[#f47b00]">rencontres utiles.</span></h2></div>
          <div className="space-y-4 text-base leading-7 text-[#655e56]"><p>Nous voulons donner aux professionnels un espace pour raconter ce qu’ils font, montrer leurs produits et échanger directement avec des consommateurs potentiellement intéressés.</p><p>Un live peut susciter l’attention et ouvrir une conversation. Les résultats commerciaux dépendent ensuite de plusieurs facteurs : l’audience réellement présente, l’offre, le prix, la disponibilité des produits et le suivi des demandes.</p><p className="rounded-2xl border border-[#f2d7bb] bg-[#fff5e9] p-5 text-sm leading-6 text-[#6c4a2c]">L’audience de 3 à 4 millions d’abonnés associée au compte House of Challenge est une donnée annoncée dans la présentation initiale. Elle doit être vérifiée et ne représente pas le nombre de spectateurs garantis par live.</p></div>
        </div>
      </section>

      <section className="bg-[#f1ece5] py-16 md:py-20">
        <div className="container-bovan">
          <div className="max-w-2xl"><p className="eyebrow">Ce que nous voulons rendre possible</p><h2 className="heading-2 mt-3">Des objectifs <span className="text-[#f47b00]">concrets.</span></h2></div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{objectives.map((objective, index) => <div key={objective} className="flex gap-3 rounded-2xl bg-white p-5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff1e2] text-xs font-bold text-[#d96300]">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-6 text-[#49433d]">{objective}</p></div>)}</div>
        </div>
      </section>

      <section className="container-bovan py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div><p className="eyebrow">Nos principes de fonctionnement</p><h2 className="heading-2 mt-3">Une promesse claire, <span className="text-[#f47b00]">des résultats mesurés.</span></h2><div className="mt-7 space-y-4">{[{ icon: Radio, title: "Préparer le direct", body: "Définir en amont le créneau, le format, le matériel et les prestations réellement comprises." }, { icon: Handshake, title: "Clarifier les engagements", body: "Présenter sans ambiguïté les conditions, les tarifs, les limites et les responsabilités de chacun." }, { icon: BarChart3, title: "Suivre ce qui compte", body: "Mesurer l’audience et les interactions, puis demander un retour sur les contacts et ventes générés." }].map((item) => <article key={item.title} className="flex gap-4 rounded-2xl border border-[#e9e3dc] bg-white p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff1e2] text-[#df6800]"><item.icon className="h-5 w-5" /></span><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-[#716a62]">{item.body}</p></div></article>)}</div></div>
          <div className="rounded-3xl bg-[#171512] p-7 text-white sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#ff9a3d]"><Target className="h-6 w-6" /></span><h3 className="mt-6 text-2xl font-semibold tracking-tight">Indicateurs de réussite</h3><p className="mt-3 text-sm leading-6 text-white/60">La réussite ne se résume pas au nombre d’abonnés. OCD devra suivre la qualité de l’audience, l’engagement et les retombées commerciales.</p><ul className="mt-6 space-y-3">{indicators.map((indicator) => <li key={indicator} className="flex items-start gap-3 text-sm text-white/80"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9a3d]" />{indicator}</li>)}</ul></div>
        </div>
      </section>

      <section className="container-bovan pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-[#f0d6c0] bg-[#fff7ef] p-7 sm:p-9"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f47b00]/10 text-[#de6600]"><ShieldAlert className="h-5 w-5" /></span><h3 className="mt-5 text-xl font-semibold">Points de vigilance</h3><p className="mt-3 text-sm leading-6 text-[#716a62]">Vérifier les statistiques et l’audience moyenne des lives, formaliser les conditions d’utilisation du compte partenaire, sécuriser la connexion et clarifier les prestations promises. Une présence en ligne ne garantit ni ventes ni conversion.</p></article>
          <article className="rounded-3xl border border-[#e9e3dc] bg-white p-7 sm:p-9"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1e2] text-[#de6600]"><Users className="h-5 w-5" /></span><h3 className="mt-5 text-xl font-semibold">Construire dans la durée</h3><p className="mt-3 text-sm leading-6 text-[#716a62]">À terme, OCD pourra développer des émissions thématiques, des partenariats avec d’autres créateurs, des journées promotionnelles, une réservation en ligne et un suivi des performances — selon les résultats et les moyens disponibles.</p></article>
        </div>
      </section>
    </div>
  );
}
