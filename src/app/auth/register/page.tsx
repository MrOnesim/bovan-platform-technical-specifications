import { Suspense } from "react";
import { db } from "@/db";
import { countries } from "@/db/schema";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const allCountries = await db.select().from(countries).orderBy(countries.nameFr);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement…</div>}>
      <RegisterForm countries={allCountries} />
    </Suspense>
  );
}
