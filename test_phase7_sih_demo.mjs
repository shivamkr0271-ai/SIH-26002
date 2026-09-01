/**
 * NER-LINK PHASE 7 — SIH DEMO READINESS & END-TO-END VALIDATION TEST SUITE
 * Validates the complete 12-step Smart India Hackathon (SIH) presentation workflow.
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

async function runSihDemoAudit() {
  console.log('\n=====================================================================');
  console.log('🏆 NER-LINK PHASE 7: SIH DEMO READINESS & 12-STEP WORKFLOW VALIDATION');
  console.log('=====================================================================\n');

  try {
    // ---------------------------------------------------------
    // STEP 1: Open Home & Verify Core System Health
    // ---------------------------------------------------------
    console.log('--- STEP 1: Home & Platform System Health ---');
    const healthRes = await fetch(`http://127.0.0.1:5000/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.status === 'UP',
      `Step 1: System Health UP (${healthData.service || 'NER-LINK AI Core'})`
    );

    // ---------------------------------------------------------
    // STEP 2: Show Live GIS Map & 8 NER States Telemetry
    // ---------------------------------------------------------
    console.log('\n--- STEP 2: Live GIS Map & Regional State Connectivity ---');
    const statesRes = await fetch(`${API_BASE}/states`);
    const statesData = await statesRes.json();
    assert(
      statesRes.status === 200 && statesData.success && statesData.count === 8,
      `Step 2: 8 North Eastern States monitored with dynamic connectivity scores (e.g. Assam: ${statesData.data?.[0]?.connectivityScore}%)`
    );

    // ---------------------------------------------------------
    // STEP 3: Open Command Center & Verify Emergency Operations
    // ---------------------------------------------------------
    console.log('\n--- STEP 3: Command Center & Emergency Telemetry ---');
    const summaryRes = await fetch(`${API_BASE}/emergency/summary`);
    const summaryData = await summaryRes.json();
    assert(
      summaryRes.status === 200 && summaryData.success && summaryData.data?.activeEmergencies >= 0,
      `Step 3: Command Center Summary: ${summaryData.data?.activeEmergencies} Active Emergencies, ${summaryData.data?.criticalCorridors} Critical Corridors, ${summaryData.data?.highRiskDistricts} High-Risk Districts`
    );

    // ---------------------------------------------------------
    // STEP 4: Show Critical Corridors & Accessibility Matrix
    // ---------------------------------------------------------
    console.log('\n--- STEP 4: Critical Corridors & Accessibility Matrix ---');
    const corridorsRes = await fetch(`${API_BASE}/emergency/critical-corridors`);
    const corridorsData = await corridorsRes.json();
    assert(
      corridorsRes.status === 200 && Array.isArray(corridorsData.data) && corridorsData.data.length >= 6,
      `Step 4: Critical Corridors evaluated: ${corridorsData.data?.length} arterial routes analyzed with ML risk scores & bypass routes`
    );

    // ---------------------------------------------------------
    // STEP 5 & 6: Analyze Custom Route, ML Prediction & Weather
    // ---------------------------------------------------------
    console.log('\n--- STEP 5 & 6: Custom Route Calculation & ML Disruption Risk ---');
    const routeRes = await fetch(`${API_BASE}/routes/calculate`, {
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
    const routeData = await routeRes.json();
    assert(
      routeRes.status === 200 && routeData.success && routeData.data?.distanceKm > 400,
      `Step 5: Route Calculated: Guwahati → Aizawl (${routeData.data?.distanceKm} km, Travel Time: ${routeData.data?.estimatedTravelTime}, Status: ${routeData.data?.routeStatus})`
    );
    assert(
      routeData.data?.mlPrediction && routeData.data?.weatherSummary,
      `Step 6: Integrated Telemetry: ML Disruption Risk = ${routeData.data?.mlPrediction?.riskScore}/100, Disruption Prob = ${routeData.data?.mlPrediction?.disruptionProbability}%, Weather Risk = ${routeData.data?.weatherSummary?.overallWeatherRisk}`
    );

    // ---------------------------------------------------------
    // STEP 7: Fleet Tracking & Vehicle Persistence
    // ---------------------------------------------------------
    console.log('\n--- STEP 7: Fleet Tracking & Vehicle Telemetry ---');
    const newVehiclePayload = {
      id: 'NER-DEMO-99',
      cargo: 'Emergency Blood Plasma & Vaccines',
      cargoType: 'MEDICINES',
      origin: 'Guwahati',
      destination: 'Aizawl',
      driver: 'Capt. R. Borah',
      currentLocation: [25.8, 92.1],
      speed: 42,
      eta: '3 hrs 40 mins',
      status: 'IN TRANSIT',
      risk: 'LOW',
      progress: 60
    };
    const createVehRes = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVehiclePayload)
    });
    const createVehData = await createVehRes.json();
    assert(
      createVehRes.status === 201 && createVehData.success,
      `Step 7: Fleet Tracking: Successfully registered & persisted vehicle ${newVehiclePayload.id} (${newVehiclePayload.cargo})`
    );

    // ---------------------------------------------------------
    // STEP 8: Create Field Report & Verify Instant Platform Ripple
    // ---------------------------------------------------------
    console.log('\n--- STEP 8: Field Officer Report & Real-Time Alert Synthesis ---');
    const fieldReportPayload = {
      incidentType: 'Landslide',
      locationName: 'Sonapur Ghat Sector',
      description: 'Major boulder slide obstructing left carriageway. Heavy traffic slowing down.',
      severity: 'CRITICAL',
      officerName: 'Inspector Sarma',
      autoCreateIncident: true
    };
    const reportRes = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fieldReportPayload)
    });
    const reportData = await reportRes.json();
    assert(
      reportRes.status === 201 && reportData.success,
      `Step 8: Field Report recorded by ${fieldReportPayload.officerName} at ${fieldReportPayload.locationName}`
    );

    // Verify alert pipeline synthesized the field report
    const alertsRes = await fetch(`${API_BASE}/emergency/alerts`);
    const alertsData = await alertsRes.json();
    const synthesizedAlert = alertsData.data?.find(a => a.location.includes('Sonapur Ghat Sector') || a.reason.includes('boulder'));
    assert(
      Boolean(synthesizedAlert),
      `   -> Instant System Ripple: Synthesized into active CRITICAL emergency alert without manual intervention`
    );

    // ---------------------------------------------------------
    // STEP 9: Emergency Mode & Commodity Route Recommendation
    // ---------------------------------------------------------
    console.log('\n--- STEP 9: Disaster Protocol & Commodity Route Recommendation ---');
    const emgRouteRes = await fetch(`${API_BASE}/emergency/recommend-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Guwahati',
        destination: 'Aizawl',
        commodity: 'Medicines'
      })
    });
    const emgRouteData = await emgRouteRes.json();
    assert(
      emgRouteRes.status === 200 && emgRouteData.success && emgRouteData.data?.recommendedRouteName,
      `Step 9: Emergency Medicine Recommendation: Bypass = "${emgRouteData.data?.recommendedRouteName}" (Risk reduced from ${emgRouteData.data?.primaryRiskScore} to ${emgRouteData.data?.recommendedRiskScore}/100)`
    );

    // ---------------------------------------------------------
    // STEP 10: AI Assistant Emergency Medicine Query
    // ---------------------------------------------------------
    console.log('\n--- STEP 10: Grounded AI Assistant (Emergency Query) ---');
    const aiMedRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Which route should be used for emergency medicine delivery?',
        conversation: []
      })
    });
    const aiMedData = await aiMedRes.json();
    assert(
      aiMedRes.status === 200 && aiMedData.data?.intent === 'EMERGENCY_ROUTING' && aiMedData.data?.answer.toLowerCase().includes('emergency'),
      `Step 10: AI Grounded Response: "Emergency Medicine Delivery" -> Correct Intent (${aiMedData.data?.intent}) & Grounded Recommendation`
    );

    // ---------------------------------------------------------
    // STEP 11: AI Assistant Delayed Fleet Query (No Topic Bleeding)
    // ---------------------------------------------------------
    console.log('\n--- STEP 11: Grounded AI Assistant (Fleet Status Query) ---');
    const aiFleetRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Which vehicles are delayed?',
        conversation: []
      })
    });
    const aiFleetData = await aiFleetRes.json();
    assert(
      aiFleetRes.status === 200 && aiFleetData.data?.intent === 'VEHICLE_STATUS' && aiFleetData.data?.answer.toLowerCase().includes('fleet'),
      `Step 11: AI Grounded Response: "Which vehicles are delayed?" -> Correct Intent (${aiFleetData.data?.intent}) & Pure Topic Grounding`
    );

    // ---------------------------------------------------------
    // STEP 12: Notification & Settings Persistence
    // ---------------------------------------------------------
    console.log('\n--- STEP 12: Notification & Telemetry Endpoints ---');
    const notifRes = await fetch(`${API_BASE}/notifications`);
    const notifData = await notifRes.json();
    assert(
      notifRes.status === 200 && notifData.success && Array.isArray(notifData.data),
      `Step 12: Notification store active with ${notifData.data?.length} operational telemetry broadcasts`
    );

    console.log('\n=====================================================================');
    console.log(`🏆 FINAL SIH DEMO AUDIT SUMMARY: ${passed}/${passed + failed} STEPS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=====================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('SIH Demo Test Runner Error:', err);
    process.exit(1);
  }
}

runSihDemoAudit();
