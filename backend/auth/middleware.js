const jwt = require('jsonwebtoken');
const User = require('../db/users');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const TOKEN_EXPIRY = '24h';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in verifyToken:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  verifyToken(req, res, next);
};

module.exports = {
  generateToken,
  verifyToken,
  requireAuth
};
