import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { db } from './db/database.js';
import { healthRouter } from './routes/health.js';
import { vehicleRouter } from './routes/vehicles.js';
import { shipmentRouter } from './routes/shipments.js';
import { incidentRouter } from './routes/incidents.js';
import { reportRouter } from './routes/reports.js';
import { notificationRouter } from './routes/notifications.js';
import { activityRouter } from './routes/activities.js';
import { routeRouter } from './routes/routes.js';
import { stateRouter } from './routes/states.js';
import { weatherRouter } from './routes/weather.js';
import { mlRouter } from './routes/ml.js';
import { aiRouter } from './routes/ai.js';
import { emergencyRouter } from './routes/emergency.js';
import missionsRouter from './routes/missions.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Body parsing middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health & Status Endpoints (mounted at multiple standard paths for convenience)
app.use('/api/v1/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/health', healthRouter);

// API Routes Mounting
app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/fleet', vehicleRouter); // Alias for fleet
app.use('/api/v1/shipments', shipmentRouter);
app.use('/api/v1/incidents', incidentRouter);
app.use('/api/v1/alerts', incidentRouter); // Alias for alerts
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/routes', routeRouter);
app.use('/api/v1/states', stateRouter);
app.use('/api/v1/weather', weatherRouter);
app.use('/api/v1/ml', mlRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/emergency', emergencyRouter);
app.use('/api/v1/missions', missionsRouter);

// Reset Database API endpoint
app.post('/api/v1/reset', (req: Request, res: Response) => {
  try {
    db.resetAll();
    res.json({ success: true, message: 'Database reset to default seed data successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root API welcome endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to NER-LINK AI Logistics Intelligence API',
    version: '2.4.0',
    documentation: '/api/v1/health',
    endpoints: [
      '/api/v1/health',
      '/api/v1/vehicles',
      '/api/v1/shipments',
      '/api/v1/incidents',
      '/api/v1/reports',
      '/api/v1/notifications',
      '/api/v1/activities',
      '/api/v1/routes/calculate',
      '/api/v1/states',
      '/api/v1/weather'
    ]
  });
});

// Global 404 Handler for undefined API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start Server
const serverPort = Number(PORT) || 5000;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 NER-LINK AI Backend Server running on port ${serverPort}`);
  console.log(`📡 Health Check: http://localhost:${serverPort}/api/health`);
  console.log(`🛰️ API Base URL: http://localhost:${serverPort}/api/v1`);
  console.log(`=======================================================`);
});

export default app;
