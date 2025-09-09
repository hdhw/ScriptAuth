import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

// Import routes
import authRoutes from './routes/authRoutes.js';

// Import middleware
import { requireAuth, parseToken, redirectIfLoggedIn } from './middleware/auth.js';

// Database connection - ensure the database is initialized
import { dbPromise } from './db/connection.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Parse token for all requests
app.use(parseToken);

// API Routes
app.use('/api/auth', authRoutes);

// Auth routes (legacy - redirect to API)
app.use('/auth', (req, res, next) => {
  // Redirect to the new API endpoint
  const path = req.path;
  res.redirect(307, `/api/auth${path}`);
});

// Home route
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'home',
    user: req.user
  });
});

// Login page
app.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { 
    title: 'login',
    message: req.query.message,
    user: req.user
  });
});

// Register page
app.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { 
    title: 'register',
    message: req.query.message,
    user: req.user
  });
});

// Dashboard (protected route)
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { 
    title: 'dashboard',
    user: req.user
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'something went wrong!',
    user: req.user
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: '404 - not found',
    user: req.user
  });
});

// Start server after database connection is established
dbPromise.then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  logger.error('Failed to start server:', err); 
  process.exit(1);
});

export default app;
