-- Drop the old workday foreign key so holiday ids can be remapped safely.
ALTER TABLE "public"."workdays" DROP CONSTRAINT "workdays_holiday_id_fkey";

-- Rename the legacy table and its objects so a new holidays table can be created.
ALTER TABLE "public"."holidays" RENAME TO "holidays_legacy";
ALTER TABLE "public"."holidays_legacy" RENAME CONSTRAINT "holidays_pkey" TO "holidays_legacy_pkey";
ALTER SEQUENCE IF EXISTS "public"."holidays_id_seq" RENAME TO "holidays_legacy_id_seq";
ALTER INDEX IF EXISTS "public"."idx_holidays_company_date" RENAME TO "idx_holidays_legacy_company_date";
ALTER INDEX IF EXISTS "public"."uq_holidays_company_date_name" RENAME TO "uq_holidays_legacy_company_date_name";

-- Recreate holidays without a direct company_id and add the join table for scoped holidays.
CREATE TABLE "public"."holidays" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."holiday_companies" (
    "holiday_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "holiday_companies_pkey" PRIMARY KEY ("holiday_id","company_id")
);

INSERT INTO "public"."holidays" ("name", "date", "type", "is_active", "created_at", "updated_at")
SELECT
    "name",
    "date",
    "type",
    BOOL_OR("is_active") AS "is_active",
    MIN("created_at") AS "created_at",
    MAX("updated_at") AS "updated_at"
FROM "public"."holidays_legacy"
GROUP BY "name", "date", "type";

INSERT INTO "public"."holiday_companies" ("holiday_id", "company_id")
SELECT
    "holidays"."id" AS "holiday_id",
    "holidays_legacy"."company_id"
FROM "public"."holidays"
JOIN "public"."holidays_legacy"
  ON "holidays"."name" = "holidays_legacy"."name"
 AND "holidays"."date" = "holidays_legacy"."date"
 AND "holidays"."type" = "holidays_legacy"."type"
WHERE "holidays"."type" <> 'NATIONAL'
GROUP BY "holidays"."id", "holidays_legacy"."company_id";

UPDATE "public"."workdays" AS "workdays"
SET "holiday_id" = "holidays"."id"
FROM "public"."holidays_legacy"
JOIN "public"."holidays"
  ON "holidays"."name" = "holidays_legacy"."name"
 AND "holidays"."date" = "holidays_legacy"."date"
 AND "holidays"."type" = "holidays_legacy"."type"
WHERE "workdays"."holiday_id" = "holidays_legacy"."id";

DROP TABLE "public"."holidays_legacy";

CREATE UNIQUE INDEX "uq_holidays_date_name_type" ON "public"."holidays"("date", "name", "type");
CREATE INDEX "idx_holidays_date_type" ON "public"."holidays"("date", "type");
CREATE INDEX "idx_holiday_companies_company_id" ON "public"."holiday_companies"("company_id");

ALTER TABLE "public"."holiday_companies"
ADD CONSTRAINT "holiday_companies_holiday_id_fkey"
FOREIGN KEY ("holiday_id") REFERENCES "public"."holidays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."holiday_companies"
ADD CONSTRAINT "holiday_companies_company_id_fkey"
FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."workdays"
ADD CONSTRAINT "workdays_holiday_id_fkey"
FOREIGN KEY ("holiday_id") REFERENCES "public"."holidays"("id") ON DELETE SET NULL ON UPDATE CASCADE;
