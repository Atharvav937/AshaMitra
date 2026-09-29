import * as SQLite from 'expo-sqlite';

import {
  CREATE_PATIENTS_TABLE,
  CREATE_CHECKUPS_TABLE,
  CREATE_DANGER_SIGNS_TABLE,
  CREATE_RISK_ASSESSMENTS_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
} from './schema';

const DATABASE_NAME = 'ashamitra.db';

let databaseInstance: SQLite.SQLiteDatabase | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Opens the AshaMitra SQLite database.
 *
 * The same database connection is reused throughout the app.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  databaseInstance = await SQLite.openDatabaseAsync(
    DATABASE_NAME
  );

  return databaseInstance;
}

/**
 * Initializes the database exactly once.
 *
 * Multiple callers can safely call this function at the same time.
 * They will all wait for the same initialization promise.
 */
export async function initializeDatabase(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const db = await getDatabase();

      await db.execAsync(`
        PRAGMA foreign_keys = ON;
      `);

      await db.execAsync(CREATE_PATIENTS_TABLE);
      await db.execAsync(CREATE_CHECKUPS_TABLE);
      await db.execAsync(CREATE_DANGER_SIGNS_TABLE);
      await db.execAsync(CREATE_RISK_ASSESSMENTS_TABLE);
      await db.execAsync(CREATE_SYNC_QUEUE_TABLE);

      console.log(
        'AshaMitra SQLite database initialized successfully.'
      );
    } catch (error) {
      // Allow a future retry if initialization fails.
      initializationPromise = null;

      console.error(
        'Failed to initialize AshaMitra SQLite database:',
        error
      );

      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Returns the already-opened database.
 *
 * The application should initialize the database before
 * performing database operations.
 */
export async function getInitializedDatabase(): Promise<SQLite.SQLiteDatabase> {
  await initializeDatabase();

  return getDatabase();
}