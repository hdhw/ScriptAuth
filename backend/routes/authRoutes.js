import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHmac } from 'crypto';
import User from '../db/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Login route
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    
    // Find user by username (case-insensitive search)
    const user = await User.findByUsername(username.trim());
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token with username
    const token = generateToken(user.id, user.username);
    
    // Set JWT in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response with redirect URL
    return res.status(200).json({ 
      message: 'Login successful',
      redirect: '/dashboard',
      user: {
        id: user.id,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'server error during login' });
  }
});

// Register route
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .isLength({ max: 30 })
    .withMessage('Username cannot be longer than 30 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Username can only contain letters, numbers, and spaces'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    
    // Create user (will throw error if username exists)
    const user = await User.create({ 
      username: username.trim(),
      password: password
    });
    
    // Generate JWT token
    const token = generateToken(user.id, user.username);
    
    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Return success response with redirect
    res.status(201).json({
      message: 'Registration successful',
      redirect: '/dashboard',
      user: {
        id: user.id,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('already exists')) {
      return res.status(400).json({ 
        message: 'Username is already taken. Please choose a different one.' 
      });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'logout successful' });
});

// Get current user
router.get('/me', (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'not authenticated' });
    }
    
    const user = User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('get user error:', error);
    res.status(500).json({ message: 'server error' });
  }
});

export default router;
