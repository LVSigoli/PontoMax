ALTER TABLE "public"."time_entries"
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "accuracy_meters" DOUBLE PRECISION;
