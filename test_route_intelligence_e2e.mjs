/**
 * COMPLETE ROUTE INTELLIGENCE E2E AUDIT & STABILIZATION VERIFICATION
 */

const BACKEND_URL = 'http://localhost:5000/api/v1';
const PROXY_URL = 'http://localhost:3000/api/v1';

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    if (details) console.error(`   Details: ${details}`);
    failed++;
  }
}

async function runE2EAudit() {
  console.log('\n=====================================================================');
  console.log('🚀 ROUTE INTELLIGENCE END-TO-END DIAGNOSTIC & STABILIZATION SUITE');
  console.log('=====================================================================\n');

  try {
    // 1. Direct Backend Health
    console.log('--- 1. Direct Backend Connectivity (port 5000) ---');
    const health5000 = await (await fetch('http://localhost:5000/health')).json();
    assert(health5000.status === 'UP', 'Express Backend is UP on port 5000');

    // 2. Proxied Frontend Health
    console.log('\n--- 2. Vite Proxy Connectivity (port 3000 -> 5000) ---');
    const health3000 = await (await fetch('http://localhost:3000/api/v1/health')).json();
    assert(health3000.status === 'UP' || health3000.data?.status === 'UP', 'Vite Proxy on port 3000 successfully forwards /api requests to port 5000');

    // 3. Test Multi-Corridors through Vite Proxy
    console.log('\n--- 3. Multiple NER Corridors Calculation via Vite Proxy ---');
    const corridors = [
      { origin: 'Guwahati, Assam', dest: 'Aizawl, Mizoram', name: 'Guwahati → Aizawl' },
      { origin: 'Guwahati, Assam', dest: 'Shillong, Meghalaya', name: 'Guwahati → Shillong' },
      { origin: 'Shillong, Meghalaya', dest: 'Imphal, Manipur', name: 'Shillong → Imphal' },
      { origin: 'Kohima, Nagaland', dest: 'Imphal, Manipur', name: 'Kohima → Imphal' },
      { origin: 'Agartala, Tripura', dest: 'Aizawl, Mizoram', name: 'Agartala → Aizawl' },
      { origin: 'Guwahati, Assam', dest: 'Itanagar, Arunachal Pradesh', name: 'Guwahati → Itanagar' },
      { origin: 'Silchar, Assam', dest: 'Agartala, Tripura', name: 'Silchar → Agartala' }
    ];

    for (const c of corridors) {
      const t0 = Date.now();
      const res = await fetch(`${PROXY_URL}/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: c.origin, destination: c.dest })
      });
      const elapsed = Date.now() - t0;
      assert(res.status === 200, `${c.name}: HTTP status 200 (took ${elapsed}ms)`);
      
      const json = await res.json();
      assert(json.success === true, `${c.name}: success flag is true`);
      assert(json.data && json.data.distanceKm > 0, `${c.name}: Distance returned: ${json.data?.distanceKm} km`);
      assert(Array.isArray(json.data.recommendedRoute) && json.data.recommendedRoute.length >= 2, `${c.name}: Waypoints: ${json.data.recommendedRoute.length}`);
      assert(json.data.weatherSummary && json.data.weatherSummary.overallWeatherRisk, `${c.name}: Weather risk: ${json.data.weatherSummary?.overallWeatherRisk}`);
      assert(json.data.mlPrediction && typeof json.data.mlPrediction.disruptionProbability === 'number', `${c.name}: ML Disruption Probability: ${json.data.mlPrediction?.disruptionProbability}%`);
    }

    // 4. Structured Error Handling Validation
    console.log('\n--- 4. Structured Error Handling & Validations ---');
    // 4a. Same origin and destination
    const sameRes = await fetch(`${PROXY_URL}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Guwahati, Assam' })
    });
    assert(sameRes.status === 400, 'Same origin/dest rejected with HTTP 400');
    const sameJson = await sameRes.json();
    assert(sameJson.code === 'SAME_ORIGIN_DESTINATION', `Structured error code: ${sameJson.code}`);

    // 4b. Missing locations
    const missingRes = await fetch(`${PROXY_URL}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(missingRes.status === 400, 'Missing locations rejected with HTTP 400');
    const missingJson = await missingRes.json();
    assert(missingJson.code === 'MISSING_REQUIRED_LOCATIONS', `Structured error code: ${missingJson.code}`);

    // 4c. Unknown location
    const unknownRes = await fetch(`${PROXY_URL}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Unknown City XYZ', destination: 'Guwahati, Assam' })
    });
    assert(unknownRes.status === 400, 'Unknown location rejected with HTTP 400');
    const unknownJson = await unknownRes.json();
    assert(unknownJson.code === 'LOCATION_NOT_FOUND', `Structured error code: ${unknownJson.code}`);

    // 5. Alternate Bypass Options & Safest Route Recommendation
    console.log('\n--- 5. Alternate Bypass Routes & Safest Option Identification ---');
    const routeRes = await fetch(`${PROXY_URL}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Aizawl, Mizoram' })
    });
    const routeData = (await routeRes.json()).data;
    assert(routeData.alternativeRoutes && routeData.alternativeRoutes.length > 0, `Alternative routes count: ${routeData.alternativeRoutes.length}`);
    
    // Check risk classifications
    const primaryScore = routeData.mlPrediction.disruptionProbability;
    const altScore = routeData.alternativeRoutes[0].prototypeRiskScore;
    assert(primaryScore >= 0 && primaryScore <= 100, `Primary route risk score valid: ${primaryScore}`);
    assert(altScore >= 0 && altScore <= 100, `Alternative route risk score valid: ${altScore}`);

    console.log('\n=====================================================================');
    console.log(`📊 E2E AUDIT SUMMARY: ${passed}/${passed + failed} CHECKS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=====================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Audit Script Error:', err);
    process.exit(1);
  }
}

runE2EAudit();

