import { Router, Request, Response } from 'express';
import { db, FieldReport } from '../db/database.js';

export const reportRouter = Router();

// GET all field reports
reportRouter.get('/', (req: Request, res: Response) => {
  try {
    let reports = db.getFieldReports();
    const { status, severity, incidentType } = req.query;

    if (status) {
      reports = reports.filter(r => r.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (severity) {
      reports = reports.filter(r => r.severity.toLowerCase() === (severity as string).toLowerCase());
    }
    if (incidentType) {
      reports = reports.filter(r => r.incidentType.toLowerCase() === (incidentType as string).toLowerCase());
    }

    res.json({ success: true, count: reports.length, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST submit a single field report
reportRouter.post('/', (req: Request, res: Response) => {
  try {
    const { id, incidentType, locationName, description, severity, officerName, status, latitude, longitude, autoCreateIncident } = req.body;

    if (!locationName || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field report parameters: locationName and description are required.'
      });
    }

    const newReport: FieldReport = {
      id: id || 'FR-' + Math.floor(Math.random() * 9000 + 1000),
      incidentType: incidentType || 'Landslide',
      locationName: locationName.trim(),
      description: description.trim(),
      severity: severity || 'WARNING',
      officerName: officerName || 'Field Officer',
      status: status || 'SYNCED',
      timestamp: new Date().toISOString(),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined
    };

    const shouldAutoCreate = autoCreateIncident !== undefined ? Boolean(autoCreateIncident) : true;
    const created = db.addFieldReport(newReport, shouldAutoCreate);

    res.status(201).json({ success: true, message: 'Field report recorded successfully', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST batch sync offline queued field reports
reportRouter.post('/sync', (req: Request, res: Response) => {
  try {
    const { reports } = req.body;
    if (!Array.isArray(reports)) {
      return res.status(400).json({ success: false, error: 'Payload must contain a "reports" array.' });
    }

    const result = db.syncReports(reports);
    res.json({
      success: true,
      message: `Successfully synchronized ${result.syncedCount} field report(s).`,
      syncedCount: result.syncedCount,
      data: result.reports
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update field report
reportRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateFieldReport(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Field report with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: 'Field report updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE field report
reportRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteFieldReport(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Field report with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: `Field report ${req.params.id} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

