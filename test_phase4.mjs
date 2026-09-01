/**
 * NER-LINK PHASE 4 ML RISK PREDICTION & THEME TEST SUITE
 */

const API_BASE = 'http://127.0.0.1:5000/api/v1';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=======================================================');
  console.log('🧪 NER-LINK PHASE 4 ML PREDICTION & DISRUPTION TEST SUITE');
  console.log('=======================================================\n');

  try {
    // 1. ML Model Info
    const infoRes = await fetch(`${API_BASE}/ml/model-info`);
    const infoData = await infoRes.json();
    assert(
      infoRes.status === 200 && infoData.success && infoData.data.name.includes('NER Logistics Disruption'),
      `1. GET /api/v1/ml/model-info returns valid prototype model metadata (${infoData.data?.name})`
    );
    console.log(`   -> Model Version: ${infoData.data.version} | Features: ${infoData.data.featureNames?.length}`);

    // 2. ML Prediction: Low Risk Plains Condition
    const lowRiskRes = await fetch(`${API_BASE}/ml/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfallMm: 0,
        rainfallIntensity: 0,
        elevationMeters: 60,
        terrainFactor: 0,
        historicalIncidents: 1,
        activeIncidentsNearby: 0,
        roadCondition: 9.0,
        bridgeCondition: 9.0,
        trafficLevel: 0,
        routeDistanceKm: 120,
        routeDurationMinutes: 140,
        incidentSeverity: 0
      })
    });
    const lowRiskData = await lowRiskRes.json();
    assert(
      lowRiskRes.status === 200 && lowRiskData.success && lowRiskData.data.riskLevel === 'LOW',
      `2. POST /api/v1/ml/predict-risk: Low-risk plains scenario evaluated as LOW risk (${lowRiskData.data?.riskScore}%)`
    );

    // 3. ML Prediction: Severe Mountain Ghat Disruption Scenario
    const highRiskRes = await fetch(`${API_BASE}/ml/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfallMm: 85.0,
        rainfallIntensity: 4,
        elevationMeters: 1850,
        terrainFactor: 3,
        historicalIncidents: 6,
        activeIncidentsNearby: 2,
        roadCondition: 3.5,
        bridgeCondition: 4.0,
        trafficLevel: 3,
        routeDistanceKm: 420,
        routeDurationMinutes: 660,
        incidentSeverity: 3
      })
    });
    const highRiskData = await highRiskRes.json();
    assert(
      highRiskRes.status === 200 &&
      highRiskData.success &&
      (highRiskData.data.riskLevel === 'HIGH' || highRiskData.data.riskLevel === 'CRITICAL') &&
      highRiskData.data.landslideRisk === 'CRITICAL' &&
      highRiskData.data.estimatedDelayMinutes > 100,
      `3. POST /api/v1/ml/predict-risk: Extreme mountain storm scenario evaluated as CRITICAL disruption (+${highRiskData.data?.estimatedDelayMinutes}m delay)`
    );

    // 4. Route Intelligence Integration: Guwahati -> Aizawl
    const r1Res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Guwahati, Assam',
        destination: 'Aizawl, Mizoram',
        cargoType: 'Medical Supplies (Insulin, Vaccines)',
        vehicleType: 'Standard 4x4 Logistics Carrier',
        priority: 'CRITICAL'
      })
    });
    const r1 = await r1Res.json();
    assert(
      r1Res.status === 200 &&
      r1.success &&
      r1.data.mlPrediction &&
      r1.data.mlPrediction.modelName.includes('NER Logistics Disruption'),
      `4. POST /api/v1/routes/calculate: Guwahati -> Aizawl contains ML disruption prediction (${r1.data?.mlPrediction?.riskLevel}, ${r1.data?.mlPrediction?.disruptionProbability}%)`
    );
    console.log(`   -> Distance: ${r1.data.distanceKm} km | ETA: ${r1.data.estimatedTravelTime} | ML Delay: +${r1.data.mlPrediction.estimatedDelayMinutes}m | Landslide: ${r1.data.mlPrediction.landslideRisk}`);

    // 5. Route Intelligence Integration: Shillong -> Imphal
    const r2Res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Shillong, Meghalaya',
        destination: 'Imphal, Manipur'
      })
    });
    const r2 = await r2Res.json();
    assert(
      r2Res.status === 200 && r2.success && r2.data.mlPrediction !== undefined,
      `5. POST /api/v1/routes/calculate: Shillong -> Imphal contains ML prediction (${r2.data?.mlPrediction?.riskLevel})`
    );

    // 6. Route Intelligence Integration: Guwahati -> Itanagar
    const r3Res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Guwahati, Assam',
        destination: 'Itanagar, Arunachal Pradesh'
      })
    });
    const r3 = await r3Res.json();
    assert(
      r3Res.status === 200 && r3.success && r3.data.mlPrediction !== undefined,
      `6. POST /api/v1/routes/calculate: Guwahati -> Itanagar contains ML prediction (${r3.data?.mlPrediction?.riskLevel})`
    );

    // 7. Route Intelligence Integration: Gangtok -> Guwahati
    const r4Res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Gangtok, Sikkim',
        destination: 'Guwahati, Assam'
      })
    });
    const r4 = await r4Res.json();
    assert(
      r4Res.status === 200 && r4.success && r4.data.mlPrediction !== undefined,
      `7. POST /api/v1/routes/calculate: Gangtok -> Guwahati contains ML prediction (Landslide: ${r4.data?.mlPrediction?.landslideRisk})`
    );

    // 8. Resilient Fallback: Empty/Partial payload handled gracefully
    const fallbackRes = await fetch(`${API_BASE}/ml/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const fallbackData = await fallbackRes.json();
    assert(
      fallbackRes.status === 200 && fallbackData.success && fallbackData.data.riskScore >= 0,
      `8. POST /api/v1/ml/predict-risk: Empty input gracefully uses fallback default parameters without crashing`
    );

    console.log('\n=======================================================');
    console.log(`📊 PHASE 4 ML TEST SUMMARY: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test runner execution error:', err);
    process.exit(1);
  }
}

runTests();

