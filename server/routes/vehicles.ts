import { Router, Request, Response } from 'express';
import { db, Vehicle } from '../db/database.js';

export const vehicleRouter = Router();

// GET all vehicles with optional status or risk filters
vehicleRouter.get('/', (req: Request, res: Response) => {
  try {
    let vehicles = db.getVehicles();
    const { status, risk, cargoType } = req.query;

    if (status) {
      vehicles = vehicles.filter(v => v.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (risk) {
      vehicles = vehicles.filter(v => v.risk.toLowerCase() === (risk as string).toLowerCase());
    }
    if (cargoType) {
      vehicles = vehicles.filter(v => v.cargoType.toLowerCase() === (cargoType as string).toLowerCase());
    }

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// GET vehicle by ID
vehicleRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const vehicle = db.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: `Vehicle with ID ${req.params.id} not found` });
    }
    res.json({ success: true, data: vehicle });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST register new vehicle
vehicleRouter.post('/', (req: Request, res: Response) => {
  try {
    const { id, cargo, cargoType, origin, destination, driver, currentLocation, speed, eta, status, risk, progress } = req.body;

    if (!id || !cargo || !origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing required vehicle fields: id, cargo, origin, destination are required.'
      });
    }

    const newVehicle: Vehicle = {
      id: id.trim(),
      cargo: cargo.trim(),
      cargoType: cargoType || 'MEDICINES',
      origin: origin.trim(),
      destination: destination.trim(),
      driver: driver || 'Assigned Driver',
      currentLocation: currentLocation || [25.5, 91.5],
      speed: Number(speed) || 45,
      eta: eta || new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      status: status || 'IN TRANSIT',
      risk: risk || 'LOW',
      progress: Number(progress) || 0
    };

    const created = db.addVehicle(newVehicle);
    res.status(201).json({ success: true, message: 'Vehicle registered successfully', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update vehicle
vehicleRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateVehicle(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Vehicle with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: 'Vehicle updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE vehicle
vehicleRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteVehicle(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Vehicle with ID ${req.params.id} not found` });
    }
    res.json({ success: true, message: `Vehicle ${req.params.id} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

