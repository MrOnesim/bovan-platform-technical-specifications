import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clapperboard,
  MessageCircle,
  Megaphone,
  Palette,
  Radio,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const steps = [
  { number: "01", title: "Vous réservez", text: "Choisissez une formule et échangez avec l’équipe OCD pour définir le créneau et les besoins de votre activité." },
  { number: "02", title: "On prépare le direct", text: "Vous venez avec vos produits et votre téléphone. L’équipe prépare l’espace, le matériel et le déroulé de la présentation." },
  { number: "03", title: "Vous présentez", text: "Parlez de votre activité, montrez vos produits, annoncez vos prix et partagez vos moyens de contact avec l’audience." },
  { number: "04", title: "Vous faites le suivi", text: "Répondez aux messages et relancez les personnes intéressées après la diffusion pour transformer les échanges en ventes." },
];

const services = [
  { icon: Video, title: "Diffusion en direct", text: "Une présentation vivante de vos produits, services, entreprise ou point de vente." },
  { icon: Megaphone, title: "Publicité commerciale", text: "Une mise en avant de votre activité auprès de la communauté et sur les réseaux sociaux." },
  { icon: Palette, title: "Création d’affiches", text: "Des visuels promotionnels pour annoncer votre passage et accompagner votre communication." },
  { icon: Sparkles, title: "Stories & contenus", text: "Des publications courtes pour prolonger la visibilité avant ou après votre direct." },
  { icon: Clapperboard, title: "Décor & régie", text: "Un espace de présentation préparé et une équipe qui coordonne le déroulement du live." },
  { icon: MessageCircle, title: "Interaction en direct", text: "Les internautes peuvent poser leurs questions et demander comment vous joindre ou commander." },
];

const audiences = ["Commerçants & distributeurs", "Mode & accessoires", "Téléphones & électronique", "Restaurants & alimentation", "Artisans & créateurs", "Prestataires de services", "Entreprises & marques", "Entrepreneurs locaux"];

