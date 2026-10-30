import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CircleHelp, Mail, MessageCircle } from "lucide-react";
import { OcdInquiryForm } from "@/components/OcdInquiryForm";

export const metadata = {
  title: "Réserver un passage",
  description: "Parlez à OCD de votre activité et demandez des informations sur les formules de promotion en direct.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ formule?: string }> }) {
  const { formule } = await searchParams;
  const packageValues: Record<string, string> = {
    Découverte: "Découverte — 1 heure — 5 000 FCFA",
    Visibilité: "Visibilité — 4 heures — 15 000 FCFA",
    Régularité: "Régularité — 3 × 4 heures — 40 000 FCFA",
  };
  const initialPackage = formule ? packageValues[formule] ?? formule : "";
  return (
    <div className="min-h-screen bg-[#fbf9f6]">
      <section className="bg-[#171512] py-16 text-white md:py-20">
        <div className="container-bovan">
          <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour à l’accueil</Link>
          <p className="eyebrow text-[#ff9a3d]">Contact & réservation</p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-[-.05em] sm:text-5xl">Faisons connaître<br className="hidden sm:block"/> votre activité.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">Présentez-nous votre entreprise, votre offre et le format qui vous intéresse. L’équipe OCD pourra confirmer les tarifs, les disponibilités et les prestations incluses.</p>
        </div>
      </section>
      <section id="reservation" className="container-bovan grid gap-8 py-12 md:grid-cols-[1.15fr_.85fr] md:py-16">
        <OcdInquiryForm initialPackage={initialPackage} contactEmail={process.env.NEXT_PUBLIC_OCD_CONTACT_EMAIL ?? ""} />
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#e9e3dc] bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1e2] text-[#df6800]"><CalendarDays className="h-5 w-5" /></span><h2 className="mt-4 font-semibold">Comment se passe la réservation ?</h2><p className="mt-2 text-sm leading-6 text-[#716a62]">Après votre demande, précisez avec OCD le créneau souhaité, les produits à présenter, les besoins techniques et le détail des prestations.</p></div>
          <div className="rounded-2xl border border-[#e9e3dc] bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1e2] text-[#df6800]"><CircleHelp className="h-5 w-5" /></span><h2 className="mt-4 font-semibold">Les tarifs sont-ils définitifs ?</h2><p className="mt-2 text-sm leading-6 text-[#716a62]">Non. Les prix présentés sur le site sont ceux annoncés dans la présentation initiale et restent à confirmer avant toute réservation.</p></div>
          <div className="rounded-2xl bg-[#f1ece5] p-6"><h2 className="font-semibold">Une question avant de réserver ?</h2><p className="mt-2 text-sm leading-6 text-[#716a62]">Utilisez le formulaire pour décrire votre besoin. Les coordonnées directes d’OCD seront ajoutées dès qu’elles auront été confirmées.</p><div className="mt-4 flex items-center gap-2 text-xs text-[#82796f]"><MessageCircle className="h-4 w-4"/><span>Pas de numéro ou de réseau social communiqué pour le moment.</span></div></div>
          <Link href="/#tarifs" className="inline-flex items-center gap-2 px-1 py-2 text-sm font-semibold text-[#b85100] hover:underline">Revoir les formules <ArrowRight className="h-4 w-4"/></Link>
        </aside>
      </section>
    </div>
  );
}
