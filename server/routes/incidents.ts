import { Router, Request, Response } from 'express';
import { db, Incident } from '../db/database.js';

export const incidentRouter = Router();

// GET all incidents / alerts with optional severity or status filter
incidentRouter.get('/', (req: Request, res: Response) => {
  try {
    let incidents = db.getIncidents();
    const { severity, status, type } = req.query;

    if (severity) {
      incidents = incidents.filter(i => i.severity.toLowerCase() === (severity as string).toLowerCase());
    }
    if (status) {
      incidents = incidents.filter(i => i.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (type) {
      incidents = incidents.filter(i => i.type.toLowerCase() === (type as string).toLowerCase());
    }

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET incident by ID
incidentRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const incident = db.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: `Incident with ID ${req.params.id} not found` });
    }
    res.json({ success: true, data: incident });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new incident alert
incidentRouter.post('/', (req: Request, res: Response) => {
  try {
    const { id, title, type, severity, status, location, locationName, affectedRoute, predictedImpact, recommendedAction, timestamp } = req.body;

    if (!title || !locationName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required incident fields: title and locationName are required.'
      });
    }

    const newIncident: Incident = {
      id: id || 'INC-' + Math.floor(Math.random() * 900 + 100),
      title: title.trim(),
      type: type || 'Other',
      severity: severity || 'WARNING',
      status: status || 'ACTIVE',
      location: location || [25.5, 91.5],
      locationName: locationName.trim(),
      affectedRoute: affectedRoute || 'Highway Corridor',
      predictedImpact: predictedImpact || 'Potential transit delay. Caution advised.',
      recommendedAction: recommendedAction || 'Reroute critical traffic if situation escalates.',
      timestamp: timestamp || new Date().toISOString()
    };

    const created = db.addIncident(newIncident);
    res.status(201).json({ success: true, message: 'Incident alert created successfully', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH / PUT update incident
incidentRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Incident with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: 'Incident updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST acknowledge incident
incidentRouter.post('/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const updated = db.updateIncident(req.params.id, { status: 'ACKNOWLEDGED' });
    if (!updated) {
      return res.status(404).json({ success: false, error: `Incident with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: 'Incident acknowledged', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST resolve incident
incidentRouter.post('/:id/resolve', (req: Request, res: Response) => {
  try {
    const updated = db.updateIncident(req.params.id, { status: 'RESOLVED' });
    if (!updated) {
      return res.status(404).json({ success: false, error: `Incident with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: 'Incident marked as resolved', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE incident
incidentRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteIncident(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Incident with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: `Incident ${req.params.id} archived successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

