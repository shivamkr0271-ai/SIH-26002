import { Router, Request, Response } from 'express';
import { getLocationWeather, getAllNerWeather, getRouteWeatherSummary } from '../services/weatherService.js';

export const weatherRouter = Router();

// GET weather for all NER locations
weatherRouter.get('/all', async (req: Request, res: Response) => {
  try {
    const data = await getAllNerWeather();
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET weather for a specific location or coordinates
weatherRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { location, lat, lng } = req.query;

    if (lat && lng) {
      const parsedLat = parseFloat(lat as string);
      const parsedLng = parseFloat(lng as string);
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({ success: false, error: 'Invalid lat or lng coordinate parameters' });
      }
      const data = await getLocationWeather({ lat: parsedLat, lng: parsedLng });
      return res.json({ success: true, data });
    }

    if (location && typeof location === 'string') {
      const data = await getLocationWeather(location);
      return res.json({ success: true, data });
    }

    // Default to Guwahati hub
    const data = await getLocationWeather('Guwahati');
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST corridor / route weather assessment
weatherRouter.post('/route', async (req: Request, res: Response) => {
  try {
    const { origin, destination, coordinates } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Both "origin" and "destination" are required for route weather analysis.'
      });
    }

    const summary = await getRouteWeatherSummary(origin, destination, coordinates);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

