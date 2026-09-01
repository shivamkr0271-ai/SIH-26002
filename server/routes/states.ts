import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const stateRouter = Router();

// GET all 8 NER states connectivity status
stateRouter.get('/', (req: Request, res: Response) => {
  try {
    const states = db.getStates();
    const activeIncidents = db.getIncidents().filter(i => i.status === 'ACTIVE');

    // Dynamically calculate state scores based on active incidents
    const enrichedStates = states.map(st => {
      const stateName = (st.name || '').toLowerCase();
      // Find incidents in state
      const stateIncidents = activeIncidents.filter(inc => {
        const loc = (inc.locationName || '').toLowerCase();
        const route = (inc.affectedRoute || '').toLowerCase();
        return loc.includes(stateName) || route.includes(stateName);
      });

      const penalty = stateIncidents.length * 7;
      const baseScore = typeof st.connectivityScore === 'number' ? st.connectivityScore : 88;
      const dynamicScore = Math.max(40, Math.min(100, baseScore - penalty));

      return {
        ...st,
        connectivityScore: dynamicScore,
        activeIncidents: Math.max(st.activeIncidents || 0, stateIncidents.length)
      };
    });

    res.json({ success: true, count: enrichedStates.length, data: enrichedStates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

