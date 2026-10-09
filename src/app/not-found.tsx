import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f47b00]/10 text-[#f47b00] mb-6">
          <Compass className="w-7 h-7" />
        </div>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="heading-3 mt-3">Cette page est introuvable.</h1>
        <p className="text-[#525252] mt-4 leading-relaxed">
          Le lien est peut-être obsolète, ou la page a été déplacée. Les
          opportunités, elles, sont toujours dehors.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/opportunites" className="btn-outline">
            Voir les opportunités
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}