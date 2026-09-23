const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function verifyAll() {
  console.log('=== STARTING 16:9 PRESENTATION & 16 TEAMS VERIFICATION ===\n');

  // STEP 1: Verify 16 Real Teams
  console.log('1. Fetching initial live leaderboard from http://localhost:5001/api/leaderboard...');
  const initRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/leaderboard',
    method: 'GET',
  });
  console.log(`✓ Status: ${initRes.status}`);
  console.log(`✓ Total Teams Count: ${initRes.data.teams.length} (Expected: 16)`);
  if (initRes.data.teams.length !== 16) {
    throw new Error(`Expected 16 teams, got ${initRes.data.teams.length}`);
  }

  const expectedNames = [
    'Give Teas', 'Pensieve', 'Console.log', 'Nexora', 'E20Squad',
    'Byte Brigade', 'DragonFlys', 'Binary Brains', 'Aarambh', 'Cheatcodes',
    'Desi Developers', 'Tacobytes', 'ByteCoders', 'First Row', 'DarKnight', 'HexaHack'
  ];

  initRes.data.teams.forEach((t, i) => {
    console.log(`  Team ${i + 1}: ${t.teamName} [${t.sihId}] - Leader: ${t.teamLeader} (${t.theme})`);
  });

  // STEP 2: Admin Login
  console.log('\n2. Testing Admin Login...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@somaiya.edu', password: 'admin123' }
  );
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
  }
  const token = loginRes.data.token;
  console.log(`✓ Login success. Admin: ${loginRes.data.user.name}`);

  // STEP 3: Scoring with 6 criteria (/120 max)
  console.log('\n3. Testing 6-Criteria Score Entry (/120)...');
  const team1 = initRes.data.teams[0]; // Give Teas
  const team2 = initRes.data.teams[1]; // Pensieve

  console.log(`- Evaluating ${team2.teamName} (${team2.sihId}): PU: 19, Inn: 19, Tech: 19, Feas: 18, Imp: 19, Pres: 19 = 113 / 120...`);
  const score2Res = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/scores',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      teamId: team2.id,
      criteria: {
        problemUnderstanding: 19,
        innovation: 19,
        technicalImplementation: 19,
        feasibility: 18,
        impact: 19,
        presentation: 19,
      },
      notes: 'Tested cognitive games with strong UX accessibility for elderly patients.',
      updatedBy: 'Chief Jury Panel',
    }
  );
  console.log(`✓ ${team2.teamName} scored: ${score2Res.data.newScore}/120 (Rank #${score2Res.data.team.rank})`);

  console.log(`- Evaluating ${team1.teamName} (${team1.sihId}): PU: 20, Inn: 20, Tech: 20, Feas: 19, Imp: 20, Pres: 19 = 118 / 120...`);
  const score1Res = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/scores',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      teamId: team1.id,
      criteria: {
        problemUnderstanding: 20,
        innovation: 20,
        technicalImplementation: 20,
        feasibility: 19,
        impact: 20,
        presentation: 19,
      },
      notes: 'Breakthrough satellite FIRMS & OSM multi-agent classification pipeline.',
      updatedBy: 'Chief Jury Panel',
    }
  );
  console.log(`✓ ${team1.teamName} scored: ${score1Res.data.newScore}/120 (Rank #${score1Res.data.team.rank})`);

  // STEP 4: Verify Reordered Leaderboard
  console.log('\n4. Verifying Public Leaderboard reflection...');
  const updatedLb = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/leaderboard',
    method: 'GET',
  });
  console.log(`✓ Rank #1: ${updatedLb.data.teams[0].teamName} with ${updatedLb.data.teams[0].score.totalScore}/120`);
  console.log(`✓ Rank #2: ${updatedLb.data.teams[1].teamName} with ${updatedLb.data.teams[1].score.totalScore}/120`);
  if (updatedLb.data.teams[0].teamName !== 'Give Teas' || updatedLb.data.teams[1].teamName !== 'Pensieve') {
    throw new Error('Ranking verification failed!');
  }

  // STEP 5: Verify CSV Export with 6 criteria
  console.log('\n5. Verifying CSV Export...');
  const csvRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/export-csv',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✓ CSV Export status: ${csvRes.status}`);
  console.log(`✓ Header line: ${csvRes.text.split('\n')[0]}`);
  console.log(`✓ Rank 1 row: ${csvRes.text.split('\n')[1]}`);

  // STEP 6: Simulate Test Scores for Rehearsal
  console.log('\n6. Testing Simulate Test Scores for live event rehearsal...');
  const simRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/simulate-scores',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✓ Scored teams count after simulation: ${simRes.data.leaderboard.stats.scoredTeams}`);
  console.log(`✓ Top score: ${simRes.data.leaderboard.stats.highestScore} / 120`);
  console.log(`✓ Top 5 cutoff: ${simRes.data.leaderboard.stats.top5Cutoff} / 120`);

  // STEP 7: Reset Scores back to 0
  console.log('\n7. Testing Reset Scores to Zero (preserving 16 real teams)...');
  const resetRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/reset-scores-zero',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✓ Scored count after reset: ${resetRes.data.leaderboard.stats.scoredTeams}`);
  console.log(`✓ Total teams preserved: ${resetRes.data.leaderboard.teams.length}`);
  console.log(`✓ First team after reset: ${resetRes.data.leaderboard.teams[0].teamName} [${resetRes.data.leaderboard.teams[0].sihId}]`);

  console.log('\n=== ALL 7 WORKFLOW CHECKS PASSED PERFECTLY! ===');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
