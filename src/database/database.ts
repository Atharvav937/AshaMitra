import * as SQLite from 'expo-sqlite';
import { migrateDatabase } from './schema';

let databasePromise: ReturnType<typeof SQLite.openDatabaseAsync> | undefined;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('ashamitra.db')
      .then(async (db) => {
        await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
        await migrateDatabase(db);
        return db;
      })
      .catch((error) => {
        databasePromise = undefined;
        throw error;
      });
  }
  return databasePromise;
}

export function createLocalId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
