import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
  title: string;
  description: string;
  active?: string;
  sidebar: React.ReactNode;
  backHref: string;
  backLabel: string;
}

export function ComingSoon({
  title,
  description,
  sidebar,
  backHref,
  backLabel,
}: Props) {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container-bovan py-8">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          {sidebar}
          <div className="space-y-6">
            <div>
              <Link
                href={backHref}
                className="text-sm text-[#737373] hover:text-[#0a0a0a] inline-flex items-center gap-1 mb-4"
              >
                ← {backLabel}
              </Link>
              <h1 className="page-title">
                {title}
              </h1>
              <p className="text-[#525252] mt-1">{description}</p>
            </div>

            <div className="bg-white rounded-2xl p-12 border border-[#e5e5e5] text-center">
              <div className="w-16 h-16 rounded-full bg-[#f47b00]/10 text-[#f47b00] flex items-center justify-center mx-auto">
                <Clock aria-hidden="true" className="w-7 h-7" />
              </div>
              <h2 className="font-bold text-xl mt-4">Bientôt disponible</h2>
              <p className="text-[#737373] mt-2 max-w-md mx-auto">
                Cette section arrive très prochainement. L&apos;équipe OCD
                travaille pour vous offrir la meilleure expérience.
              </p>
              <Link href={backHref} className="btn-primary mt-6">
                Retour au tableau de bord
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
