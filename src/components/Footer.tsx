import Link from "next/link";
import { ArrowUpRight, Radio, Video } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#171512] text-white">
      <div className="container-bovan py-14 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_.7fr_.7fr]">
          <div>
            <Link href="/" aria-label="OCD — accueil" className="inline-flex rounded-lg bg-white px-3 py-2"><Logo showText={false} /></Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">OCD accompagne les entrepreneurs et les professionnels dans la promotion de leurs produits et services en direct sur les réseaux sociaux.</p>
            <p className="mt-4 max-w-sm text-xs leading-5 text-white/40">Les chiffres d’audience et tarifs affichés sont indicatifs et doivent être confirmés. Une diffusion ne garantit pas de ventes.</p>
          </div>
          <div><h2 className="text-sm font-semibold text-white">Découvrir</h2><ul className="mt-4 space-y-3 text-sm text-white/55"><li><Link href="/#concept" className="hover:text-[#ff9a3d]">Le concept</Link></li><li><Link href="/#comment-ca-marche" className="hover:text-[#ff9a3d]">Comment ça marche</Link></li><li><Link href="/#services" className="hover:text-[#ff9a3d]">Services</Link></li><li><Link href="/#tarifs" className="hover:text-[#ff9a3d]">Formules indicatives</Link></li></ul></div>
          <div><h2 className="text-sm font-semibold text-white">Parlons de votre activité</h2><p className="mt-4 text-sm leading-6 text-white/55">Demandez des informations ou un créneau de présentation.</p><Link href="/contact#reservation" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#ff9a3d] hover:text-white">Contacter OCD <ArrowUpRight className="h-4 w-4" /></Link><div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/45" aria-label="Promotion vidéo et en direct"><Video className="h-4 w-4 text-[#ff9a3d]"/><Radio className="h-4 w-4"/> Vidéo & direct</div></div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} OCD. Tous droits réservés.</p><p>La visibilité est un levier. Les résultats dépendent de chaque activité.</p></div>
      </div>
    </footer>
  );
}
