-- BigQuery schema setup for Hospital Stress Early Warning System

-- Create dataset (run this first)
-- CREATE SCHEMA IF NOT EXISTS hospital_data;

-- 1. Users Table (RBAC)
CREATE TABLE IF NOT EXISTS hospital_data.users (
  email STRING NOT NULL,
  role STRING NOT NULL, -- PATIENT, HOSPITAL_ADMIN, HOSPITAL_STAFF
  hospital_id STRING, -- Nullable for PATIENT
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 2. Hospitals Table (Profile & Config)
CREATE TABLE IF NOT EXISTS hospital_data.hospitals (
  hospital_id STRING NOT NULL,
  name STRING NOT NULL,
  logo_url STRING,
  cover_image_url STRING,
  description STRING,
  address STRING,
  city STRING,
  state STRING,
  country STRING,
  pin_code STRING,
  phone STRING,
  email STRING,
  website STRING,
  emergency_contact STRING,
  total_beds INT64 NOT NULL,
  icu_beds INT64,
  emergency_beds INT64,
  departments ARRAY<STRING>,
  facilities ARRAY<STRING>,
  services ARRAY<STRING>,
  operating_hours STRING,
  emergency_services_available BOOL,
  public_status STRING DEFAULT 'Normal', -- Normal, Busy, High Demand
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 3. Patient Profiles Table
CREATE TABLE IF NOT EXISTS hospital_data.patient_profiles (
  email STRING NOT NULL,
  full_name STRING NOT NULL,
  phone STRING,
  date_of_birth DATE,
  gender STRING,
  city STRING,
  emergency_contact STRING,
  preferred_hospital_id STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 4. Hospital Announcements
CREATE TABLE IF NOT EXISTS hospital_data.hospital_announcements (
  announcement_id STRING NOT NULL,
  hospital_id STRING NOT NULL,
  title STRING NOT NULL,
  message STRING NOT NULL,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 5. Hospital logs table (Modified)
CREATE TABLE IF NOT EXISTS hospital_data.logs (
  hospital_id STRING NOT NULL,
  date DATE NOT NULL,
  admissions INT64 NOT NULL,
  beds_occupied INT64 NOT NULL,
  staff_on_duty INT64 NOT NULL,
  overload_flag BOOL NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 6. Predictions table (Modified)
CREATE TABLE IF NOT EXISTS hospital_data.predictions (
  prediction_id STRING NOT NULL,
  hospital_id STRING NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_beds INT64 NOT NULL,
  bed_stress FLOAT64 NOT NULL,
  confidence FLOAT64 NOT NULL,
  is_high_risk BOOL NOT NULL
);

-- 7. Alerts table (Modified)
CREATE TABLE IF NOT EXISTS hospital_data.alerts (
  alert_id STRING NOT NULL,
  hospital_id STRING NOT NULL,
  alert_type STRING NOT NULL,
  risk_score FLOAT64 NOT NULL,
  triggered_at TIMESTAMP NOT NULL,
  sent_email BOOL NOT NULL,
  sent_slack BOOL NOT NULL,
  recipients ARRAY<STRING>,
  status STRING DEFAULT 'New' -- New, Acknowledged, Resolved
);

-- 8. Crisis history table (Modified)
CREATE TABLE IF NOT EXISTS hospital_data.crisis_history (
  crisis_id STRING NOT NULL,
  hospital_id STRING NOT NULL,
  occurred_at TIMESTAMP NOT NULL,
  description STRING NOT NULL,
  resolution STRING,
  lessons_learned STRING,
  embedding ARRAY<FLOAT64>
);