const packages = [
  { name: "Découverte", duration: "1 heure", price: "5 000", description: "Pour présenter une sélection de produits ou faire découvrir votre activité.", points: ["Passage en direct", "Présentation de votre offre", "Échanges avec l’audience"] },
  { name: "Visibilité", duration: "4 heures", price: "15 000", description: "Un format plus long pour prendre le temps de présenter votre catalogue.", points: ["Créneau de 4 heures", "Présentation détaillée", "Temps pour les questions"] , featured: true },
  { name: "Régularité", duration: "3 × 4 heures / semaine", price: "40 000", description: "Trois passages dans la semaine pour répéter votre présence et vos offres.", points: ["3 passages de 4 heures", "Présence répartie sur la semaine", "Suivi des demandes reçues"] },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#fbf9f6] text-[#1d1a17]">
      <section className="ocd-hero relative isolate bg-[#171512] text-white">
        <div aria-hidden="true" className="ocd-hero-glow" />
        <div className="container-bovan relative z-10 grid min-h-[680px] items-center gap-12 py-14 sm:py-16 md:min-h-[740px] md:grid-cols-[1.02fr_.98fr] md:py-20 lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold tracking-[.12em] text-white/75 uppercase">
              <span className="h-2 w-2 rounded-full bg-[#ff9a3d] shadow-[0_0_14px_#f47b00]" />
              Votre activité mérite d’être vue
            </div>
            <h1 className="max-w-3xl text-[clamp(3rem,8vw,5.25rem)] leading-[.98] font-semibold tracking-[-.065em]">
              Faites découvrir
              <br />
              votre activité
              <br />
              <span className="text-[#ff9a3d]">en direct.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              OCD accompagne les entrepreneurs, commerçants et artisans pour présenter leurs produits et services en live, échanger avec le public et faire grandir leur visibilité.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact#reservation" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#f47b00] px-6 py-3.5 font-semibold text-white shadow-[0_12px_34px_-14px_rgba(244,123,0,.9)] transition hover:-translate-y-0.5 hover:bg-[#ff8b17]">
                Réserver un passage <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#comment-ca-marche" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                Découvrir le concept <ArrowDown className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-white/45">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9a3d]" />
              Les performances dépendent de l’audience réelle, de l’offre et du suivi commercial. OCD ne garantit pas un volume de vues ni de ventes.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] md:ml-auto">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-[#f47b00]/15 blur-3xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-[#30251d] shadow-[0_40px_100px_-38px_rgba(0,0,0,.9)] sm:rounded-[2.5rem]">
              <Image
                src="/images/Bovann.jpeg"
                alt="Bovann, visage de la communauté OCD"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover object-[center_32%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#171512] via-[#171512]/10 to-black/20" />
              <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 sm:inset-x-7 sm:top-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-[10px] font-bold tracking-[.16em] text-white uppercase backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#ff684f]" />
                  L’esprit du direct
                </span>
                <span className="rounded-full border border-white/15 bg-black/25 px-3 py-2 text-[10px] font-medium tracking-[.12em] text-white/80 uppercase backdrop-blur-md">
                  Communauté OCD
                </span>
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[#171512]/65 p-5 backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[.18em] text-[#ffad62] uppercase">La vitrine prend vie</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Présentez. Échangez.</p>
                    <p className="mt-1 text-sm text-white/65">Faites découvrir votre activité.</p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f47b00] text-white shadow-lg shadow-black/20">
                    <Video className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#292520] px-4 py-3 shadow-xl sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f47b00]/15 text-[#ff9a3d]"><Radio className="h-5 w-5" /></span>
              <div><p className="text-xs font-semibold text-white">Ensemble, en direct</p><p className="text-[10px] text-white/55">Une expérience à préparer</p></div>
            </div>
          </div>
        </div>
        <div className="container-bovan relative z-10 pb-9">
          <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center">
            <span>Un format de promotion pensé pour les entrepreneurs.</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-[#f47b00]" /> Audience House of Challenge annoncée : 3 à 4 millions d’abonnés — statistiques et audience active à vérifier.</span>
          </div>
        </div>
      </section>

      <section id="concept" className="container-bovan py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div><p className="eyebrow">Le concept OCD</p><h2 className="heading-2 mt-3">La visibilité, <span className="text-[#f47b00]">en vrai.</span></h2></div>
          <p className="max-w-2xl text-base leading-7 text-[#655e56] md:justify-self-end md:text-lg">Votre savoir-faire mérite plus qu’une publication qui défile. OCD vous accompagne dans une présentation commerciale en direct, pour montrer vos produits, répondre aux questions et faciliter la prise de contact avec de nouveaux clients.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[{ n: "01", title: "Montrer", text: "Mettez des visages, des détails et une histoire derrière votre offre." }, { n: "02", title: "Échanger", text: "Répondez aux questions du public pendant la présentation." }, { n: "03", title: "Convertir", text: "Poursuivez la conversation après le direct et suivez vos prospects." }].map((item) => <div key={item.n} className="group rounded-3xl border border-[#e9e3dc] bg-white p-6 shadow-[0_12px_38px_-30px_rgba(55,39,25,.35)] transition duration-300 hover:-translate-y-1 hover:border-[#f47b00]/35 hover:shadow-[0_24px_50px_-32px_rgba(55,39,25,.3)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1e2] text-xs font-bold tracking-[.12em] text-[#c56200] transition group-hover:bg-[#f47b00] group-hover:text-white">{item.n}</span><h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#716a62]">{item.text}</p></div>)}
        </div>
      </section>

      <section id="comment-ca-marche" className="bg-[#f1ece5] py-20 md:py-28">
        <div className="container-bovan">
          <div className="max-w-2xl"><p className="eyebrow">Simple, de la réservation au suivi</p><h2 className="heading-2 mt-3">Comment ça <span className="text-[#f47b00]">marche ?</span></h2><p className="mt-4 leading-7 text-[#655e56]">Une équipe vous accompagne à chaque étape. Vous restez au cœur de la présentation : personne ne connaît votre activité mieux que vous.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((step) => <article key={step.number} className="relative rounded-3xl border border-white bg-white/90 p-6 shadow-[0_14px_50px_-42px_rgba(55,39,25,.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-38px_rgba(55,39,25,.35)]"><span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[.16em] text-[#c56200]"><span className="h-px w-5 bg-[#f47b00]/50" /> ÉTAPE {step.number}</span><h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#716a62]">{step.text}</p></article>)}</div>
        </div>
      </section>

      <section id="services" className="container-bovan py-20 md:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Un accompagnement complet</p><h2 className="heading-2 mt-3">Plus qu’un <span className="text-[#f47b00]">direct.</span></h2></div><p className="max-w-md text-sm leading-6 text-[#716a62]">Composez une présence cohérente autour de votre passage. Les prestations incluses varient selon la formule et restent à confirmer lors de la réservation.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <article key={service.title} className="rounded-2xl border border-[#e9e3dc] bg-white p-6 transition hover:-translate-y-1 hover:border-[#f47b00]/40 hover:shadow-lg"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1e2] text-[#e46c00]"><service.icon className="h-5 w-5" /></span><h3 className="mt-5 font-semibold">{service.title}</h3><p className="mt-2 text-sm leading-6 text-[#716a62]">{service.text}</p></article>)}</div>
      </section>

      <section id="public-cible" className="bg-[#171512] py-20 text-white md:py-24">
        <div className="container-bovan grid gap-10 md:grid-cols-[.85fr_1.15fr] md:items-center">
          <div><p className="eyebrow text-[#ff9a3d]">Pour qui ?</p><h2 className="heading-2 mt-3 text-white">Les activités <span className="text-[#ff9a3d]">qui font vivre nos villes.</span></h2><p className="mt-4 max-w-md leading-7 text-white/60">Du commerce de proximité aux marques en croissance, OCD ouvre un espace de présentation à celles et ceux qui ont quelque chose à proposer.</p></div>
          <div className="grid grid-cols-2 gap-3">{audiences.map((audience) => <div key={audience} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm text-white/80 sm:p-4"><Check className="h-4 w-4 shrink-0 text-[#ff9a3d]" />{audience}</div>)}</div>
        </div>
      </section>

      <section id="tarifs" className="container-bovan py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">Des formules accessibles</p><h2 className="heading-2 mt-3">Votre prochain passage <span className="text-[#f47b00]">commence ici.</span></h2><p className="mt-4 text-sm leading-6 text-[#716a62]">Tarifs communiqués dans la présentation initiale. Ils sont indicatifs et doivent être confirmés par OCD avant toute réservation.</p></div>
        <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">{packages.map((pack) => <article key={pack.name} className={`relative flex flex-col rounded-3xl border p-6 sm:p-7 ${pack.featured ? "border-[#f47b00] bg-[#fff7ee] shadow-[0_24px_70px_-44px_rgba(198,87,0,.65)]" : "border-[#e9e3dc] bg-white"}`}>
          {pack.featured && <span className="absolute -top-3 left-6 rounded-full bg-[#f47b00] px-3 py-1 text-[10px] font-bold tracking-[.12em] text-white uppercase">Formule populaire</span>}
          <p className="text-sm font-semibold text-[#716a62]">{pack.name}</p><p className="mt-2 text-3xl font-semibold tracking-[-.04em]">{pack.duration}</p><p className="mt-5 flex items-baseline gap-1"><span className="text-4xl font-semibold tracking-[-.05em]">{pack.price}</span><span className="text-sm text-[#716a62]">FCFA</span></p><p className="mt-3 min-h-12 text-sm leading-6 text-[#716a62]">{pack.description}</p><div className="my-5 h-px bg-[#e9e3dc]"/><ul className="mb-7 space-y-3">{pack.points.map((point) => <li key={point} className="flex gap-2 text-sm text-[#49433d]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e46c00]" />{point}</li>)}</ul><Link href={`/contact?formule=${encodeURIComponent(pack.name)}#reservation`} className={`mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${pack.featured ? "bg-[#f47b00] text-white hover:bg-[#c56200]" : "border border-[#d9d0c6] text-[#29231d] hover:border-[#f47b00] hover:text-[#c56200]"}`}>Demander cette formule <ArrowRight className="h-4 w-4" /></Link>
        </article>)}</div>
        <p className="mt-5 text-center text-xs leading-5 text-[#81796f]">La disponibilité, les prestations exactes et les conditions de réservation sont à confirmer avec l’équipe OCD. La visibilité ne constitue pas une garantie de vente.</p>
      </section>

      <section className="container-bovan pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f47b00] to-[#c95600] px-6 py-12 text-white shadow-[0_30px_75px_-48px_rgba(158,65,0,.75)] sm:px-10 md:px-14 md:py-16">
          <div aria-hidden="true" className="absolute -top-32 -right-20 h-80 w-80 rounded-full border border-white/20"/><div aria-hidden="true" className="absolute -top-20 -right-8 h-56 w-56 rounded-full border border-white/20"/>
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-white/75 uppercase">À votre tour</p><h2 className="mt-3 text-3xl leading-tight font-semibold tracking-[-.04em] sm:text-4xl">Votre activité a une histoire.<br className="hidden sm:block"/> Faisons-la découvrir.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/85">Parlez-nous de votre activité et de la formule qui vous intéresse. Nous confirmerons ensemble les disponibilités et les modalités.</p></div><Link href="/contact#reservation" className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-[#b74f00] transition hover:-translate-y-0.5 hover:bg-[#fff4e9]">Parler à OCD <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
      <section className="container-bovan pb-16"><details className="group mx-auto max-w-3xl rounded-2xl border border-[#e9e3dc] bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">Qu’est-ce qui est inclus dans chaque formule ?<ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180"/></summary><p className="mt-4 text-sm leading-6 text-[#716a62]">Les informations présentées ici reprennent les formats et tarifs annoncés initialement. Le détail des prestations (affiche, stories, décor, régie, durée et créneau) doit être confirmé par OCD au moment de la réservation.</p></details></section>
    </div>
  );
}
