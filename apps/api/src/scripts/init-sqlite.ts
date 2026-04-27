import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { DatabaseSync } from 'node:sqlite';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const workspaceRoot = path.resolve(currentDirectoryPath, '../../../../');
const workspaceEnvPath = path.join(workspaceRoot, '.env');

config({ path: workspaceEnvPath });

function resolveDatabaseFilePath() {
  const databaseUrl = process.env.DATABASE_URL?.trim() || 'file:./dev.db';

  if (!databaseUrl.startsWith('file:')) {
    throw new Error('SQLite setup expects DATABASE_URL using the file: protocol.');
  }

  const relativeFilePath = databaseUrl.slice('file:'.length);
  const prismaDirectory = path.join(workspaceRoot, 'prisma');

  return path.resolve(prismaDirectory, relativeFilePath);
}

function createSchema(database: DatabaseSync) {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      legal_name TEXT,
      document TEXT NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      legal_name TEXT NOT NULL,
      trade_name TEXT,
      cnpj TEXT NOT NULL UNIQUE,
      timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_companies_client_id ON companies(client_id);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      employee_code TEXT UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cpf TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      position TEXT,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      last_login_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
    CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);

    CREATE TABLE IF NOT EXISTS journeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      scale_code TEXT NOT NULL,
      flexible_schedule BOOLEAN NOT NULL DEFAULT 0,
      daily_work_minutes INTEGER NOT NULL,
      weekly_work_minutes INTEGER,
      expected_entry_time DATETIME,
      expected_exit_time DATETIME,
      break_minutes INTEGER NOT NULL DEFAULT 60,
      tolerance_minutes INTEGER NOT NULL DEFAULT 10,
      night_shift BOOLEAN NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_journeys_company_name UNIQUE (company_id, name),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_journeys_company_id ON journeys(company_id);

    CREATE TABLE IF NOT EXISTS user_journey_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      journey_id INTEGER NOT NULL,
      created_by_id INTEGER,
      valid_from DATETIME NOT NULL,
      valid_to DATETIME,
      notes TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_user_journey_assignments_user_start UNIQUE (user_id, valid_from),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE RESTRICT,
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_user_journey_assignments_journey_id
      ON user_journey_assignments(journey_id);

    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      date DATETIME NOT NULL,
      type TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_holidays_company_date_name UNIQUE (company_id, date, name),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_holidays_company_date ON holidays(company_id, date);

    CREATE TABLE IF NOT EXISTS workdays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      holiday_id INTEGER,
      date DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      scheduled_minutes INTEGER NOT NULL DEFAULT 0,
      worked_minutes INTEGER NOT NULL DEFAULT 0,
      overtime_minutes INTEGER NOT NULL DEFAULT 0,
      missing_minutes INTEGER NOT NULL DEFAULT 0,
      night_minutes INTEGER NOT NULL DEFAULT 0,
      is_holiday BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_workdays_user_date UNIQUE (user_id, date),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (holiday_id) REFERENCES holidays(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_workdays_company_date ON workdays(company_id, date);
    CREATE INDEX IF NOT EXISTS idx_workdays_company_status ON workdays(company_id, status);

    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workday_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      recorded_at DATETIME NOT NULL,
      source TEXT NOT NULL DEFAULT 'WEB',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      sequence INTEGER NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_time_entries_workday_sequence UNIQUE (workday_id, sequence),
      FOREIGN KEY (workday_id) REFERENCES workdays(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_time_entries_user_recorded_at ON time_entries(user_id, recorded_at);
    CREATE INDEX IF NOT EXISTS idx_time_entries_workday_status ON time_entries(workday_id, status);

    CREATE TABLE IF NOT EXISTS adjustment_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      workday_id INTEGER NOT NULL,
      reviewed_by_id INTEGER,
      status TEXT NOT NULL DEFAULT 'PENDING',
      justification TEXT NOT NULL,
      review_notes TEXT,
      requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (workday_id) REFERENCES workdays(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_adjustment_requests_company_status
      ON adjustment_requests(company_id, status);
    CREATE INDEX IF NOT EXISTS idx_adjustment_requests_user_requested_at
      ON adjustment_requests(user_id, requested_at);

    CREATE TABLE IF NOT EXISTS point_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adjustment_request_id INTEGER NOT NULL,
      time_entry_id INTEGER,
      action_type TEXT NOT NULL,
      target_kind TEXT NOT NULL,
      original_recorded_at DATETIME,
      new_recorded_at DATETIME,
      reason TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adjustment_request_id) REFERENCES adjustment_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (time_entry_id) REFERENCES time_entries(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_point_adjustments_request_id
      ON point_adjustments(adjustment_request_id);

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      refresh_token TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_status ON auth_sessions(user_id, status);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
      ON password_reset_tokens(user_id);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      actor_user_id INTEGER,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      metadata TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created_at
      ON audit_logs(company_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at
      ON audit_logs(actor_user_id, created_at);
  `);
}

function main() {
  const databaseFilePath = resolveDatabaseFilePath();
  fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

  const database = new DatabaseSync(databaseFilePath);

  try {
    createSchema(database);
    console.log(`SQLite database prepared at ${databaseFilePath}`);
  } finally {
    database.close();
  }
}

main();
