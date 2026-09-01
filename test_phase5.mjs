/**
 * NER-LINK PHASE 5 FULL GIS MAP, ROUTE INTELLIGENCE & COMMAND CENTER TEST SUITE
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

async function testRoute(origin, destination, testNum) {
  const res = await fetch(`${API_BASE}/routes/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      destination,
      cargoType: 'Medical Supplies (Insulin, Vaccines)',
      vehicleType: 'Standard 4x4 Logistics Carrier',
      priority: 'CRITICAL'
    })
  });

  const data = await res.json();
  const success = res.status === 200 && data.success && data.data && data.data.recommendedRoute?.length > 1;
  assert(
    success,
    `${testNum}. Route Calculation: ${origin} → ${destination} (Dist: ${data.data?.distanceKm} km, ETA: ${data.data?.estimatedTravelTime}, ML Risk: ${data.data?.mlPrediction?.riskLevel || data.data?.routeStatus})`
  );
  if (success) {
    console.log(`   -> Waypoints: ${data.data.recommendedRoute.length} | Routing: ${data.data.routingProvider} | Delay: +${data.data.mlPrediction?.estimatedDelayMinutes || 0}m`);
  }
  return data.data;
}

async function runTests() {
  console.log('\n=======================================================');
  console.log('🧪 NER-LINK PHASE 5 GIS & ROUTE INTELLIGENCE TEST SUITE');
  console.log('=======================================================\n');

  try {
    // 1. Guwahati -> Aizawl
    const r1 = await testRoute('Guwahati, Assam', 'Aizawl, Mizoram', 1);

    // 2. Shillong -> Imphal
    const r2 = await testRoute('Shillong, Meghalaya', 'Imphal, Manipur', 2);

    // 3. Guwahati -> Itanagar
    const r3 = await testRoute('Guwahati, Assam', 'Itanagar, Arunachal Pradesh', 3);

    // 4. Gangtok -> Guwahati
    const r4 = await testRoute('Gangtok, Sikkim', 'Guwahati, Assam', 4);

    // 5. Aizawl -> Agartala
    const r5 = await testRoute('Aizawl, Mizoram', 'Agartala, Tripura', 5);

    // 6. Kohima -> Imphal
    const r6 = await testRoute('Kohima, Nagaland', 'Imphal, Manipur', 6);

    // 7. Test Location Geocoding Resolver across all 8 NER states
    const locsRes = await fetch(`${API_BASE}/routes/locations`);
    const locsData = await locsRes.json();
    const stateCount = new Set(locsData.data.map(l => l.state)).size;
    assert(
      locsRes.status === 200 && locsData.success && stateCount >= 8,
      `7. Location Resolver: Discovered hubs spanning ${stateCount} NER States (${locsData.data.length} total hubs)`
    );

    // 8. ML Disruption Risk Engine Integrated with Route
    assert(
      r1.mlPrediction && r1.mlPrediction.disruptionProbability > 0 && r1.mlPrediction.modelName,
      `8. ML Integration: Route result includes validated ML disruption probability (${r1.mlPrediction?.disruptionProbability}%)`
    );

    // 9. Validation: Same Origin and Destination
    const sameRes = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati', destination: 'Guwahati' })
    });
    assert(
      sameRes.status === 400,
      `9. Validation: Same origin and destination rejected with HTTP 400`
    );

    // 10. Validation: Unrecognized location handled safely
    const unkRes = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Unknown City XYZ', destination: 'Guwahati' })
    });
    assert(
      unkRes.status === 400,
      `10. Validation: Unrecognized city query handled safely without HTTP 500`
    );

    console.log('\n=======================================================');
    console.log(`📊 PHASE 5 TEST SUMMARY: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test runner execution error:', err);
    process.exit(1);
  }
}

runTests();

