CREATE TYPE user_role AS ENUM ('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE holiday_type AS ENUM ('NATIONAL', 'STATE', 'MUNICIPAL', 'COMPANY');
CREATE TYPE workday_status AS ENUM ('OPEN', 'CLOSED', 'INCONSISTENT', 'PENDING_ADJUSTMENT', 'ADJUSTED');
CREATE TYPE time_entry_kind AS ENUM ('ENTRY', 'EXIT');
CREATE TYPE time_entry_source AS ENUM ('WEB', 'MOBILE', 'MANUAL', 'ADJUSTMENT');
CREATE TYPE time_entry_status AS ENUM ('ACTIVE', 'PENDING_REVIEW', 'SUPERSEDED', 'REJECTED');
CREATE TYPE adjustment_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE adjustment_action_type AS ENUM ('CREATE', 'UPDATE', 'DELETE');
CREATE TYPE session_status AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  legal_name VARCHAR(160),
  document VARCHAR(18) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name VARCHAR(120) NOT NULL,
  legal_name VARCHAR(160) NOT NULL,
  trade_name VARCHAR(160),
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  timezone VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_client_id ON companies(client_id);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  employee_code VARCHAR(30) UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  position VARCHAR(120),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_company_role ON users(company_id, role);

CREATE TABLE journeys (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  scale_code VARCHAR(20) NOT NULL,
  flexible_schedule BOOLEAN NOT NULL DEFAULT FALSE,
  daily_work_minutes INTEGER NOT NULL CHECK (daily_work_minutes >= 0),
  weekly_work_minutes INTEGER CHECK (weekly_work_minutes IS NULL OR weekly_work_minutes >= 0),
  expected_entry_time TIME,
  expected_exit_time TIME,
  break_minutes INTEGER NOT NULL DEFAULT 60 CHECK (break_minutes >= 0),
  tolerance_minutes INTEGER NOT NULL DEFAULT 10 CHECK (tolerance_minutes >= 0),
  night_shift BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_journeys_company_name UNIQUE (company_id, name)
);

CREATE INDEX idx_journeys_company_id ON journeys(company_id);

CREATE TABLE user_journey_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE RESTRICT,
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  valid_from DATE NOT NULL,
  valid_to DATE,
  notes VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_journey_assignments_user_start UNIQUE (user_id, valid_from),
  CONSTRAINT chk_user_journey_assignments_period CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX idx_user_journey_assignments_journey_id ON user_journey_assignments(journey_id);

CREATE TABLE holidays (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  date DATE NOT NULL,
  type holiday_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_holidays_company_date_name UNIQUE (company_id, date, name)
);

CREATE INDEX idx_holidays_company_date ON holidays(company_id, date);

CREATE TABLE workdays (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  holiday_id INTEGER REFERENCES holidays(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status workday_status NOT NULL DEFAULT 'OPEN',
  scheduled_minutes INTEGER NOT NULL DEFAULT 0 CHECK (scheduled_minutes >= 0),
  worked_minutes INTEGER NOT NULL DEFAULT 0 CHECK (worked_minutes >= 0),
  overtime_minutes INTEGER NOT NULL DEFAULT 0 CHECK (overtime_minutes >= 0),
  missing_minutes INTEGER NOT NULL DEFAULT 0 CHECK (missing_minutes >= 0),
  night_minutes INTEGER NOT NULL DEFAULT 0 CHECK (night_minutes >= 0),
  is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workdays_user_date UNIQUE (user_id, date)
);

CREATE INDEX idx_workdays_company_date ON workdays(company_id, date);
CREATE INDEX idx_workdays_company_status ON workdays(company_id, status);

CREATE TABLE time_entries (
  id SERIAL PRIMARY KEY,
  workday_id INTEGER NOT NULL REFERENCES workdays(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind time_entry_kind NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  source time_entry_source NOT NULL DEFAULT 'WEB',
  status time_entry_status NOT NULL DEFAULT 'ACTIVE',
  sequence INTEGER NOT NULL CHECK (sequence > 0),
  timezone VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_time_entries_workday_sequence UNIQUE (workday_id, sequence)
);

CREATE INDEX idx_time_entries_user_recorded_at ON time_entries(user_id, recorded_at);
CREATE INDEX idx_time_entries_workday_status ON time_entries(workday_id, status);

CREATE TABLE adjustment_requests (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workday_id INTEGER NOT NULL REFERENCES workdays(id) ON DELETE CASCADE,
  reviewed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status adjustment_request_status NOT NULL DEFAULT 'PENDING',
  justification TEXT NOT NULL,
  review_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adjustment_requests_company_status ON adjustment_requests(company_id, status);
CREATE INDEX idx_adjustment_requests_user_requested_at ON adjustment_requests(user_id, requested_at);

CREATE TABLE point_adjustments (
  id SERIAL PRIMARY KEY,
  adjustment_request_id INTEGER NOT NULL REFERENCES adjustment_requests(id) ON DELETE CASCADE,
  time_entry_id INTEGER REFERENCES time_entries(id) ON DELETE SET NULL,
  action_type adjustment_action_type NOT NULL,
  target_kind time_entry_kind NOT NULL,
  original_recorded_at TIMESTAMPTZ,
  new_recorded_at TIMESTAMPTZ,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_adjustments_request_id ON point_adjustments(adjustment_request_id);

CREATE TABLE auth_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(64),
  user_agent VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  status session_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_user_status ON auth_sessions(user_id, status);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NOT NULL,
  action VARCHAR(80) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company_created_at ON audit_logs(company_id, created_at);
CREATE INDEX idx_audit_logs_actor_created_at ON audit_logs(actor_user_id, created_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_journeys_updated_at
BEFORE UPDATE ON journeys
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_holidays_updated_at
BEFORE UPDATE ON holidays
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workdays_updated_at
BEFORE UPDATE ON workdays
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_time_entries_updated_at
BEFORE UPDATE ON time_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_adjustment_requests_updated_at
BEFORE UPDATE ON adjustment_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
