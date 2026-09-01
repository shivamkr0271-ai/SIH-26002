/**
 * NER-LINK GROUNDED AI ASSISTANT (NIRA) TEST SUITE
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

async function testAiQuery(prompt, testNum, expectedKeywords = []) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      conversation: []
    })
  });

  const data = await res.json();
  const hasValidResponse = res.status === 200 && data.success && data.data && data.data.answer?.length > 20;
  
  let keywordsMatched = true;
  if (expectedKeywords.length > 0) {
    const text = (data.data?.answer || '').toLowerCase();
    keywordsMatched = expectedKeywords.some(kw => text.includes(kw.toLowerCase()));
  }

  const success = hasValidResponse && keywordsMatched;
  assert(
    success,
    `${testNum}. AI Query: "${prompt}" [Provider: ${data.data?.provider || 'NONE'}, Conf: ${data.data?.confidence}%]`
  );

  if (hasValidResponse) {
    console.log(`   -> Sources: [${(data.data.sources || []).join(', ')}]`);
    console.log(`   -> Snapshot: ${JSON.stringify(data.data.contextSnapshot || {})}`);
    console.log(`   -> Snippet: ${data.data.answer.substring(0, 100).replace(/\n/g, ' ')}...`);
  }

  return data.data;
}

async function runTests() {
  console.log('\n=======================================================');
  console.log('🤖 NER-LINK GROUNDED AI ASSISTANT (NIRA) TEST SUITE');
  console.log('=======================================================\n');

  try {
    // 1. GET /api/v1/ai/status
    const statusRes = await fetch(`${API_BASE}/ai/status`);
    const statusData = await statusRes.json();
    assert(
      statusRes.status === 200 && statusData.success && statusData.data.assistantName.includes('NIRA'),
      `1. GET /api/v1/ai/status: ${statusData.data?.assistantName} (Primary Engine: ${statusData.data?.primaryProvider})`
    );

    // 2. Query 1: Safest Route Recommendation
    await testAiQuery(
      'Which route is currently safest?',
      2,
      ['safest', 'corridor', 'risk']
    );

    // 3. Query 2: High Risk Corridors
    await testAiQuery(
      'Which corridors have high risk?',
      3,
      ['risk', 'disruption', 'corridor']
    );

    // 4. Query 3: Delayed Vehicle Fleet
    await testAiQuery(
      'Are any vehicles delayed?',
      4,
      ['fleet', 'vehicle', 'delayed']
    );

    // 5. Query 4: Live Weather Risk
    await testAiQuery(
      'What is the current weather risk?',
      5,
      ['weather', 'precip', 'rain', 'temperature']
    );

    // 6. Query 5: Active Road Incidents
    await testAiQuery(
      'What are the major road incidents?',
      6,
      ['incident', 'landslide', 'corridor', 'road']
    );

    // 7. Query 6: Emergency Delivery Routing
    await testAiQuery(
      'What route should I use for emergency delivery?',
      7,
      ['safest', 'corridor', 'emergency', 'delay']
    );

    // 8. Query 7: Specific Corridor Query (Guwahati to Aizawl)
    await testAiQuery(
      'Explain the status of Guwahati to Aizawl route',
      8,
      ['guwahati', 'aizawl', 'delay', 'risk']
    );

    // 9. Validation: Empty message returns HTTP 400
    const emptyRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });
    assert(
      emptyRes.status === 400,
      `9. Validation: Empty message returns HTTP 400 with safe error descriptor`
    );

    // 10. Validation: Missing payload returns HTTP 400
    const missingRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(
      missingRes.status === 400,
      `10. Validation: Missing payload returns HTTP 400`
    );

    console.log('\n=======================================================');
    console.log(`📊 AI SUITE SUMMARY: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('=======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test runner execution error:', err);
    process.exit(1);
  }
}

runTests();

