-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "document" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "cnpj" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "employee_code" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "position" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."journeys" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scale_code" TEXT NOT NULL,
    "flexible_schedule" BOOLEAN NOT NULL DEFAULT false,
    "daily_work_minutes" INTEGER NOT NULL,
    "weekly_work_minutes" INTEGER,
    "expected_entry_time" TIMESTAMP(3),
    "expected_exit_time" TIMESTAMP(3),
    "break_minutes" INTEGER NOT NULL DEFAULT 60,
    "tolerance_minutes" INTEGER NOT NULL DEFAULT 10,
    "night_shift" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_journey_assignments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "journey_id" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_journey_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."holidays" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workdays" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "holiday_id" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "scheduled_minutes" INTEGER NOT NULL DEFAULT 0,
    "worked_minutes" INTEGER NOT NULL DEFAULT 0,
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "missing_minutes" INTEGER NOT NULL DEFAULT 0,
    "night_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_holiday" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_entries" (
    "id" SERIAL NOT NULL,
    "workday_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sequence" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."adjustment_requests" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "workday_id" INTEGER NOT NULL,
    "reviewed_by_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "justification" TEXT NOT NULL,
    "review_notes" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adjustment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."point_adjustments" (
    "id" SERIAL NOT NULL,
    "adjustment_request_id" INTEGER NOT NULL,
    "time_entry_id" INTEGER,
    "action_type" TEXT NOT NULL,
    "target_kind" TEXT NOT NULL,
    "original_recorded_at" TIMESTAMP(3),
    "new_recorded_at" TIMESTAMP(3),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "actor_user_id" INTEGER,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_document_key" ON "public"."clients"("document");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "public"."companies"("cnpj");

-- CreateIndex
CREATE INDEX "idx_companies_client_id" ON "public"."companies"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "public"."users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "public"."users"("cpf");

-- CreateIndex
CREATE INDEX "idx_users_company_id" ON "public"."users"("company_id");

-- CreateIndex
CREATE INDEX "idx_users_company_role" ON "public"."users"("company_id", "role");

-- CreateIndex
CREATE INDEX "idx_journeys_company_id" ON "public"."journeys"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_journeys_company_name" ON "public"."journeys"("company_id", "name");

-- CreateIndex
CREATE INDEX "idx_user_journey_assignments_journey_id" ON "public"."user_journey_assignments"("journey_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_journey_assignments_user_start" ON "public"."user_journey_assignments"("user_id", "valid_from");

-- CreateIndex
CREATE INDEX "idx_holidays_company_date" ON "public"."holidays"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_holidays_company_date_name" ON "public"."holidays"("company_id", "date", "name");

-- CreateIndex
CREATE INDEX "idx_workdays_company_date" ON "public"."workdays"("company_id", "date");

-- CreateIndex
CREATE INDEX "idx_workdays_company_status" ON "public"."workdays"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_workdays_user_date" ON "public"."workdays"("user_id", "date");

-- CreateIndex
CREATE INDEX "idx_time_entries_user_recorded_at" ON "public"."time_entries"("user_id", "recorded_at");

-- CreateIndex
CREATE INDEX "idx_time_entries_workday_status" ON "public"."time_entries"("workday_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_time_entries_workday_sequence" ON "public"."time_entries"("workday_id", "sequence");

-- CreateIndex
CREATE INDEX "idx_adjustment_requests_company_status" ON "public"."adjustment_requests"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_adjustment_requests_user_requested_at" ON "public"."adjustment_requests"("user_id", "requested_at");

-- CreateIndex
CREATE INDEX "idx_point_adjustments_request_id" ON "public"."point_adjustments"("adjustment_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_refresh_token_key" ON "public"."auth_sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_auth_sessions_user_status" ON "public"."auth_sessions"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "public"."password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_password_reset_tokens_user_id" ON "public"."password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_company_created_at" ON "public"."audit_logs"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor_created_at" ON "public"."audit_logs"("actor_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."journeys" ADD CONSTRAINT "journeys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_journey_assignments" ADD CONSTRAINT "user_journey_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_journey_assignments" ADD CONSTRAINT "user_journey_assignments_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_journey_assignments" ADD CONSTRAINT "user_journey_assignments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."holidays" ADD CONSTRAINT "holidays_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workdays" ADD CONSTRAINT "workdays_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workdays" ADD CONSTRAINT "workdays_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workdays" ADD CONSTRAINT "workdays_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "public"."holidays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_entries" ADD CONSTRAINT "time_entries_workday_id_fkey" FOREIGN KEY ("workday_id") REFERENCES "public"."workdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustment_requests" ADD CONSTRAINT "adjustment_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustment_requests" ADD CONSTRAINT "adjustment_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustment_requests" ADD CONSTRAINT "adjustment_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustment_requests" ADD CONSTRAINT "adjustment_requests_workday_id_fkey" FOREIGN KEY ("workday_id") REFERENCES "public"."workdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_adjustments" ADD CONSTRAINT "point_adjustments_adjustment_request_id_fkey" FOREIGN KEY ("adjustment_request_id") REFERENCES "public"."adjustment_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_adjustments" ADD CONSTRAINT "point_adjustments_time_entry_id_fkey" FOREIGN KEY ("time_entry_id") REFERENCES "public"."time_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
