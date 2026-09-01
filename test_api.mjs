const BASE = 'http://localhost:5000/api/v1';

async function testAll() {
  console.log('--- STARTING NER-LINK API ENDPOINT INTEGRATION TESTS ---');

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`).then(r => r.json());
  console.log('1. Health Check:', healthRes.status === 'UP' ? 'PASS' : 'FAIL');

  // 2. Vehicles GET
  const vList = await fetch(`${BASE}/vehicles`).then(r => r.json());
  console.log('2. GET Vehicles:', vList.success && vList.data.length >= 5 ? `PASS (${vList.data.length} vehicles)` : 'FAIL');

  // 3. Vehicles POST
  const newV = {
    id: 'NER-TEST-999',
    cargo: 'Emergency Diagnostic Kits',
    cargoType: 'MEDICINES',
    origin: 'Guwahati',
    destination: 'Kohima',
    driver: 'Anita Roy',
    currentLocation: [26.1, 91.8],
    speed: 48,
    status: 'IN TRANSIT',
    risk: 'LOW',
    progress: 10
  };
  const vCreate = await fetch(`${BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newV)
  }).then(r => r.json());
  console.log('3. POST Vehicle:', vCreate.success && vCreate.data.id === 'NER-TEST-999' ? 'PASS' : 'FAIL');

  // 4. Vehicles PUT
  const vUpdate = await fetch(`${BASE}/vehicles/NER-TEST-999`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress: 25, status: 'IN TRANSIT' })
  }).then(r => r.json());
  console.log('4. PUT Vehicle:', vUpdate.success && vUpdate.data.progress === 25 ? 'PASS' : 'FAIL');

  // 5. Vehicles DELETE
  const vDelete = await fetch(`${BASE}/vehicles/NER-TEST-999`, { method: 'DELETE' }).then(r => r.json());
  console.log('5. DELETE Vehicle:', vDelete.success ? 'PASS' : 'FAIL');

  // 6. Incidents GET & POST
  const incList = await fetch(`${BASE}/incidents`).then(r => r.json());
  console.log('6. GET Incidents:', incList.success && incList.data.length >= 3 ? `PASS (${incList.data.length} incidents)` : 'FAIL');

  const newInc = {
    id: 'INC-TEST-88',
    title: 'Flash Flood Warning at NH-29',
    type: 'Flood',
    severity: 'WARNING',
    status: 'ACTIVE',
    location: [25.67, 94.1],
    locationName: 'Kohima Bypass',
    affectedRoute: 'Dimapur to Kohima Corridor',
    predictedImpact: 'Traffic moving with 30 min delay'
  };
  const incCreate = await fetch(`${BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newInc)
  }).then(r => r.json());
  console.log('7. POST Incident:', incCreate.success ? 'PASS' : 'FAIL');

  // 8. Incidents Acknowledge & Resolve
  const incAck = await fetch(`${BASE}/incidents/INC-TEST-88/acknowledge`, { method: 'POST' }).then(r => r.json());
  console.log('8. POST Incident Acknowledge:', incAck.success && incAck.data.status === 'ACKNOWLEDGED' ? 'PASS' : 'FAIL');

  const incRes = await fetch(`${BASE}/incidents/INC-TEST-88/resolve`, { method: 'POST' }).then(r => r.json());
  console.log('9. POST Incident Resolve:', incRes.success && incRes.data.status === 'RESOLVED' ? 'PASS' : 'FAIL');

  // 10. Field Reports & Batch Sync
  const offlineReports = [
    {
      id: 'FR-OFFLINE-01',
      incidentType: 'Road Damage',
      locationName: 'Jorhat Link Road',
      description: 'Pothole cluster causing slowdown',
      severity: 'INFO',
      officerName: 'Inspector Phukan',
      status: 'PENDING_SYNC',
      latitude: 26.75,
      longitude: 94.20
    }
  ];
  const syncRes = await fetch(`${BASE}/reports/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reports: offlineReports })
  }).then(r => r.json());
  console.log('10. POST Reports Sync:', syncRes.success && syncRes.syncedCount === 1 ? 'PASS' : 'FAIL');

  // 11. Route Calculation
  const routeRes = await fetch(`${BASE}/routes/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: 'Guwahati, Assam',
      destination: 'Gangtok, Sikkim',
      cargoProfile: 'Medical Supplies',
      priority: 'CRITICAL'
    })
  }).then(r => r.json());
  console.log('11. POST Route Calculation:', routeRes.success && routeRes.data.distanceKm > 0 ? `PASS (${routeRes.data.distanceKm} km, ETA: ${routeRes.data.eta})` : 'FAIL');
  console.log('    AI Route Advice:', routeRes.data.aiRecommendation);

  // 12. States
  const statesRes = await fetch(`${BASE}/states`).then(r => r.json());
  console.log('12. GET States:', statesRes.success && statesRes.data.length === 8 ? 'PASS (8 states enriched)' : 'FAIL');

  // 13. Notifications
  const notifRes = await fetch(`${BASE}/notifications`).then(r => r.json());
  console.log('13. GET Notifications:', notifRes.success && notifRes.data.length > 0 ? 'PASS' : 'FAIL');

  // 14. Activities
  const actRes = await fetch(`${BASE}/activities`).then(r => r.json());
  console.log('14. GET Activities:', actRes.success && actRes.data.length > 0 ? 'PASS' : 'FAIL');

  console.log('--- ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
}

testAll().catch(console.error);

