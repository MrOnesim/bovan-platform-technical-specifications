"use client";

import { useEffect } from "react";

/* Catches failures in the root layout itself, where error.tsx cannot run.
   Must render its own <html>/<body>. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#fafafa",
          color: "#0a0a0a",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "26rem" }}>
          <div
            style={{
              width: "4rem",
              height: "4rem",
              margin: "0 auto 1.5rem",
              borderRadius: "9999px",
              background: "rgba(244,123,0,0.1)",
              color: "#f47b00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
            Quelque chose a cassé.
          </h1>
          <p style={{ marginTop: "1rem", color: "#525252", lineHeight: 1.6 }}>
            L&apos;application a rencontré une erreur inattendue. Réessayez, ou
            revenez plus tard.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              border: 0,
              background: "#f47b00",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#a3a3a3" }}>
              Réf. {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}