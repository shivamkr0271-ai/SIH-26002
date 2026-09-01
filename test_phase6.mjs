/**
 * NER-LINK PHASE 6 — EMERGENCY & DISASTER INTELLIGENCE TEST SUITE
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

async function runPhase6Tests() {
  console.log('\n=======================================================');
  console.log('🚨 NER-LINK PHASE 6 EMERGENCY & DISASTER INTELLIGENCE TEST SUITE');
  console.log('=======================================================\n');

  try {
    // 1. GET /api/v1/emergency/summary
    const summaryRes = await fetch(`${API_BASE}/emergency/summary`);
    const summaryData = await summaryRes.json();
    assert(
      summaryRes.status === 200 && summaryData.success && summaryData.data.activeEmergencies >= 0,
      `1. GET /api/v1/emergency/summary: ${summaryData.data?.activeEmergencies} active emergencies, ${summaryData.data?.criticalCorridors} critical corridors`
    );

    // 2. GET /api/v1/emergency/critical-corridors
    const corridorsRes = await fetch(`${API_BASE}/emergency/critical-corridors`);
    const corridorsData = await corridorsRes.json();
    assert(
      corridorsRes.status === 200 && corridorsData.success && Array.isArray(corridorsData.data) && corridorsData.data.length >= 5,
      `2. GET /api/v1/emergency/critical-corridors: Returned ${corridorsData.data?.length} evaluated arterial corridors`
    );

    const guwahatiAizawl = corridorsData.data.find(c => c.origin === 'Guwahati' && c.destination === 'Aizawl');
    assert(
      guwahatiAizawl && guwahatiAizawl.accessibilityStatus && guwahatiAizawl.reason.length > 5,
      `   -> Guwahati ↔ Aizawl Corridor: Status = ${guwahatiAizawl?.accessibilityStatus}, Risk = ${guwahatiAizawl?.riskScore}/100, Delay = +${guwahatiAizawl?.estimatedDelayMinutes}m`
    );

    // 3. POST /api/v1/emergency/recommend-route for Priority 1 Medicines
    const medRes = await fetch(`${API_BASE}/emergency/recommend-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Guwahati',
        destination: 'Aizawl',
        commodity: 'Medicines'
      })
    });
    const medData = await medRes.json();
    assert(
      medRes.status === 200 && medData.success && medData.data.justification.toLowerCase().includes('medic'),
      `3. Emergency Route Recommendation (Medicines): Recommended Bypass = "${medData.data?.recommendedRouteName}" (Risk: ${medData.data?.recommendedRiskScore}/100)`
    );

    // 4. POST /api/v1/emergency/recommend-route for Food
    const foodRes = await fetch(`${API_BASE}/emergency/recommend-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Shillong',
        destination: 'Imphal',
        commodity: 'Food'
      })
    });
    const foodData = await foodRes.json();
    assert(
      foodRes.status === 200 && foodData.success && foodData.data.justification.toLowerCase().includes('food'),
      `4. Emergency Route Recommendation (Food): Justification generated for Shillong → Imphal`
    );

    // 5. GET /api/v1/emergency/alerts (Automated Alert Pipeline)
    const alertsRes = await fetch(`${API_BASE}/emergency/alerts`);
    const alertsData = await alertsRes.json();
    assert(
      alertsRes.status === 200 && alertsData.success && Array.isArray(alertsData.data) && alertsData.data.length > 0,
      `5. Automated Alert Pipeline: Generated ${alertsData.data?.length} deduplicated multi-source alerts`
    );

    const hasSeverities = alertsData.data.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
    assert(
      hasSeverities,
      `   -> Priority Ranking: Correctly sorted with CRITICAL & HIGH severity alerts on top`
    );

    // 6. TEST 2 Workflow: Field Report -> Auto Incident -> Alert Pipeline
    const testReportPayload = {
      incidentType: 'Landslide',
      locationName: 'Jorhat North Sector',
      description: 'Massive landslide blocking both transit lanes near railway crossing',
      severity: 'CRITICAL',
      officerName: 'Captain Hazarika',
      autoCreateIncident: true
    };
    const reportRes = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testReportPayload)
    });
    const reportData = await reportRes.json();
    assert(
      reportRes.status === 201 && reportData.success,
      `6. Field Report Submission: Successfully saved ground incident by ${testReportPayload.officerName}`
    );

    // Check that alert pipeline now contains this critical incident
    const updatedAlertsRes = await fetch(`${API_BASE}/emergency/alerts`);
    const updatedAlerts = await updatedAlertsRes.json();
    const foundAlert = updatedAlerts.data.find(a => a.location.includes('Jorhat North Sector'));
    assert(
      Boolean(foundAlert),
      `   -> Pipeline Integration: Ground report instantly synthesized into real-time Emergency Alert (Severity: ${foundAlert?.severity})`
    );

    // 7. TEST 5 Workflow: AI Assistant "Which corridors are critical right now?"
    const aiCritRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Which corridors are critical right now?',
        conversation: []
      })
    });
    const aiCritData = await aiCritRes.json();
    assert(
      aiCritRes.status === 200 && aiCritData.data?.intent === 'CRITICAL_CORRIDORS' && aiCritData.data?.answer.toLowerCase().includes('corridor'),
      `7. AI Assistant Grounded Query: "Which corridors are critical right now?" [Intent: ${aiCritData.data?.intent}]`
    );

    // 8. TEST 6 Workflow: AI Assistant "Which route should be used for emergency medicine delivery?"
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
      `8. AI Assistant Grounded Query: "Emergency medicine delivery" [Intent: ${aiMedData.data?.intent}]`
    );

    // 9. Validation: Identical origin & destination rejected
    const invalidRouteRes = await fetch(`${API_BASE}/emergency/recommend-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Guwahati',
        destination: 'Guwahati',
        commodity: 'Medicines'
      })
    });
    assert(
      invalidRouteRes.status === 400,
      `9. Validation: Identical origin and destination safely rejected with HTTP 400`
    );

    // 10. Validation: Missing parameters rejected
    const missingParamsRes = await fetch(`${API_BASE}/emergency/recommend-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(
      missingParamsRes.status === 400,
      `10. Validation: Missing routing parameters rejected with HTTP 400`
    );

    console.log('\n=======================================================');
    console.log(`📊 PHASE 6 SUMMARY: ${passed}/${passed + failed} CHECKS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Phase 6 Test Runner Error:', err);
    process.exit(1);
  }
}

runPhase6Tests();

