/**
 * AI RELEVANCE & TOPIC PURITY TEST SUITE
 * Tests all 8 exact user questions and ensures zero topic mixing and 100% grounded facts
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

async function testQuery(question, expectedIntent, expectedMustContain = [], forbiddenTerms = []) {
  console.log(`\n-----------------------------------------------------------`);
  console.log(`Testing Question: "${question}"`);
  console.log(`Expected Intent: ${expectedIntent}`);

  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: question,
      conversation: []
    })
  });

  const body = await res.json();
  const data = body.data;
  const answer = (data?.answer || '').toLowerCase();

  // Check HTTP status
  assert(res.status === 200 && body.success, `HTTP 200 Response for "${question}"`);

  // Check Intent classification
  assert(
    data?.intent === expectedIntent,
    `Intent classified as ${data?.intent} (expected: ${expectedIntent})`
  );

  // Check required terms are present
  const hasRequired = expectedMustContain.every(term => answer.includes(term.toLowerCase()));
  assert(
    hasRequired,
    `Answer contains required terms: [${expectedMustContain.join(', ')}]`,
    `Missing required terms in answer:\n${data?.answer}`
  );

  // Check forbidden terms (preventing topic mixing)
  const hasForbidden = forbiddenTerms.some(term => answer.includes(term.toLowerCase()));
  assert(
    !hasForbidden,
    `Answer contains NO forbidden/bleeding topics (e.g. [${forbiddenTerms.join(', ')}])`,
    `Found forbidden bleeding topic in answer:\n${data?.answer}`
  );

  console.log(`Provider: ${data?.provider} | Sources: [${(data?.sources || []).join(', ')}]`);
  console.log(`Answer:\n${data?.answer}\n`);

  return data;
}

async function runAll8Tests() {
  console.log('===========================================================');
  console.log('🤖 NER-LINK AI RELEVANCE & TOPIC PURITY AUDIT (8 QUESTIONS)');
  console.log('===========================================================');

  try {
    // Q1: "Which vehicles are delayed?"
    await testQuery(
      'Which vehicles are delayed?',
      'VEHICLE_STATUS',
      ['vehicle', 'delayed', 'ner-food-117'],
      ['rainfall', 'monsoon', 'temperature', 'wmo']
    );

    // Q2: "What is the current weather risk?"
    await testQuery(
      'What is the current weather risk?',
      'WEATHER_RISK',
      ['weather', 'rain', 'landslide risk'],
      ['trk-', 'ner-food', 'cargo']
    );

    // Q3: "Which route is safest?"
    await testQuery(
      'Which route is safest?',
      'SAFEST_ROUTE',
      ['safest', 'corridor', 'risk score'],
      ['ner-food-117', 'speed:']
    );

    // Q4: "Why is Guwahati to Aizawl risky?"
    await testQuery(
      'Why is Guwahati to Aizawl risky?',
      'SPECIFIC_CORRIDOR',
      ['guwahati', 'aizawl', 'elevation', 'delay'],
      []
    );

    // Q5: "What are the current major logistics bottlenecks?"
    await testQuery(
      'What are the current major logistics bottlenecks?',
      'BOTTLENECKS_INCIDENTS',
      ['bottleneck', 'incident', 'location'],
      ['fleet status overview']
    );

    // Q6: "Show me the current fleet status."
    await testQuery(
      'Show me the current fleet status.',
      'VEHICLE_STATUS',
      ['total fleet', 'in transit', 'vehicles'],
      ['wmo', 'precipitation']
    );

    // Q7: "How much delay is expected on this route?"
    await testQuery(
      'How much delay is expected on this route?',
      'ROUTE_DELAY',
      ['delay', 'corridor', 'minutes'],
      []
    );

    // Q8: "Are there any critical corridors right now?"
    await testQuery(
      'Are there any critical corridors right now?',
      'CRITICAL_CORRIDORS',
      ['corridor', 'risk score', 'predicted delay'],
      []
    );

    // Multi-turn topic switch test
    console.log(`\n-----------------------------------------------------------`);
    console.log(`Testing Multi-turn Topic Switching (Vehicle -> Weather)`);
    const multiTurnRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is the current weather risk?',
        conversation: [
          { role: 'user', content: 'Which vehicles are delayed?' },
          { role: 'model', content: 'Vehicle NER-FOOD-117 is currently delayed en route Silchar to Imphal.' }
        ]
      })
    });
    const multiTurnData = await multiTurnRes.json();
    const multiAnswer = (multiTurnData.data?.answer || '').toLowerCase();
    assert(
      multiTurnData.data?.intent === 'WEATHER_RISK',
      `Multi-turn correctly prioritized NEW user question (Intent: WEATHER_RISK)`
    );
    assert(
      multiAnswer.includes('weather') && !multiAnswer.includes('ner-food-117'),
      `Multi-turn response answered Weather and did NOT continue answering old vehicle topic`
    );

    console.log('\n===========================================================');
    console.log(`📊 AI AUDIT SUMMARY: ${passed}/${passed + failed} CHECKS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('===========================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Audit execution error:', err);
    process.exit(1);
  }
}

runAll8Tests();
