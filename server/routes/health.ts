import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const healthRouter = Router();

// GET server health and platform metrics
healthRouter.get('/', (req: Request, res: Response) => {
  try {
    const vehicles = db.getVehicles();
    const incidents = db.getIncidents();
    const shipments = db.getShipments();
    const reports = db.getFieldReports();
    const meta = db.getMeta();

    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'NER-LINK AI Logistics & Accessibility Intelligence API',
      version: meta.version,
      database: {
        type: 'Persistent JSON Document Store',
        totalVehicles: vehicles.length,
        activeIncidents: incidents.filter(i => i.status === 'ACTIVE').length,
        trackedShipments: shipments.length,
        fieldReportsCount: reports.length,
        lastUpdated: meta.lastUpdated
      },
      system: {
        gisEngine: 'OPERATIONAL',
        weatherFeed: 'OPERATIONAL',
        gpsFeed: 'OPERATIONAL',
        aiEngine: 'OPERATIONAL',
        fieldSync: 'OPERATIONAL'
      }
    });
  } catch (err: any) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

