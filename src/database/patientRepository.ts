import { createLocalId, getDatabase } from './database';
import { addToSyncQueue } from './syncRepository';

export type PatientInput = { name: string; age: string; village: string; phone: string; gestationalAge: string; edd: string; previousPregnancyComplications: string };
export type PatientRow = PatientInput & { id: string; createdAt: string; updatedAt: string; syncStatus: string };
const selectPatients = `SELECT id, name, age, village, phone, gestational_age AS gestationalAge, edd,
  previous_pregnancy_complications AS previousPregnancyComplications, created_at AS createdAt,
  updated_at AS updatedAt, sync_status AS syncStatus FROM patients`;

export async function createPatient(input: PatientInput): Promise<PatientRow> {
  const db = await getDatabase(); const id = createLocalId('MAT'); const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync('INSERT INTO patients (id,name,age,village,phone,gestational_age,edd,previous_pregnancy_complications,created_at,updated_at,sync_status) VALUES (?,?,?,?,?,?,?,?,?,?,?)', id, input.name, input.age, input.village, input.phone, input.gestationalAge, input.edd, input.previousPregnancyComplications, now, now, 'PENDING');
    await tx.runAsync('INSERT INTO sync_queue (id,entity_type,entity_id,operation,status,retry_count,created_at) VALUES (?,?,?,?,?,0,?)', createLocalId('SYNC'), 'PATIENT', id, 'CREATE', 'PENDING', now);
  });
  return { ...input, id, createdAt: now, updatedAt: now, syncStatus: 'PENDING' };
}

export async function getPatients(): Promise<PatientRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<PatientRow>(`${selectPatients} ORDER BY created_at DESC`);
}

export async function getPatientById(id: string): Promise<PatientRow | undefined> {
  const db = await getDatabase();
  return (await db.getFirstAsync<PatientRow>(`${selectPatients} WHERE id = ?`, id)) ?? undefined;
}

export async function updatePatient(id: string, input: PatientInput) {
  const db = await getDatabase(); const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const result = await tx.runAsync('UPDATE patients SET name=?,age=?,village=?,phone=?,gestational_age=?,edd=?,previous_pregnancy_complications=?,updated_at=?,sync_status=? WHERE id=?', input.name, input.age, input.village, input.phone, input.gestationalAge, input.edd, input.previousPregnancyComplications, now, 'PENDING', id);
    if (!result.changes) throw new Error('Patient not found');
    await tx.runAsync('INSERT INTO sync_queue (id,entity_type,entity_id,operation,status,retry_count,created_at) VALUES (?,?,?,?,?,0,?)', createLocalId('SYNC'), 'PATIENT', id, 'UPDATE', 'PENDING', now);
  });
}
