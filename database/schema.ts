export const CREATE_PATIENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    village TEXT,
    phone TEXT,
    gestational_age INTEGER,
    edd TEXT,
    previous_pregnancy_complications TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending'
  );
`;

export const CREATE_CHECKUPS_TABLE = `
  CREATE TABLE IF NOT EXISTS checkups (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT NOT NULL,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    haemoglobin REAL,
    temperature REAL,
    fetal_movement TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending',

    FOREIGN KEY (patient_id)
      REFERENCES patients(id)
      ON DELETE CASCADE
  );
`;

export const CREATE_DANGER_SIGNS_TABLE = `
  CREATE TABLE IF NOT EXISTS danger_signs (
    id TEXT PRIMARY KEY NOT NULL,
    checkup_id TEXT NOT NULL,
    sign TEXT NOT NULL,
    detected INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,

    FOREIGN KEY (checkup_id)
      REFERENCES checkups(id)
      ON DELETE CASCADE
  );
`;

export const CREATE_RISK_ASSESSMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY NOT NULL,
    checkup_id TEXT NOT NULL,
    risk_level TEXT,
    danger_signs_summary TEXT,
    reasons TEXT,
    recommended_action TEXT,
    referral_priority TEXT,
    created_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending',

    FOREIGN KEY (checkup_id)
      REFERENCES checkups(id)
      ON DELETE CASCADE
  );
`;

export const CREATE_SYNC_QUEUE_TABLE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT,
    created_at TEXT NOT NULL
  );
`;