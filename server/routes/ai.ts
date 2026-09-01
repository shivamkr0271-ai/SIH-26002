import { Router, Request, Response } from 'express';
import { processAiChat } from '../services/aiService.js';

export const aiRouter = Router();

// POST /api/v1/ai/chat
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversation, routeContext } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.'
      });
    }

    const responsePayload = await processAiChat(message.trim(), conversation || [], routeContext);

    return res.status(200).json({
      success: true,
      data: responsePayload
    });
  } catch (err: any) {
    console.error('[AI API Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal AI service error occurred while processing request.'
    });
  }
});

// GET /api/v1/ai/status
aiRouter.get('/status', (req: Request, res: Response) => {
  const isKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() &&
    process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
  );

  return res.status(200).json({
    success: true,
    data: {
      assistantName: 'NIRA (North East Intelligence & Routing Assistant)',
      primaryProvider: isKeyConfigured ? 'GEMINI_2_0_FLASH' : 'GROUNDED_PLATFORM_REASONER',
      geminiConfigured: isKeyConfigured,
      version: '2.0.0',
      capabilities: [
        'Live Multi-Hub Weather Synthesis',
        'ML Disruption Prediction Reasoning',
        'Active Road Incident Correlation',
        'Vehicle Fleet Tracking Analysis',
        'Tactical Route Optimization Advice'
      ]
    }
  });
});

