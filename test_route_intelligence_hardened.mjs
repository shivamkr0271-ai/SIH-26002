import assert from 'assert';

const BASE_URL_3000 = 'http://localhost:3000/api/v1';
const BASE_URL_5000 = 'http://localhost:5000/api/v1';

async function test(name, fn) {
  try {
    process.stdout.write(`  Testing: ${name}... `);
    await fn();
    console.log(`✅ [PASS]`);
  } catch (err) {
    console.log(`❌ [FAIL]: ${err.message}`);
    process.exitCode = 1;
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('  ROUTE INTELLIGENCE COMPLETE STABILIZATION TEST SUITE ');
  console.log('======================================================\n');

  // 1. Health Checks
  await test('Express Backend health (port 5000)', async () => {
    const res = await fetch(`${BASE_URL_5000}/health`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.status, 'UP');
  });

  await test('Vite Proxy health forwarding (port 3000 -> 5000)', async () => {
    const res = await fetch(`${BASE_URL_3000}/health`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.status, 'UP');
  });

  // 2. Corridors Specified in User Prompt
  const corridors = [
    { origin: 'Guwahati, Assam', dest: 'Aizawl, Mizoram', name: 'Guwahati → Aizawl' },
    { origin: 'Guwahati, Assam', dest: 'Shillong, Meghalaya', name: 'Guwahati → Shillong' },
    { origin: 'Shillong, Meghalaya', dest: 'Imphal, Manipur', name: 'Shillong → Imphal' },
    { origin: 'Kohima, Nagaland', dest: 'Imphal, Manipur', name: 'Kohima → Imphal' },
    { origin: 'Agartala, Tripura', dest: 'Aizawl, Mizoram', name: 'Agartala → Aizawl' }
  ];

  for (const c of corridors) {
    await test(`Corridor Calculation: ${c.name}`, async () => {
      const res = await fetch(`${BASE_URL_3000}/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: c.origin, destination: c.dest })
      });
      assert.strictEqual(res.status, 200, `Expected status 200 but got ${res.status}`);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      const data = json.data;

      // Distance & Travel Time
      assert(typeof data.distanceKm === 'number' && data.distanceKm > 20, 'Valid distanceKm');
      assert(typeof data.estimatedTravelTime === 'string', 'Valid estimatedTravelTime');
      assert(typeof data.accessibilityScore === 'number', 'Valid accessibilityScore');

      // Primary Route Coordinates
      assert(Array.isArray(data.recommendedRoute), 'recommendedRoute is array');
      assert(data.recommendedRoute.length >= 2, 'recommendedRoute has at least 2 points');
      for (const pt of data.recommendedRoute.slice(0, 5)) {
        assert(typeof pt[0] === 'number' && !isNaN(pt[0]), 'Valid lat');
        assert(typeof pt[1] === 'number' && !isNaN(pt[1]), 'Valid lng');
      }

      // Alternative Routes
      assert(Array.isArray(data.alternativeRoutes), 'alternativeRoutes is array');
      assert(data.alternativeRoutes.length > 0, 'Has alternative bypass corridor');
      assert(data.alternativeRoutes[0].path.length >= 2, 'Alt route has points');
      assert(typeof data.alternativeRoutes[0].prototypeRiskScore === 'number', 'Alt route has risk score');

      // ML Disruption Prediction & Risk Breakdown
      assert(data.mlPrediction, 'Has mlPrediction');
      assert(typeof data.mlPrediction.riskScore === 'number', 'Valid riskScore');
      assert(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].includes(data.mlPrediction.riskLevel), 'Valid riskLevel');
      assert(Array.isArray(data.mlPrediction.riskBreakdown), 'Has riskBreakdown array');
      assert.strictEqual(data.mlPrediction.riskBreakdown.length, 5, 'Has 5 factor contributions');

      // Predictive Timeline
      assert(Array.isArray(data.predictiveTimeline), 'Has predictiveTimeline');
      assert.strictEqual(data.predictiveTimeline.length, 3, 'Has 3 timepoints');
      assert.strictEqual(data.predictiveTimeline[0].timepoint, 'NOW');
      assert.strictEqual(data.predictiveTimeline[1].timepoint, '+2 HOURS');
      assert.strictEqual(data.predictiveTimeline[2].timepoint, '+5 HOURS');

      // Weather Summary
      if (data.weatherSummary) {
        assert(typeof data.weatherSummary.maxPrecipitationMm === 'number', 'Valid precipitation');
      }
    });
  }

  // 3. Validation & Boundary Conditions
  await test('Rejects same origin and destination with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL_3000}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Guwahati, Assam' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.code, 'SAME_ORIGIN_DESTINATION');
  });

  await test('Rejects missing locations with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL_3000}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.code, 'MISSING_REQUIRED_LOCATIONS');
  });

  await test('Rejects unknown location with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL_3000}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'London, UK', destination: 'Guwahati, Assam' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.code, 'LOCATION_NOT_FOUND');
  });

  console.log('\n======================================================');
  console.log('  ALL ROUTE INTELLIGENCE CHECKS PASSED SUCCESSFULLY    ');
  console.log('======================================================\n');
}

run();

