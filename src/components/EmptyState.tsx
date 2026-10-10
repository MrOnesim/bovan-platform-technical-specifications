import Link from "next/link";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  /** Rendered under the copy. Usually a "clear filters" link. */
  action?: React.ReactNode;
  /** Set when the list is empty because of a search rather than genuinely. */
  filtered?: boolean;
}

/**
 * Shown when a list returns nothing. Without this the user stares at a blank
 * area and cannot tell whether the site is broken or there is genuinely no
 * result for what they asked for.
 */
export function EmptyState({
  title,
  description,
  action,
  filtered = false,
}: EmptyStateProps) {
  return (
    <div className="col-span-full bg-white rounded-2xl border border-[#e5e5e5] px-6 py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-[#f47b00]/10 text-[#f47b00] flex items-center justify-center mx-auto">
        <SearchX aria-hidden="true" className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-lg mt-4">{title}</h3>
      <p className="text-[#525252] text-sm mt-2 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action ? (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {action}
        </div>
      ) : (
        filtered && (
          <Link href="." className="btn-light mt-6">
            Réinitialiser les filtres
          </Link>
        )
      )}
    </div>
  );
}