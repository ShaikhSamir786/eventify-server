import cors from 'cors';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import logger from './logger.ts';

/**
 * CORS Configuration
 * Manages cross-origin requests with environment-based security policies
 */

interface CORSOptions {
  origin: string | string[] | boolean | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
}

/**
 * Get CORS options based on environment
 */
const getCORSOptions = (): CORSOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080'
  const allowedOrigins = [
    clientUrl,                                                            
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    
  ];

  // In production, be more restrictive
  if (nodeEnv === 'production') {
    // Only allow the production client URL
    return {
      origin: [process.env.PRODUCTION_CLIENT_URL || clientUrl],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    };
  }

  // Development: allow multiple localhost origins
  return {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS request from disallowed origin: ${origin}`);
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Custom-Header'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 3600, // 1 hour in dev
  };
};

/**
 * Initialize CORS middleware
 */
export const initializeCORS = () => {
  const corsOptions = getCORSOptions();
  logger.info('✅ CORS configured with options:', {
    origin: Array.isArray(corsOptions.origin) ? corsOptions.origin : 'dynamic',
    credentials: corsOptions.credentials,
    methods: corsOptions.methods,
  });
  return cors(corsOptions);
};

/**
 * Error handler for CORS issues
 */
export const corsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message.includes('CORS')) {
    logger.error('CORS error:', {
      origin: req.headers.origin,
      method: req.method,
      path: req.path,
    });
    return res.status(403).json({
      error: 'CORS policy violation',
      message: process.env.NODE_ENV === 'production' ? 'Access denied' : err.message,
    });
  }
  next(err);
};

export default {
  initializeCORS,
  corsErrorHandler,
};
