import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import logger from '../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(process.cwd(), 'data', 'auth.db');
const dataDir = join(process.cwd(), 'data');

let _db;

async function initializeDb() {
  try {
    // Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
      logger.info(`Created data directory at: ${dataDir}`);
    }

    // Open database connection
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');

    // Create tables if they don't exist
    _db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info('Database initialized successfully');
    return _db;
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database and export the promise
const dbPromise = initializeDb()
  .then(db => {
    logger.info('Database connection established');
    return db;
  })
  .catch(err => {
    logger.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Export the database instance and promise
export { dbPromise };

export default _db;
