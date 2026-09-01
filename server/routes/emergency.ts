import { Router, Request, Response } from 'express';
import { 
  getEmergencySummary, 
  getCriticalCorridors, 
  calculateEmergencyRouteRecommendation, 
  generateAutomatedAlerts,
  EmergencyCommodity
} from '../services/emergencyService.js';

export const emergencyRouter = Router();

// GET /api/v1/emergency/summary
emergencyRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = await getEmergencySummary();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/emergency/critical-corridors
emergencyRouter.get('/critical-corridors', async (req: Request, res: Response) => {
  try {
    const corridors = await getCriticalCorridors();
    res.json({ success: true, count: corridors.length, data: corridors });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/emergency/alerts
emergencyRouter.get('/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await generateAutomatedAlerts();
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/emergency/recommend-route
emergencyRouter.post('/recommend-route', async (req: Request, res: Response) => {
  try {
    const { origin, destination, commodity } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'origin and destination parameters are required.'
      });
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination cannot be identical for emergency routing.'
      });
    }

    const recommendation = await calculateEmergencyRouteRecommendation({
      origin: origin.trim(),
      destination: destination.trim(),
      commodity: (commodity || 'Medicines') as EmergencyCommodity
    });

    res.json({ success: true, data: recommendation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

