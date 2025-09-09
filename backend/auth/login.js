import User from '../db/users.js';
import { generateToken } from './middleware.js';
import logger from '../../utils/logger.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return next(new Error('Username and password are required'));
    }

    const user = await User.findByUsername(username);
    
    if (!user || !(await User.verifyPassword(password, user))) {
      return next(new Error('Invalid username or password'));
    }

    const token = generateToken(user);
    
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

export default { login };
