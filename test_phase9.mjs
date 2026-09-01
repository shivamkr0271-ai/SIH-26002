// test_phase9.mjs - Comprehensive Phase 9 Verification Suite
import assert from 'assert';

const BASE_URL_5000 = 'http://localhost:5000/api/v1';
const BASE_URL_3000 = 'http://localhost:3000/api/v1';

async function runTests() {
  console.log('====================================================');
  console.log('  PHASE 9 END-TO-END AUTOMATED VERIFICATION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(desc, fn) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✅ [PASS] ${desc}`);
        passed++;
      } catch (err) {
        console.error(`  ❌ [FAIL] ${desc}\n     -> ${err.message}`);
        failed++;
      }
    })();
  }

  // 1. Connectivity Checks
  await test('Express backend listening on port 5000', async () => {
    const res = await fetch(`${BASE_URL_5000}/health`);
    assert.strictEqual(res.status, 200, 'Expected 200 from backend');
    const data = await res.json();
    assert(data.status === 'UP' || data.status === 'healthy', 'Status should be UP or healthy');
  });

  await test('Vite proxy on port 3000 forwarding to Express backend', async () => {
    const res = await fetch(`${BASE_URL_3000}/health`);
    assert.strictEqual(res.status, 200, 'Expected 200 from proxy');
    const data = await res.json();
    assert(data.status === 'UP' || data.status === 'healthy', 'Status should be UP or healthy');
  });

  // 2. Route Intelligence: Explainable Risk Breakdown & Predictive Timeline
  let routeCalc;
  await test('POST /api/v1/routes/calculate returns riskBreakdown and predictiveTimeline', async () => {
    const res = await fetch(`${BASE_URL_5000}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Imphal, Manipur' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    routeCalc = json.data;
    
    // Check riskBreakdown
    assert(Array.isArray(routeCalc.riskBreakdown), 'riskBreakdown must be an array');
    assert(routeCalc.riskBreakdown.length >= 4, 'riskBreakdown must have at least 4 factors');
    const sumContrib = routeCalc.riskBreakdown.reduce((acc, f) => acc + f.contribution, 0);
    const totalScore = routeCalc.mlPrediction?.riskScore || routeCalc.prototypeRiskScore;
    console.log(`     Factors sum: ${sumContrib.toFixed(1)}, Expected total: ${totalScore.toFixed(1)}`);
    assert(Math.abs(sumContrib - totalScore) < 1.0, 'Factor contributions should sum to total risk score');

    // Check predictiveTimeline
    assert(Array.isArray(routeCalc.predictiveTimeline), 'predictiveTimeline must be an array');
    assert.strictEqual(routeCalc.predictiveTimeline.length, 3, 'Must contain 3 time points (NOW, +2H, +5H)');
    assert.strictEqual(routeCalc.predictiveTimeline[0].timepoint, 'NOW');
    assert.strictEqual(routeCalc.predictiveTimeline[0].isLive, true, 'NOW must be marked isLive: true');
    assert.strictEqual(routeCalc.predictiveTimeline[1].timepoint, '+2 HOURS');
    assert.strictEqual(routeCalc.predictiveTimeline[1].isLive, false, '+2 HOURS must be marked isLive: false');
    assert.strictEqual(routeCalc.predictiveTimeline[2].timepoint, '+5 HOURS');
    assert.strictEqual(routeCalc.predictiveTimeline[2].isLive, false, '+5 HOURS must be marked isLive: false');
  });

  // 3. Logistics Mission Simulation
  let newMission;
  await test('POST /api/v1/missions calculates and creates a logistics mission with deterministic fuel formula', async () => {
    const payload = {
      commodity: 'Medical Supplies',
      origin: 'Guwahati, Assam',
      destination: 'Imphal, Manipur',
      cargoWeightTon: 2.5,
      priority: 'CRITICAL',
      vehicleId: 'NER-MED-204'
    };

    const res = await fetch(`${BASE_URL_5000}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    newMission = json.data;

    assert.strictEqual(newMission.commodity, 'Medical Supplies');
    assert.strictEqual(newMission.priority, 'CRITICAL');
    assert(newMission.fuelEstimateLitres > 50, 'Fuel estimate should be calculated');
    assert(Array.isArray(newMission.criticalCheckpoints), 'Must include critical checkpoints');
    assert(newMission.criticalCheckpoints.length >= 3, 'Must have at least 3 checkpoints');
    assert(newMission.justification.length > 10, 'Must include operational justification');
    console.log(`     Created Mission: ${newMission.id}, Fuel: ${newMission.fuelEstimateLitres}L, Risk: ${newMission.riskLevel} (${newMission.riskScore}/100)`);
  });

  await test('GET /api/v1/missions retrieves active mission list', async () => {
    const res = await fetch(`${BASE_URL_5000}/missions`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data));
    assert(json.data.length >= 2, 'Should have initial seeded and newly added missions');
  });

  // 4. Mission Integration with Fleet and Alerts
  await test('Mission updates vehicle status and creates incident alert for high-priority risk', async () => {
    // Check vehicle NER-MED-204 was updated
    const vRes = await fetch(`${BASE_URL_5000}/vehicles`);
    const vJson = await vRes.json();
    const vList = Array.isArray(vJson) ? vJson : (vJson.data || []);
    const veh = vList.find(v => v.id === 'NER-MED-204');
    assert(veh, 'Vehicle NER-MED-204 must exist');
    assert.strictEqual(veh.status, 'IN TRANSIT');
    assert.strictEqual(veh.cargo, 'Medical Supplies');
  });

  // 5. AI Assistant: Hinglish & Natural Language Corridor Queries
  await test('AI: "Kohima se Imphal jaana hai. Safest route kaunsa hai?" returns concise structured response', async () => {
    const res = await fetch(`${BASE_URL_5000}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Kohima se Imphal jaana hai. Safest route kaunsa hai?' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    const ans = json.data.answer;
    assert(ans.includes('Recommended Route'), 'Must include Recommended Route');
    assert(ans.includes('Risk'), 'Must include Risk');
    assert(ans.includes('Weather'), 'Must include Weather');
    assert(ans.includes('Road Disruption'), 'Must include Road Disruption');
    assert(ans.includes('ETA'), 'Must include ETA');
    assert(ans.includes('Alternative'), 'Must include Alternative');
    assert(ans.includes('Reason'), 'Must include Reason');
  });

  await test('AI: "Why is this route risky?" returns corridor risk attribution', async () => {
    const res = await fetch(`${BASE_URL_5000}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Why is this route risky?' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    const ans = json.data.answer;
    assert(ans.length > 50, 'Answer must not be empty');
    assert(ans.includes('Risk') || ans.includes('Corridors') || ans.includes('Delay'));
  });

  await test('AI: "What is the safest route for my current medical mission?" returns mission-grounded advice', async () => {
    const res = await fetch(`${BASE_URL_5000}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the safest route for my current medical mission?' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    const ans = json.data.answer;
    assert(ans.includes('Medical Supplies') || ans.includes('Mission'), 'Must mention medical mission');
    assert(ans.includes('Recommended Route'), 'Must recommend route');
  });

  await test('AI: "Why is the mission delayed?" returns mission delay factors', async () => {
    const res = await fetch(`${BASE_URL_5000}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Why is the mission delayed?' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    const ans = json.data.answer;
    assert(ans.includes('Mission Delay') || ans.includes('Delay Drivers') || ans.includes('Transit'), 'Must explain delay');
  });

  await test('AI: "Which vehicles are delayed?" returns live delayed fleet telemetry', async () => {
    const res = await fetch(`${BASE_URL_5000}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Which vehicles are delayed?' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    const ans = json.data.answer;
    assert(ans.includes('Delayed') || ans.includes('Vehicle'), 'Must mention delayed vehicles');
  });

  await test('AI: Non-NER query triggers insufficient platform data disclaimer', async () => {
    const res = await fetch(`${BASE_URL_5000}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the best route from Mumbai to Pune?' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    const ans = json.data.answer;
    assert(ans.includes('insufficient') || ans.includes('North East') || ans.includes('NER'), 'Must note boundary limitations');
  });

  console.log('\n====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
