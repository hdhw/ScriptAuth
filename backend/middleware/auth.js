import jwt from 'jsonwebtoken';
import httpErrors from 'http-errors';
const { createError } = httpErrors;
import User from '../db/users.js';

/**
 * Middleware to verify JWT token from cookies
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error('auth error:', error);
    res.clearCookie('token');
    res.redirect('/login');
  }
};

/**
 * Middleware to check if user is already logged in
 */
export const redirectIfLoggedIn = (req, res, next) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  next();
};

/**
 * Middleware to parse JWT token if it exists
 */
export const parseToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
          req.user = user;
          res.locals.user = user;
        } else {
          res.clearCookie('token');
        }
      } catch (error) {
        // If token verification fails, clear the cookie
        res.clearCookie('token');
      }
    }
    next();
  } catch (error) {
    console.error('token parse error:', error);
    res.clearCookie('token');
    next();
  }
};
