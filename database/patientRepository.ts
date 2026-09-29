import { getDatabase } from './database';

export type Patient = {
  id: string;
  name: string;
  age: string;
  village: string;
  phone: string;
  gestationalAge: string;
  edd: string;
  previousPregnancyComplications: string;
};

export type CreatePatientInput = {
  name: string;
  age: string;
  village: string;
  phone: string;
  gestationalAge: string;
  edd: string;
  previousPregnancyComplications: string;
};

export type UpdatePatientInput = Partial<CreatePatientInput>;

type PatientRow = {
  id: string;
  name: string;
  age: number | null;
  village: string | null;
  phone: string | null;
  gestational_age: number | null;
  edd: string | null;
  previous_pregnancy_complications: string | null;
  created_at: string;
  updated_at: string;
  sync_status: string;
};

/**
 * Generates a locally unique patient ID.
 *
 * No external package is required.
 */
function generatePatientId(): string {
  return `MAT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

/**
 * Converts a database row into the application's
 * patient data shape.
 */
function mapPatientRow(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    age: row.age !== null ? String(row.age) : '',
    village: row.village ?? '',
    phone: row.phone ?? '',
    gestationalAge:
      row.gestational_age !== null
        ? String(row.gestational_age)
        : '',
    edd: row.edd ?? '',
    previousPregnancyComplications:
      row.previous_pregnancy_complications ?? '',
  };
}

/**
 * Converts a string number into a SQLite INTEGER.
 *
 * Empty values are stored as NULL.
 */
function toIntegerOrNull(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Creates a new patient in SQLite and adds a corresponding
 * CREATE operation to the synchronization queue.
 */
export async function createPatient(
  patient: CreatePatientInput
): Promise<Patient> {
  const db = await getDatabase();

  const patientId = generatePatientId();

  const now = new Date().toISOString();

  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        INSERT INTO patients (
          id,
          name,
          age,
          village,
          phone,
          gestational_age,
          edd,
          previous_pregnancy_complications,
          created_at,
          updated_at,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          patientId,
          patient.name.trim(),
          toIntegerOrNull(patient.age),
          patient.village.trim(),
          patient.phone.trim(),
          toIntegerOrNull(patient.gestationalAge),
          patient.edd.trim(),
          patient.previousPregnancyComplications.trim(),
          now,
          now,
          'PENDING',
        ]
      );

      await db.runAsync(
        `
        INSERT INTO sync_queue (
          id,
          entity_type,
          entity_id,
          operation,
          status,
          retry_count,
          last_attempt_at,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          `SYNC-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}`,
          'PATIENT',
          patientId,
          'CREATE',
          'PENDING',
          0,
          null,
          now,
        ]
      );
    });

    return {
      id: patientId,
      name: patient.name.trim(),
      age: patient.age,
      village: patient.village.trim(),
      phone: patient.phone.trim(),
      gestationalAge: patient.gestationalAge,
      edd: patient.edd.trim(),
      previousPregnancyComplications:
        patient.previousPregnancyComplications.trim(),
    };
  } catch (error) {
    console.error('Failed to create patient:', error);

    throw new Error(
      `Failed to create patient: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Returns all patients from SQLite.
 */
export async function getPatients(): Promise<Patient[]> {
  const db = await getDatabase();

  try {
    const rows = await db.getAllAsync<PatientRow>(
      `
      SELECT
        id,
        name,
        age,
        village,
        phone,
        gestational_age,
        edd,
        previous_pregnancy_complications,
        created_at,
        updated_at,
        sync_status
      FROM patients
      ORDER BY created_at DESC
      `
    );

    return rows.map(mapPatientRow);
  } catch (error) {
    console.error('Failed to get patients:', error);

    throw new Error(
      `Failed to get patients: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Returns one patient by local ID.
 */
export async function getPatientById(
  patientId: string
): Promise<Patient | null> {
  const db = await getDatabase();

  try {
    const row = await db.getFirstAsync<PatientRow>(
      `
      SELECT
        id,
        name,
        age,
        village,
        phone,
        gestational_age,
        edd,
        previous_pregnancy_complications,
        created_at,
        updated_at,
        sync_status
      FROM patients
      WHERE id = ?
      `,
      [patientId]
    );

    if (!row) {
      return null;
    }

    return mapPatientRow(row);
  } catch (error) {
    console.error(
      `Failed to get patient ${patientId}:`,
      error
    );

    throw new Error(
      `Failed to get patient: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Updates an existing patient.
 *
 * The patient is marked PENDING and a PATIENT + UPDATE
 * operation is added to the synchronization queue.
 */
export async function updatePatient(
  patientId: string,
  updates: UpdatePatientInput
): Promise<Patient> {
  const db = await getDatabase();

  try {
    const existingPatient = await getPatientById(patientId);

    if (!existingPatient) {
      throw new Error(`Patient not found: ${patientId}`);
    }

    const updatedPatient: Patient = {
      ...existingPatient,
      ...updates,
    };

    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        UPDATE patients
        SET
          name = ?,
          age = ?,
          village = ?,
          phone = ?,
          gestational_age = ?,
          edd = ?,
          previous_pregnancy_complications = ?,
          updated_at = ?,
          sync_status = ?
        WHERE id = ?
        `,
        [
          updatedPatient.name.trim(),
          toIntegerOrNull(updatedPatient.age),
          updatedPatient.village.trim(),
          updatedPatient.phone.trim(),
          toIntegerOrNull(updatedPatient.gestationalAge),
          updatedPatient.edd.trim(),
          updatedPatient.previousPregnancyComplications.trim(),
          now,
          'PENDING',
          patientId,
        ]
      );

      await db.runAsync(
        `
        INSERT INTO sync_queue (
          id,
          entity_type,
          entity_id,
          operation,
          status,
          retry_count,
          last_attempt_at,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          `SYNC-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}`,
          'PATIENT',
          patientId,
          'UPDATE',
          'PENDING',
          0,
          null,
          now,
        ]
      );
    });

    return updatedPatient;
  } catch (error) {
    console.error(
      `Failed to update patient ${patientId}:`,
      error
    );

    throw new Error(
      `Failed to update patient: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}