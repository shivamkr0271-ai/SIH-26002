import { Router, Request, Response } from 'express';
import { db, Mission, Incident } from '../db/database.js';
import { analyzeRoute } from '../services/routingService.js';
import { findLocation } from '../data/nerLocations.js';

const router = Router();

// GET /api/v1/missions - List all logistics missions
router.get('/', (req: Request, res: Response) => {
  try {
    const missions = db.getMissions();
    return res.json({
      success: true,
      data: missions,
      total: missions.length
    });
  } catch (error) {
    console.error('[Missions API] Error fetching missions:', error);
    return res.status(500).json({
      success: false,
      code: 'MISSION_FETCH_ERROR',
      error: 'Failed to retrieve logistics missions'
    });
  }
});

// GET /api/v1/missions/:id - Retrieve single mission
router.get('/:id', (req: Request, res: Response) => {
  try {
    const mission = db.getMissionById(req.params.id);
    if (!mission) {
      return res.status(404).json({
        success: false,
        code: 'MISSION_NOT_FOUND',
        error: `Mission ${req.params.id} not found`
      });
    }
    return res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('[Missions API] Error fetching mission by ID:', error);
    return res.status(500).json({
      success: false,
      code: 'MISSION_FETCH_ERROR',
      error: 'Failed to retrieve mission'
    });
  }
});

