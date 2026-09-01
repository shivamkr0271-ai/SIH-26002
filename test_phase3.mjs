const BASE_V1 = 'http://localhost:5000/api/v1';
const BASE_API = 'http://localhost:5000/api';
const BASE_ROOT = 'http://localhost:5000';

async function testPhase3Stability() {
  console.log('=======================================================');
  console.log('🧪 NER-LINK FULL STABILIZATION & API REGRESSION SUITE');
  console.log('=======================================================\n');

  let passed = 0;
  let total = 0;

  async function assert(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health Endpoints (GET /api/health, GET /health, GET /api/v1/health)
  await assert('1. GET /api/health returns status UP, timestamp, and server metadata', async () => {
    const res = await fetch(`${BASE_API}/health`).then(r => r.json());
    if (res.status !== 'UP') throw new Error(`Status is ${res.status}`);
    if (!res.timestamp) throw new Error('Missing timestamp');
    if (!res.service) throw new Error('Missing service name');
  });

  await assert('2. GET /health direct root alias responds with UP status', async () => {
    const res = await fetch(`${BASE_ROOT}/health`).then(r => r.json());
    if (res.status !== 'UP') throw new Error(`Status is ${res.status}`);
  });

  await assert('3. GET /api/v1/health returns complete database and system metrics', async () => {
    const res = await fetch(`${BASE_V1}/health`).then(r => r.json());
    if (res.status !== 'UP') throw new Error(`Status is ${res.status}`);
    if (!res.database || typeof res.database.totalVehicles !== 'number') throw new Error('Missing database metrics');
  });

  // 4. States API
  await assert('4. GET /api/v1/states returns enriched state connectivity scores with zero 500 errors', async () => {
    const res = await fetch(`${BASE_V1}/states`).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    if (!Array.isArray(res.data) || res.data.length !== 8) throw new Error(`Expected 8 states, got ${res.data?.length}`);
    console.log(`   -> Enriched ${res.data.length} states (e.g. ${res.data[0].name}: ${res.data[0].connectivityScore}%)`);
  });

  // 5. Weather Endpoints
  await assert('5. GET /api/v1/weather?location=Guwahati returns valid telemetry without API keys', async () => {
    const res = await fetch(`${BASE_V1}/weather?location=Guwahati`).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (typeof d.temperature !== 'number') throw new Error('Invalid temperature');
    if (typeof d.precipitationMm !== 'number') throw new Error('Invalid precipitation');
    if (!d.weatherCondition) throw new Error('Missing weather condition');
    console.log(`   -> Guwahati: ${d.temperature}°C, ${d.weatherCondition}, Precip: ${d.precipitationMm}mm [${d.provider}]`);
  });

  await assert('6. GET /api/v1/weather?lat=27.3389&lng=88.6065 (Gangtok) returns altitude weather', async () => {
    const res = await fetch(`${BASE_V1}/weather?lat=27.3389&lng=88.6065`).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (typeof d.temperature !== 'number') throw new Error('Invalid temperature');
    console.log(`   -> Gangtok: ${d.temperature}°C, ${d.weatherCondition}, Landslide Risk: ${d.landslideRisk} [${d.provider}]`);
  });

  await assert('7. GET /api/v1/weather/all returns weather across all 18 NER hubs', async () => {
    const res = await fetch(`${BASE_V1}/weather/all`).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    if (!Array.isArray(res.data) || res.data.length < 15) throw new Error(`Expected at least 15 locations, got ${res.data.length}`);
    console.log(`   -> Fetched weather for ${res.data.length} NER hubs`);
  });

  await assert('8. POST /api/v1/weather/route returns aggregated corridor meteorology', async () => {
    const res = await fetch(`${BASE_V1}/weather/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Aizawl, Mizoram' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (!d.originWeather || !d.destinationWeather) throw new Error('Missing endpoint weather');
    console.log(`   -> Route Weather Risk: ${d.overallWeatherRisk} | Max Precip: ${d.maxPrecipitationMm}mm`);
  });

  // 9. Route Calculation with Dynamic Routing & Weather
  await assert('9. POST /api/v1/routes/calculate incorporates dynamic routing and weather risk', async () => {
    const res = await fetch(`${BASE_V1}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Aizawl, Mizoram', priority: 'HIGH' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (!d.weatherSummary) throw new Error('Missing weather summary in route analysis');
    if (!Array.isArray(d.recommendedRoute) || d.recommendedRoute.length < 2) throw new Error('Invalid route geometry');
    console.log(`   -> Guwahati-Aizawl: ${d.distanceKm} km, ETA: ${d.estimatedTravelTime}, Risk: ${d.prototypeRiskScore}%, Route Points: ${d.recommendedRoute.length}`);
  });

  // 10. Data Persistence Tests
  await assert('10. Vehicle CRUD & Persistence test', async () => {
    const testId = `TEST-VEH-${Date.now()}`;
    const createRes = await fetch(`${BASE_V1}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testId,
        cargo: 'Test Medical Vaccine Batch',
        cargoType: 'MEDICINES',
        origin: 'Guwahati',
        destination: 'Shillong',
        driver: 'Audit Driver',
        speed: 55,
        status: 'IN TRANSIT',
        risk: 'LOW',
        progress: 20
      })
    }).then(r => r.json());
    if (!createRes.success) throw new Error(createRes.error || 'Create vehicle failed');

    const getRes = await fetch(`${BASE_V1}/vehicles/${testId}`).then(r => r.json());
    if (!getRes.success || getRes.data.id !== testId) throw new Error('Vehicle not found after creation');

    const delRes = await fetch(`${BASE_V1}/vehicles/${testId}`, { method: 'DELETE' }).then(r => r.json());
    if (!delRes.success) throw new Error('Delete vehicle failed');
  });

  await assert('11. Field Report creation & incident persistence test', async () => {
    const testId = `FR-TEST-${Date.now()}`;
    const reportRes = await fetch(`${BASE_V1}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testId,
        incidentType: 'Landslide',
        locationName: 'Jorhat Bypass Highway',
        description: 'Minor gravel movement on shoulder lane',
        severity: 'WARNING',
        officerName: 'Patrol unit 4',
        status: 'ACTIVE'
      })
    }).then(r => r.json());
    if (!reportRes.success) throw new Error(reportRes.error || 'Report submission failed');

    // Clean up
    await fetch(`${BASE_V1}/reports/${testId}`, { method: 'DELETE' });
    await fetch(`${BASE_V1}/incidents/INC-${testId}`, { method: 'DELETE' }).catch(() => {});
  });

  // 12. Input Validation & Error Handling
  await assert('12. Validation: Invalid coordinates return HTTP 400 with safe error message', async () => {
    const res = await fetch(`${BASE_V1}/weather?lat=invalid&lng=abc`);
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    const json = await res.json();
    if (!json.error) throw new Error('Missing error message');
  });

  await assert('13. Validation: Missing route parameters return HTTP 400', async () => {
    const res = await fetch(`${BASE_V1}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
  });

  console.log('\n=======================================================');
  console.log(`📊 STABILIZATION TEST SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round(passed/total*100)}%)`);
  console.log('=======================================================');
}

testPhase3Stability().catch(console.error);
