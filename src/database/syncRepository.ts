import { createLocalId, getDatabase } from './database';

export type SyncEntity = 'PATIENT' | 'CHECKUP' | 'RISK_ASSESSMENT';
export type SyncOperation = 'CREATE' | 'UPDATE';
export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export async function addToSyncQueue(entityType: SyncEntity, entityId: string, operation: SyncOperation = 'CREATE') {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO sync_queue (id, entity_type, entity_id, operation, status, retry_count, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)',
    createLocalId('SYNC'), entityType, entityId, operation, 'PENDING', new Date().toISOString(),
  );
}

export async function getPendingSyncItems() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM sync_queue WHERE status IN (?, ?) ORDER BY created_at', 'PENDING', 'FAILED');
}

export async function markSyncing(id: string) {
  const db = await getDatabase();
  await db.runAsync('UPDATE sync_queue SET status = ?, last_attempt_at = ? WHERE id = ?', 'SYNCING', new Date().toISOString(), id);
}

export async function markSynced(id: string) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const item = await tx.getFirstAsync<{ entity_type: SyncEntity; entity_id: string }>('SELECT entity_type, entity_id FROM sync_queue WHERE id = ?', id);
    if (!item) return;
    await tx.runAsync('UPDATE sync_queue SET status = ? WHERE id = ?', 'SYNCED', id);
    const table = item.entity_type === 'PATIENT' ? 'patients' : item.entity_type === 'CHECKUP' ? 'checkups' : 'risk_assessments';
    await tx.runAsync(`UPDATE ${table} SET sync_status = ? WHERE id = ?`, 'SYNCED', item.entity_id);
  });
}

export async function markFailed(id: string) {
  const db = await getDatabase();
  await db.runAsync('UPDATE sync_queue SET status = ?, retry_count = retry_count + 1, last_attempt_at = ? WHERE id = ?', 'FAILED', new Date().toISOString(), id);
}

export async function getPendingSyncCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM sync_queue WHERE status IN ('PENDING', 'FAILED', 'SYNCING')");
  return row?.count ?? 0;
}
