import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  next(createHttpError(404, 'Not Found'));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  logger.error({
    status,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (req.accepts('html')) {
    return res.status(status).render('error', {
      title: `Error ${status}`,
      message,
      error: stack ? { stack } : undefined,
      user: req.user || null
    });
  }

  res.status(status).json({
    status: 'error',
    message,
    ...(stack && { stack })
  });
};

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
    
    next(createHttpError(400, 'Validation Error', { errors: errorMessages }));
  };
};
