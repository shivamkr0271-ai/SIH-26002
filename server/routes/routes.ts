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
    const { origin, destination, cargoType, vehicleType, priority } = req.body || {};

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Both "origin" and "destination" locations are required.',
        code: 'MISSING_REQUIRED_LOCATIONS'
      });
    }

    if (typeof origin !== 'string' || typeof destination !== 'string') {
      return res.status(400).json({
        success: false,
        error: '"origin" and "destination" must be valid location strings.',
        code: 'INVALID_LOCATION_TYPE'
      });
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Origin and Destination cannot be the same location. Please select different points.',
        code: 'SAME_ORIGIN_DESTINATION'
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
    const msg = err.message || 'Route analysis failed';
    const isUnrecognized = msg.includes('not a recognized NER hub');
    const isSame = msg.includes('cannot be the same');
    const isValidationError = isUnrecognized || isSame;
    
    const statusCode = isValidationError ? 400 : 500;
    const errorCode = isUnrecognized 
      ? 'LOCATION_NOT_FOUND' 
      : isSame 
        ? 'SAME_ORIGIN_DESTINATION' 
        : 'ROUTING_SERVICE_ERROR';

    res.status(statusCode).json({
      success: false,
      error: msg,
      code: errorCode
    });
  }
}

routeRouter.post('/analyze', handleRouteAnalysis);
routeRouter.post('/calculate', handleRouteAnalysis);
