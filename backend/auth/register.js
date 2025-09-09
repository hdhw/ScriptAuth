const User = require('../db/users');
const { generateToken } = require('./middleware');

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validate input
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return next(createHttpError(400, 'Passwords do not match'));
    }

    if (password.length < 6) {
      return next(createHttpError(400, 'Password must be at least 6 characters long'));
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      logger.warn(`Registration attempt with existing username: ${username}`);
      return next(createHttpError(400, 'Username already exists'));
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return next(createHttpError(400, 'Email already in use'));
    }

    const user = await User.create({
      username,
      email,
      password
    });

    logger.info(`New user registered: ${username} (${email})`);

    const token = generateToken(user);

    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    if (req.accepts('html')) {
      return res.redirect('/login?message=Registration successful. Please log in.');
    }
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(createHttpError(500, 'Registration failed'));
  }
};

module.exports = { register };
