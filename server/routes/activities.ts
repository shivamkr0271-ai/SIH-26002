import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const activityRouter = Router();

// GET recent activities
activityRouter.get('/', (req: Request, res: Response) => {
  try {
    const activities = db.getActivities();
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST record activity
activityRouter.post('/', (req: Request, res: Response) => {
  try {
    const { action, type, relatedId } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, error: 'action description is required.' });
    }
    const act = db.addActivity(action, type || 'system', relatedId);
    res.status(201).json({ success: true, data: act });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

