import { Router, Request, Response } from 'express';
import { analyzeRoute } from '../services/routingService.js';
import { NER_LOCATIONS } from '../data/nerLocations.js';

export const routeRouter = Router();

// GET all supported NER locations
routeRouter.get('/locations', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: NER_LOCATIONS.length,
      data: NER_LOCATIONS
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST calculate / analyze route
async function handleRouteAnalysis(req: Request, res: Response) {
  try {
    const { origin, destination, cargoType, vehicleType, priority } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Both "origin" and "destination" locations are required.'
      });
    }

    if (typeof origin !== 'string' || typeof destination !== 'string') {
      return res.status(400).json({
        success: false,
        error: '"origin" and "destination" must be valid location strings.'
      });
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Origin and Destination cannot be the same location. Please select different points.'
      });
    }

    const result = await analyzeRoute({
      origin: origin.trim(),
      destination: destination.trim(),
      cargoType,
      vehicleType,
      priority
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    const isValidationError = err.message.includes('not a recognized NER hub') || err.message.includes('cannot be the same');
    const statusCode = isValidationError ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Route analysis failed'
    });
  }
}

routeRouter.post('/analyze', handleRouteAnalysis);
routeRouter.post('/calculate', handleRouteAnalysis);
