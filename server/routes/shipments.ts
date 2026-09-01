import { Router, Request, Response } from 'express';
import { db, Shipment } from '../db/database.js';

export const shipmentRouter = Router();

// GET all shipments with optional priority or risk filters
shipmentRouter.get('/', (req: Request, res: Response) => {
  try {
    let shipments = db.getShipments();
    const { priority, risk, cargoType } = req.query;

    if (priority) {
      shipments = shipments.filter(s => s.priority.toLowerCase() === (priority as string).toLowerCase());
    }
    if (risk) {
      shipments = shipments.filter(s => s.risk.toLowerCase() === (risk as string).toLowerCase());
    }
    if (cargoType) {
      shipments = shipments.filter(s => s.cargoType.toLowerCase() === (cargoType as string).toLowerCase());
    }

    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET shipment by ID
shipmentRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const shipment = db.getShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: `Shipment with ID ${req.params.id} not found` });
    }
    res.json({ success: true, data: shipment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create shipment
shipmentRouter.post('/', (req: Request, res: Response) => {
  try {
    const { id, cargo, cargoType, origin, destination, priority, progress, eta, risk, aiRecommendation } = req.body;

    if (!id || !cargo || !origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing required shipment fields: id, cargo, origin, destination are required.'
      });
    }

    const newShipment: Shipment = {
      id: id.trim(),
      cargo: cargo.trim(),
      cargoType: cargoType || 'OTHER',
      origin: origin.trim(),
      destination: destination.trim(),
      priority: priority || 'MEDIUM',
      progress: Number(progress) || 0,
      eta: eta || 'Calculating...',
      risk: risk || 'LOW',
      aiRecommendation: aiRecommendation || 'Route clear. Regular monitoring active.'
    };

    const created = db.addShipment(newShipment);
    res.status(201).json({ success: true, message: 'Shipment created successfully', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update shipment
shipmentRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateShipment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Shipment with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: 'Shipment updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE shipment
shipmentRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteShipment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Shipment with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: `Shipment ${req.params.id} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