// POST /api/v1/missions - Create & Optimize Logistics Mission
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      commodity,
      origin,
      destination,
      cargoWeightTon,
      priority = 'NORMAL',
      vehicleId
    } = req.body;

    if (!commodity || typeof commodity !== 'string' || !commodity.trim()) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_COMMODITY',
        error: 'Mission commodity/cargo type is required.'
      });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_LOCATIONS',
        error: 'Both origin and destination are required for mission route optimization.'
      });
    }

    const originLoc = findLocation(origin);
    const destLoc = findLocation(destination);

    if (!originLoc || !destLoc) {
      return res.status(400).json({
        success: false,
        code: 'LOCATION_NOT_FOUND',
        error: `Could not resolve geographic hub for ${!originLoc ? origin : destination}.`
      });
    }

    if (originLoc.id === destLoc.id) {
      return res.status(400).json({
        success: false,
        code: 'SAME_ORIGIN_DESTINATION',
        error: 'Origin and destination hubs cannot be identical.'
      });
    }

    const weight = Math.max(0.5, Math.min(40, Number(cargoWeightTon) || 2.5));

    // 1. Execute live Route Intelligence analysis
    const routeAnalysis = await analyzeRoute({
      origin: `${originLoc.name}, ${originLoc.state}`,
      destination: `${destLoc.name}, ${destLoc.state}`,
      cargoType: commodity,
      priority: priority as any
    });

    const primaryScore = routeAnalysis.prototypeRiskScore;
    const altRoute = routeAnalysis.alternativeRoutes?.[0];
    const altScore = altRoute ? altRoute.prototypeRiskScore : primaryScore + 10;

    // Compare Primary vs Alternative Bypass:
    // If Primary has high/critical risk and Alternative has lower risk, recommend Alternative!
    const recommendAlternative = primaryScore >= 65 && altScore < primaryScore;

    const recommendedRouteName = recommendAlternative
      ? (altRoute?.name || 'Regional Bypass Corridor')
      : `Primary NH Corridor (${originLoc.connectedCorridors[0] || 'State Highway'})`;

    const alternateRouteName = recommendAlternative
      ? `Primary NH Corridor (${originLoc.connectedCorridors[0] || 'State Highway'})`
      : (altRoute?.name || 'Alternative Hill Bypass');

    const finalRiskScore = recommendAlternative ? altScore : primaryScore;
    const finalRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
      finalRiskScore <= 35 ? 'LOW' : finalRiskScore <= 60 ? 'MODERATE' : finalRiskScore <= 80 ? 'HIGH' : 'CRITICAL';

    const distanceKm = recommendAlternative && altRoute ? altRoute.distanceKm : routeAnalysis.distanceKm;
    const travelTime = recommendAlternative && altRoute ? altRoute.estimatedTravelTime : routeAnalysis.estimatedTravelTime;

    // 2. Deterministic Prototype Fuel Consumption Formula:
    // Distance * (0.28 L/km baseline + CargoWeight * 0.035) * (1 + AvgElevation/3000 * 0.25 elevation resistance)
    const avgElevation = (originLoc.elevationMeters + destLoc.elevationMeters) / 2;
    const elevationMultiplier = 1 + (avgElevation / 3000) * 0.25;
    const fuelConsumption = Math.round(distanceKm * (0.28 + weight * 0.035) * elevationMultiplier);

    // 3. Generate key corridor checkpoints
    const checkpoints: string[] = [
      `${originLoc.name} Dispatch Point`,
      `${originLoc.connectedCorridors[0] || 'Transit Toll Plaza'} Checkpoint`,
      `${destLoc.connectedCorridors[0] || 'Ghat Entry'} Junction`,
      `${destLoc.name} Receiving Terminal`
    ];

    // 4. Justification
    const justification = recommendAlternative
      ? `Alternative bypass recommended: Primary corridor has elevated disruption score (${primaryScore}/100) with severe weather/incidents. Bypass provides safer transit (${altScore}/100).`
      : `Primary route provides lowest combined disruption risk (${primaryScore}/100) with optimized transit time (${travelTime}).`;

    // 5. Connect to Fleet if vehicle provided
    let vehicleStatus: string | undefined = undefined;
    if (vehicleId) {
      const vehicle = db.getVehicleById(vehicleId);
      if (vehicle) {
        vehicleStatus = vehicle.status;
        db.updateVehicle(vehicleId, {
          status: 'IN TRANSIT',
          origin: originLoc.name,
          destination: destLoc.name,
          cargo: commodity,
          risk: finalRiskLevel
        });
      }
    }

    // 6. Assemble Mission
    const missionId = `MSN-2026-${Math.floor(Math.random() * 900 + 100)}`;
    const newMission: Mission = {
      id: missionId,
      commodity,
      origin: `${originLoc.name}, ${originLoc.state}`,
      destination: `${destLoc.name}, ${destLoc.state}`,
      cargoWeightTon: weight,
      priority: (priority.toUpperCase() as any) || 'NORMAL',
      vehicleId,
      vehicleStatus: vehicleStatus || 'ASSIGNED',
      recommendedRouteId: recommendAlternative ? 'ALT-CORRIDOR-01' : 'PRIMARY-01',
      recommendedRouteName,
      alternateRouteName,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      weatherStatus: routeAnalysis.weatherSummary
        ? `${routeAnalysis.weatherSummary.overallWeatherRisk} Risk (${routeAnalysis.weatherSummary.maxPrecipitationMm}mm rain) — ${routeAnalysis.weatherSummary.meteorologicalAdvisory || 'Standard visibility'}`
        : 'Stable Regional Weather (Clear)',
      eta: travelTime,
      estimatedDelayMinutes: routeAnalysis.estimatedDelayMinutes,
      fuelEstimateLitres: fuelConsumption,
      criticalCheckpoints: checkpoints,
      justification,
      status: 'OPTIMIZED',
      createdAt: new Date().toISOString()
    };

    db.addMission(newMission);

    // 7. Mission + Alerts Integration: If mission is CRITICAL/HIGH and route is CRITICAL/HIGH risk, generate an Alert!
    if ((newMission.priority === 'CRITICAL' || newMission.priority === 'HIGH') && (finalRiskLevel === 'CRITICAL' || finalRiskLevel === 'HIGH')) {
      const alertId = `INC-MSN-${Math.floor(Math.random() * 900 + 100)}`;
      const missionAlert: Incident = {
        id: alertId,
        title: `Mission Corridor Caution: ${newMission.commodity} (${newMission.id})`,
        type: 'Traffic',
        severity: newMission.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        status: 'ACTIVE',
        location: [originLoc.lat, originLoc.lng],
        locationName: `${originLoc.name} to ${destLoc.name} Transit Sector`,
        affectedRoute: recommendedRouteName,
        predictedImpact: `High priority mission ${newMission.id} traversing corridor with elevated risk (${finalRiskScore}/100). Escort and real-time GPS monitoring advised.`,
        recommendedAction: 'Maintain contact with convoy driver; monitor radar weather updates.',
        timestamp: new Date().toISOString()
      };
      db.addIncident(missionAlert);
    }

    return res.status(201).json({
      success: true,
      data: newMission,
      routeSummary: {
        distanceKm,
        eta: travelTime,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        weatherAdvisory: newMission.weatherStatus,
        fuelEstimateLitres: fuelConsumption,
        isEstimate: true
      },
      message: 'Logistics Mission successfully calculated and registered'
    });
  } catch (error: any) {
    console.error('[Missions API] Error creating mission:', error);
    return res.status(500).json({
      success: false,
      code: 'MISSION_CREATION_FAILED',
      error: error.message || 'Failed to create logistics mission'
    });
  }
});

export default router;
