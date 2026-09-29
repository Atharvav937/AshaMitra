import { getDatabase } from './database';

export type CreateCheckupInput = {
  systolicBP: string;
  diastolicBP: string;
  haemoglobin: string;
  temperature: string;

  fetalMovement:
    | 'Normal'
    | 'Reduced'
    | 'Not felt'
    | '';

  bleeding: boolean;
  severeHeadache: boolean;
  blurredVision: boolean;
  swelling: boolean;
  abdominalPain: boolean;
  fever: boolean;
  convulsions: boolean;
  difficultyBreathing: boolean;

  notes: string;
};

export type Checkup = CreateCheckupInput & {
  id: string;
  patientId: string;
  date: string;
};

type CheckupRow = {
  id: string;
  patient_id: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  haemoglobin: number | null;
  temperature: number | null;
  fetal_movement: string | null;
  notes: string | null;
  created_at: string;
  sync_status: string;
};

type DangerSignRow = {
  sign: string;
  detected: number;
};

function generateCheckupId(): string {
  return `CHK-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

function generateSyncQueueId(): string {
  return `SYNC-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

function generateDangerSignId(): string {
  return `DS-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

function toNumberOrNull(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function mapCheckupRow(
  row: CheckupRow,
  dangerSigns: DangerSignRow[]
): Checkup {
  const selectedSigns = new Set(
    dangerSigns
      .filter((dangerSign) => dangerSign.detected === 1)
      .map((dangerSign) => dangerSign.sign)
  );

  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.created_at,

    systolicBP:
      row.systolic_bp !== null
        ? String(row.systolic_bp)
        : '',

    diastolicBP:
      row.diastolic_bp !== null
        ? String(row.diastolic_bp)
        : '',

    haemoglobin:
      row.haemoglobin !== null
        ? String(row.haemoglobin)
        : '',

    temperature:
      row.temperature !== null
        ? String(row.temperature)
        : '',

    fetalMovement:
      (row.fetal_movement as
        | 'Normal'
        | 'Reduced'
        | 'Not felt'
        | '') || '',

    bleeding: selectedSigns.has('bleeding'),
    severeHeadache: selectedSigns.has('severe_headache'),
    blurredVision: selectedSigns.has('blurred_vision'),
    swelling: selectedSigns.has('swelling'),
    abdominalPain: selectedSigns.has('abdominal_pain'),
    fever: selectedSigns.has('fever'),
    convulsions: selectedSigns.has('convulsions'),
    difficultyBreathing: selectedSigns.has(
      'difficulty_breathing'
    ),

    notes: row.notes ?? '',
  };
}

/**
 * Creates a checkup and its selected danger signs.
 *
 * Everything is written in one SQLite transaction:
 *
 * checkup
 * + danger signs
 * + sync queue
 *
 * Either everything succeeds or nothing is saved.
 */
export async function createCheckup(
  patientId: string,
  checkup: CreateCheckupInput
): Promise<Checkup> {
  const db = await getDatabase();

  const checkupId = generateCheckupId();
  const now = new Date().toISOString();

  try {
    await db.withTransactionAsync(async () => {
      // 1. Save checkup
      await db.runAsync(
        `
        INSERT INTO checkups (
          id,
          patient_id,
          systolic_bp,
          diastolic_bp,
          haemoglobin,
          temperature,
          fetal_movement,
          notes,
          created_at,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          checkupId,
          patientId,
          toNumberOrNull(checkup.systolicBP),
          toNumberOrNull(checkup.diastolicBP),
          toNumberOrNull(checkup.haemoglobin),
          toNumberOrNull(checkup.temperature),
          checkup.fetalMovement || null,
          checkup.notes.trim(),
          now,
          'PENDING',
        ]
      );

      // 2. Save selected danger signs
      const dangerSigns = [
        {
          sign: 'bleeding',
          detected: checkup.bleeding,
        },
        {
          sign: 'severe_headache',
          detected: checkup.severeHeadache,
        },
        {
          sign: 'blurred_vision',
          detected: checkup.blurredVision,
        },
        {
          sign: 'swelling',
          detected: checkup.swelling,
        },
        {
          sign: 'abdominal_pain',
          detected: checkup.abdominalPain,
        },
        {
          sign: 'fever',
          detected: checkup.fever,
        },
        {
          sign: 'convulsions',
          detected: checkup.convulsions,
        },
        {
          sign: 'difficulty_breathing',
          detected: checkup.difficultyBreathing,
        },
      ];

      for (const dangerSign of dangerSigns) {
        if (!dangerSign.detected) {
          continue;
        }

        await db.runAsync(
          `
          INSERT INTO danger_signs (
            id,
            checkup_id,
            sign,
            detected,
            created_at
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            generateDangerSignId(),
            checkupId,
            dangerSign.sign,
            1,
            now,
          ]
        );
      }

      // 3. Add checkup to synchronization queue
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
          generateSyncQueueId(),
          'CHECKUP',
          checkupId,
          'CREATE',
          'PENDING',
          0,
          null,
          now,
        ]
      );
    });

    return {
      id: checkupId,
      patientId,
      date: now,
      ...checkup,
    };
  } catch (error) {
    console.error(
      `Failed to create checkup for patient ${patientId}:`,
      error
    );

    throw new Error(
      `Failed to create checkup: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}

/**
 * Gets all checkups belonging to a patient.
 */
export async function getCheckupsByPatientId(
  patientId: string
): Promise<Checkup[]> {
  const db = await getDatabase();

  try {
    const rows = await db.getAllAsync<CheckupRow>(
      `
      SELECT
        id,
        patient_id,
        systolic_bp,
        diastolic_bp,
        haemoglobin,
        temperature,
        fetal_movement,
        notes,
        created_at,
        sync_status
      FROM checkups
      WHERE patient_id = ?
      ORDER BY created_at DESC
      `,
      [patientId]
    );

    const checkups: Checkup[] = [];

    for (const row of rows) {
      const dangerSigns =
        await db.getAllAsync<DangerSignRow>(
          `
          SELECT
            sign,
            detected
          FROM danger_signs
          WHERE checkup_id = ?
          `,
          [row.id]
        );

      checkups.push(
        mapCheckupRow(row, dangerSigns)
      );
    }

    return checkups;
  } catch (error) {
    console.error(
      `Failed to get checkups for patient ${patientId}:`,
      error
    );

    throw new Error(
      `Failed to get patient checkups: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}