const BASE = 'http://localhost:5000/api/v1';

async function testPhase2() {
  console.log('=======================================================');
  console.log('🧪 RUNNING PHASE 2 GIS & ROUTE INTELLIGENCE TEST SUITE');
  console.log('=======================================================\n');

  let passed = 0;
  let total = 0;

  async function assert(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Locations endpoint
  await assert('1. GET /api/v1/routes/locations returns all major NER hubs', async () => {
    const res = await fetch(`${BASE}/routes/locations`).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    if (res.data.length < 15) throw new Error(`Expected at least 15 locations, got ${res.data.length}`);
    const names = res.data.map(l => l.name);
    const required = ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Itanagar', 'Tawang', 'Pasighat', 'Shillong', 'Tura', 'Imphal', 'Aizawl', 'Lunglei', 'Kohima', 'Dimapur', 'Agartala', 'Gangtok'];
    for (const r of required) {
      if (!names.includes(r)) throw new Error(`Missing required location: ${r}`);
    }
  });

  // 2. Guwahati -> Aizawl route
  await assert('2. POST /api/v1/routes/calculate: Guwahati → Aizawl', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Aizawl, Mizoram', priority: 'HIGH' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (d.distanceKm < 300 || d.distanceKm > 700) throw new Error(`Unexpected distance: ${d.distanceKm} km`);
    if (!d.recommendedRoute || d.recommendedRoute.length < 2) throw new Error('Missing recommendedRoute coordinates');
    if (!d.alternativeRoutes || d.alternativeRoutes.length === 0) throw new Error('Missing alternativeRoutes');
    console.log(`   -> Distance: ${d.distanceKm} km | ETA: ${d.estimatedTravelTime} | Risk: ${d.prototypeRiskScore}% | Status: ${d.routeStatus}`);
  });

  // 3. Shillong -> Imphal route
  await assert('3. POST /api/v1/routes/calculate: Shillong → Imphal', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Shillong, Meghalaya', destination: 'Imphal, Manipur', priority: 'CRITICAL' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (d.distanceKm < 200) throw new Error(`Unexpected distance: ${d.distanceKm} km`);
    console.log(`   -> Distance: ${d.distanceKm} km | ETA: ${d.estimatedTravelTime} | Risk: ${d.prototypeRiskScore}% | Incidents: ${d.nearbyIncidents?.length || 0}`);
  });

  // 4. Guwahati -> Itanagar route
  await assert('4. POST /api/v1/routes/calculate: Guwahati → Itanagar', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati, Assam', destination: 'Itanagar, Arunachal Pradesh' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (d.distanceKm < 200) throw new Error(`Unexpected distance: ${d.distanceKm} km`);
    console.log(`   -> Distance: ${d.distanceKm} km | ETA: ${d.estimatedTravelTime} | Risk: ${d.prototypeRiskScore}%`);
  });

  // 5. Gangtok -> Guwahati route
  await assert('5. POST /api/v1/routes/calculate: Gangtok → Guwahati', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Gangtok, Sikkim', destination: 'Guwahati, Assam' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (d.distanceKm < 350) throw new Error(`Unexpected distance: ${d.distanceKm} km`);
    console.log(`   -> Distance: ${d.distanceKm} km | ETA: ${d.estimatedTravelTime} | Risk: ${d.prototypeRiskScore}%`);
  });

  // 6. Aizawl -> Agartala route
  await assert('6. POST /api/v1/routes/calculate: Aizawl → Agartala', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Aizawl, Mizoram', destination: 'Agartala, Tripura' })
    }).then(r => r.json());
    if (!res.success) throw new Error(res.error || 'Failed');
    const d = res.data;
    if (d.distanceKm < 150) throw new Error(`Unexpected distance: ${d.distanceKm} km`);
    console.log(`   -> Distance: ${d.distanceKm} km | ETA: ${d.estimatedTravelTime} | Risk: ${d.prototypeRiskScore}%`);
  });

  // 7. Same origin/destination validation
  await assert('7. Validation: Same Origin and Destination returns HTTP 400', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati', destination: 'Guwahati' })
    });
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    const body = await res.json();
    if (!body.error.includes('cannot be the same')) throw new Error(`Expected same location error, got: ${body.error}`);
  });

  // 8. Invalid location validation
  await assert('8. Validation: Unrecognized location returns HTTP 400', async () => {
    const res = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Atlantis', destination: 'Guwahati' })
    });
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    const body = await res.json();
    if (!body.error.includes('not a recognized NER hub')) throw new Error(`Expected unknown hub error, got: ${body.error}`);
  });

  // 9. Route differences test
  await assert('9. Route Dynamic Results: Guwahati-Aizawl != Shillong-Imphal != Gangtok-Guwahati', async () => {
    const r1 = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Guwahati', destination: 'Aizawl' })
    }).then(r => r.json());

    const r2 = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Shillong', destination: 'Imphal' })
    }).then(r => r.json());

    const r3 = await fetch(`${BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Gangtok', destination: 'Guwahati' })
    }).then(r => r.json());

    if (r1.data.distanceKm === r2.data.distanceKm || r1.data.distanceKm === r3.data.distanceKm) {
      throw new Error('Distinct routes returned identical distances!');
    }
  });

  console.log('\n=======================================================');
  console.log(`📊 PHASE 2 TEST SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round(passed/total*100)}%)`);
  console.log('=======================================================');
}

testPhase2().catch(console.error);

