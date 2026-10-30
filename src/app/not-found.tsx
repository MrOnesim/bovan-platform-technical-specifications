import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f47b00]/10 text-[#f47b00]"><Compass className="h-7 w-7" /></div>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="heading-3 mt-3">Cette page est introuvable.</h1>
        <p className="mt-4 leading-relaxed text-[#655e56]">Le lien a peut-être changé. Retrouvez OCD, ses services de promotion en direct et ses formules indicatives sur la page d’accueil.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/" className="btn-primary">Retour à l’accueil</Link><Link href="/contact#reservation" className="btn-outline">Nous contacter <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </div>
  );
}
