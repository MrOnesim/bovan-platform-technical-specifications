"use client";

import { navigateAfterAuthChange } from "@/lib/utils";

export function LogoutButton({
  className,
}: {
  className?: string;
}) {
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    navigateAfterAuthChange("/");
  }
  return (
    <button onClick={handleLogout} className={className} type="button">
      Déconnexion
    </button>
  );
}
