-- 0001_inquiries.sql
-- Demandes de réservation envoyées depuis la page /contact.
--
-- Le projet n'avait pas de dossier de migrations (le schéma était poussé avec
-- drizzle-kit). Ce fichier est idempotent : il peut être rejoué sans risque.
--
--   psql "$DATABASE_URL" -f db/migrations/0001_inquiries.sql
--
-- ou, si vous préférez drizzle-kit : npx drizzle-kit push

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
    CREATE TYPE "inquiry_status" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "inquiries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "business" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "package_label" text,
  "message" text NOT NULL,
  "source" text NOT NULL DEFAULT 'site',
  "status" "inquiry_status" NOT NULL DEFAULT 'NEW',
  "ip_hash" text,
  "user_agent" text,
  "email_sent_at" timestamp,
  "email_error" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "inquiries_created_idx" ON "inquiries" ("created_at");
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries" ("status");
CREATE INDEX IF NOT EXISTS "inquiries_email_idx" ON "inquiries" ("email");
