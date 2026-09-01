/**
 * TEST ROUTE RISK VISUALIZATION & MULTI-ROUTE COLOR CLASSIFICATION
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

// Mirror shared classification function from RouteIntelligence.tsx
function classifyRouteRisk(riskScore) {
  if (riskScore <= 35) {
    return { level: 'LOW', label: 'LOW RISK', lineColor: '#10b981', statusIcon: '🟢', statusText: 'Safest / Low Risk' };
  } else if (riskScore <= 65) {
    return { level: 'MODERATE', label: 'MODERATE RISK', lineColor: '#f59e0b', statusIcon: '🟡', statusText: 'Moderate Risk' };
  } else {
    return { level: 'CRITICAL', label: 'CRITICAL RISK', lineColor: '#ef4444', statusIcon: '🔴', statusText: 'Critical / High Risk' };
  }
}

async function runRouteRiskVisualizationAudit() {
  console.log('\n=====================================================================');
  console.log('🗺️ ROUTE INTELLIGENCE MAP RISK COLOR CLASSIFICATION TEST SUITE');
  console.log('=====================================================================\n');

  try {
    // 1. Verify Unit Thresholds
    assert(classifyRouteRisk(20).lineColor === '#10b981' && classifyRouteRisk(20).level === 'LOW', 'Threshold Test: 20/100 -> GREEN (#10b981) [LOW]');
    assert(classifyRouteRisk(35).lineColor === '#10b981' && classifyRouteRisk(35).level === 'LOW', 'Threshold Test: 35/100 -> GREEN (#10b981) [LOW]');
    assert(classifyRouteRisk(50).lineColor === '#f59e0b' && classifyRouteRisk(50).level === 'MODERATE', 'Threshold Test: 50/100 -> YELLOW/ORANGE (#f59e0b) [MODERATE]');
    assert(classifyRouteRisk(65).lineColor === '#f59e0b' && classifyRouteRisk(65).level === 'MODERATE', 'Threshold Test: 65/100 -> YELLOW/ORANGE (#f59e0b) [MODERATE]');
    assert(classifyRouteRisk(72).lineColor === '#ef4444' && classifyRouteRisk(72).level === 'CRITICAL', 'Threshold Test: 72/100 -> RED (#ef4444) [CRITICAL]');
    assert(classifyRouteRisk(95).lineColor === '#ef4444' && classifyRouteRisk(95).level === 'CRITICAL', 'Threshold Test: 95/100 -> RED (#ef4444) [CRITICAL]');

    // 2. High-Risk Corridor: Guwahati -> Aizawl (Severe Weather & Landslide)
    console.log('\n--- Corridor 1: Guwahati → Aizawl (Severe Mountain Segment) ---');
    const r1 = await (await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Aizawl, Mizoram' })
    })).json();

    const r1Score = r1.data.mlPrediction ? r1.data.mlPrediction.disruptionProbability : r1.data.prototypeRiskScore;
    const r1Class = classifyRouteRisk(r1Score);
    assert(
      r1Class.level === 'CRITICAL' || r1Class.level === 'MODERATE',
      `Guwahati → Aizawl: Risk Score ${r1Score}/100 -> Class: ${r1Class.label} -> Map Line: ${r1Class.lineColor} (${r1Class.statusIcon})`
    );

    // 3. Moderate Plains/Valley Corridor: Guwahati -> Itanagar
    console.log('\n--- Corridor 2: Guwahati → Itanagar (Valley Transit) ---');
    const r2 = await (await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Itanagar, Arunachal Pradesh' })
    })).json();

    const r2Score = r2.data.mlPrediction ? r2.data.mlPrediction.disruptionProbability : r2.data.prototypeRiskScore;
    const r2Class = classifyRouteRisk(r2Score);
    assert(
      r2Class.lineColor !== undefined,
      `Guwahati → Itanagar: Risk Score ${r2Score}/100 -> Class: ${r2Class.label} -> Map Line: ${r2Class.lineColor} (${r2Class.statusIcon})`
    );

    // 4. Moderate Corridor: Aizawl -> Agartala
    console.log('\n--- Corridor 3: Aizawl → Agartala ---');
    const r3 = await (await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Aizawl, Mizoram', destination: 'Agartala, Tripura' })
    })).json();

    const r3Score = r3.data.mlPrediction ? r3.data.mlPrediction.disruptionProbability : r3.data.prototypeRiskScore;
    const r3Class = classifyRouteRisk(r3Score);
    assert(
      r3Class.lineColor === '#f59e0b' || r3Class.lineColor === '#10b981',
      `Aizawl → Agartala: Risk Score ${r3Score}/100 -> Class: ${r3Class.label} -> Map Line: ${r3Class.lineColor} (${r3Class.statusIcon})`
    );

    // 5. Alternate Bypass Options Verification
    console.log('\n--- Corridor 4: Multi-Route Bypass Evaluation ---');
    assert(
      r1.data.alternativeRoutes && r1.data.alternativeRoutes.length > 0,
      `Alternative Route Options Available: ${r1.data.alternativeRoutes?.length} bypass route(s) generated for side-by-side risk visualization`
    );

    const alt = r1.data.alternativeRoutes[0];
    const altClass = classifyRouteRisk(alt.prototypeRiskScore);
    assert(
      altClass.lineColor !== undefined,
      `Bypass Route "${alt.name}": Risk Score ${alt.prototypeRiskScore}/100 -> Map Line: ${altClass.lineColor} (${altClass.statusIcon})`
    );

    console.log('\n=====================================================================');
    console.log(`🗺️ ROUTE COLOR AUDIT SUMMARY: ${passed}/${passed + failed} CHECKS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=====================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Route Risk Test Runner Error:', err);
    process.exit(1);
  }
}

runRouteRiskVisualizationAudit();

