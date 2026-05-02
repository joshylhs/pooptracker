import { open, type DB } from '@op-engineering/op-sqlite';

const DATABASE_NAME = 'shitster.db';

let dbInstance: DB | null = null;

export function getDB(): DB {
  if (!dbInstance) {
    dbInstance = open({ name: DATABASE_NAME });
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DB): void {
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS logs (
      log_id        TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL,
      timestamp     INTEGER NOT NULL,
      bristol_type  INTEGER,
      duration      INTEGER,
      notes         TEXT,
      is_quick_log  INTEGER NOT NULL,
      date          TEXT NOT NULL,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
  `);
  db.executeSync(
    `CREATE INDEX IF NOT EXISTS idx_logs_user_date ON logs(user_id, date);`,
  );
  db.executeSync(
    `CREATE INDEX IF NOT EXISTS idx_logs_user_timestamp ON logs(user_id, timestamp DESC);`,
  );
}

/**
 * Test-only — closes and forgets the DB instance. Production code never needs
 * this; the OS releases the file handle when the app terminates.
 */
export function _resetForTests(): void {
  dbInstance?.close();
  dbInstance = null;
}
