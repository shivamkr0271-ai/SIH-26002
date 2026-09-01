import { Router, Request, Response } from 'express';
import { mlRiskService, MLRiskInput } from '../services/mlRiskService.js';

export const mlRouter = Router();

// POST /api/v1/ml/predict-risk
mlRouter.post('/predict-risk', (req: Request, res: Response) => {
  try {
    const input: MLRiskInput = req.body || {};
    const prediction = mlRiskService.predictRisk(input);

    res.json({
      success: true,
      data: prediction
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Error executing ML risk prediction model.'
    });
  }
});

// GET /api/v1/ml/model-info
mlRouter.get('/model-info', (req: Request, res: Response) => {
  try {
    const info = mlRiskService.getModelInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

