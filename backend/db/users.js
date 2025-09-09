import { createHmac, randomBytes } from 'crypto';
import { dbPromise } from './connection.js';

class User {
  static async create({ username, password }) {
    // Trim and validate username
    const trimmedUsername = username.trim();
    
    // Username validation
    if (!trimmedUsername) {
      throw new Error('Username cannot be empty');
    }
    
    if (trimmedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    
    if (trimmedUsername.length > 30) {
      throw new Error('Username cannot be longer than 30 characters');
    }
    
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmedUsername)) {
      throw new Error('Username can only contain letters, numbers, and spaces');
    }
    
    // Generate salt and hash password
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = this.hashPassword(password, salt);
    
    try {
      const db = await dbPromise;
      const stmt = db.prepare(
        'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)'
      );
      
      const result = stmt.run(trimmedUsername, '', hashedPassword, salt);
      
      return {
        id: result.lastInsertRowid,
        username: trimmedUsername,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed: users.username')) {
        throw new Error('Username already exists');
      }
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Find user by username (case-insensitive search)
  static async findByUsername(username) {
    try {
      const db = await dbPromise;
      const stmt = db.prepare('SELECT id, username, password_hash, salt, created_at FROM users WHERE LOWER(username) = LOWER(?)');
      return stmt.get(username.trim());
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Failed to find user');
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const db = await dbPromise;
      const stmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
      const user = stmt.get(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  static hashPassword(password, salt) {
    return createHmac('sha256', salt)
      .update(password)
      .digest('hex');
  }

  static verifyPassword(password, user) {
    if (!user || !user.salt || !user.password_hash) return false;
    return this.hashPassword(password, user.salt) === user.password_hash;
  }
}

export default User;
