import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if it is a known operational error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Technical/unknown bug: Log the full details for debugging
    console.error('SYSTEM ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Leak the stack trace only during local development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
