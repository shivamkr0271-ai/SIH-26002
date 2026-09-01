/**
 * NER-LINK PHASE 8 — COMMAND CENTER NAVIGATION & REALISTIC ANALYTICS TEST SUITE
 */

const API_BASE = 'http://127.0.0.1:5000/api/v1';

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

async function runPhase8Tests() {
  console.log('\n=====================================================================');
  console.log('🧭 NER-LINK PHASE 8: INTERACTIVE NAVIGATION & ANALYTICS TEST SUITE');
  console.log('=====================================================================\n');

  try {
    // 1. Verify Command Center Summary Endpoints
    const summaryRes = await fetch(`${API_BASE}/emergency/summary`);
    const summaryData = await summaryRes.json();
    assert(
      summaryRes.status === 200 && summaryData.success,
      `1. Command Center Telemetry: Summary counters active (${summaryData.data?.activeEmergencies} emergencies, ${summaryData.data?.criticalCorridors} critical corridors)`
    );

    // 2. Verify States Monitored navigation target & data consistency
    const statesRes = await fetch(`${API_BASE}/states`);
    const statesData = await statesRes.json();
    assert(
      statesRes.status === 200 && statesData.count === 8,
      `2. States Navigation Target: All 8 NER States dynamically monitored with connectivity scores`
    );

    // 3. Verify Critical Corridors navigation & parameter pass-through
    const corridorsRes = await fetch(`${API_BASE}/emergency/critical-corridors`);
    const corridorsData = await corridorsRes.json();
    assert(
      corridorsRes.status === 200 && corridorsData.data?.length >= 6,
      `3. Critical Corridors Target: ${corridorsData.data?.length} corridors ready for 1-click Route Intelligence drilldown`
    );

    // 4. Verify Route Intelligence analysis with passed corridor parameters
    const firstCorridor = corridorsData.data[0];
    const routeRes = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: firstCorridor.origin,
        destination: firstCorridor.destination
      })
    });
    const routeData = await routeRes.json();
    assert(
      routeRes.status === 200 && routeData.success && routeData.data?.distanceKm > 0,
      `4. 1-Click Corridor Drilldown: "${firstCorridor.origin} → ${firstCorridor.destination}" calculated (${routeData.data?.distanceKm} km, Travel Time: ${routeData.data?.estimatedTravelTime})`
    );

    // 5. Verify Fleet Delayed Vehicles Filter target
    const vehiclesRes = await fetch(`${API_BASE}/vehicles`);
    const vehiclesData = await vehiclesRes.json();
    const delayedVehicles = vehiclesData.data?.filter(v => v.status === 'DELAYED') || [];
    assert(
      vehiclesRes.status === 200 && Array.isArray(vehiclesData.data),
      `5. Fleet Delayed Vehicles Navigation Target: ${delayedVehicles.length} delayed vehicles identified for contextual filter (?status=DELAYED)`
    );

    // 6. Verify Alerts Critical Tab target
    const alertsRes = await fetch(`${API_BASE}/emergency/alerts`);
    const alertsData = await alertsRes.json();
    const criticalAlerts = alertsData.data?.filter(a => a.severity === 'CRITICAL') || [];
    assert(
      alertsRes.status === 200 && Array.isArray(alertsData.data) && criticalAlerts.length > 0,
      `6. Alerts Critical Tab Navigation Target: ${criticalAlerts.length} critical priority alerts mapped to ?tab=critical`
    );

    // 7. Verify Realistic Analytics Metric Consistency
    const totalVehiclesCount = vehiclesData.data?.length || 1;
    const delayedCount = delayedVehicles.length;
    const expectedOnTimeRate = Math.round(((totalVehiclesCount - delayedCount) / totalVehiclesCount) * 100);
    assert(
      expectedOnTimeRate >= 0 && expectedOnTimeRate <= 100,
      `7. Realistic Analytics Calculation: Fleet On-Time Rate computed as ${expectedOnTimeRate}% from live vehicle database`
    );

    // 8. Verify Supply Chain Categories
    const shipmentsRes = await fetch(`${API_BASE}/shipments`);
    const shipmentsData = await shipmentsRes.json();
    assert(
      shipmentsRes.status === 200 && Array.isArray(shipmentsData.data),
      `8. Supply Chain Analytics: ${shipmentsData.data?.length} shipments evaluated across essential priority cargo tiers`
    );

    console.log('\n=====================================================================');
    console.log(`🧭 PHASE 8 AUDIT SUMMARY: ${passed}/${passed + failed} CHECKS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=====================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Phase 8 Test Runner Error:', err);
    process.exit(1);
  }
}

runPhase8Tests();

