import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Database } from 'better-sqlite3';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(process.cwd(), '..', '..', 'data', 'auth.db');

export async function up() {
  if (!existsSync(dbPath)) {
    console.error('Database file not found. Please initialize the database first.');
    process.exit(1);
  }

  const db = new Database(dbPath);
  
  try {
    // Start transaction
    db.prepare('BEGIN').run();
    
    // Create a new table without the email column
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Copy data from old table to new table
    db.prepare(`
      INSERT INTO users_new (id, username, password_hash, salt, created_at)
      SELECT id, username, password_hash, salt, created_at FROM users
    `).run();
    
    // Drop old table
    db.prepare('DROP TABLE users').run();
    
    // Rename new table
    db.prepare('ALTER TABLE users_new RENAME TO users').run();
    
    // Commit transaction
    db.prepare('COMMIT').run();
    
    console.log('Successfully removed email column from users table');
  } catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('Error during migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run the migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  up().catch(console.error);
}
