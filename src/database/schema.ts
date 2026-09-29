import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((result?.user_version ?? 0) >= DATABASE_VERSION) return;

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        age TEXT NOT NULL,
        village TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        gestational_age TEXT NOT NULL DEFAULT '',
        edd TEXT NOT NULL DEFAULT '',
        previous_pregnancy_complications TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'PENDING'
      );
      CREATE TABLE IF NOT EXISTS checkups (
        id TEXT PRIMARY KEY NOT NULL,
        patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        systolic_bp TEXT NOT NULL,
        diastolic_bp TEXT NOT NULL,
        haemoglobin TEXT NOT NULL DEFAULT '',
        temperature TEXT NOT NULL DEFAULT '',
        fetal_movement TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'PENDING'
      );
      CREATE INDEX IF NOT EXISTS checkups_patient_created ON checkups(patient_id, created_at);
      CREATE TABLE IF NOT EXISTS danger_signs (
        id TEXT PRIMARY KEY NOT NULL,
        checkup_id TEXT NOT NULL REFERENCES checkups(id) ON DELETE CASCADE,
        sign TEXT NOT NULL,
        detected INTEGER NOT NULL CHECK (detected IN (0, 1)),
        created_at TEXT NOT NULL,
        UNIQUE(checkup_id, sign)
      );
      CREATE TABLE IF NOT EXISTS risk_assessments (
        id TEXT PRIMARY KEY NOT NULL,
        checkup_id TEXT NOT NULL UNIQUE REFERENCES checkups(id) ON DELETE CASCADE,
        risk_level TEXT NOT NULL CHECK (risk_level IN ('URGENT', 'PRIORITY', 'ROUTINE')),
        danger_signs_summary TEXT NOT NULL,
        reasons TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        referral_priority TEXT NOT NULL,
        created_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'PENDING'
      );
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('PATIENT', 'CHECKUP', 'RISK_ASSESSMENT')),
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('CREATE', 'UPDATE')),
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SYNCING', 'SYNCED', 'FAILED')),
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        created_at TEXT NOT NULL
      );
    `);
    await tx.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
  });
}
