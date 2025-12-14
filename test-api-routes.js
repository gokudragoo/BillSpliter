const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testUserId = '';
let testGroupId = '';
let testExpenseId = '';

async function testRegister() {
  console.log('\n📝 Testing: POST /api/auth/register');
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test${Date.now()}@billsplitr.com`,
      password: 'test123456',
      name: 'Test User'
    })
  });
  
  const data = await res.json();
  if (res.ok) {
    console.log('✅ Register success:', data.user?.name);
    authToken = res.headers.get('set-cookie')?.split(';')[0];
    testUserId = data.user?.id;
  } else {
    console.log('❌ Register failed:', data);
  }
  return res.ok;
}

async function testLogin() {
  console.log('\n🔐 Testing: POST /api/auth/login');
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@billsplitr.com',
      password: 'test123'
    })
  });
  
  const data = await res.json();
  console.log(res.ok ? '✅ Login success' : '❌ Login failed:', data.error || data.user?.name);
  return res.ok;
}

async function testCreateGroup() {
  console.log('\n👥 Testing: POST /api/groups');
  const res = await fetch(`${BASE_URL}/api/groups`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': authToken
    },
    body: JSON.stringify({
      name: 'Test Group ' + Date.now(),
      currency: 'USD'
    })
  });
  
  const data = await res.json();
  if (res.ok) {
    console.log('✅ Group created:', data.group?.name);
    testGroupId = data.group?.id;
  } else {
    console.log('❌ Group creation failed:', data);
  }
  return res.ok;
}

async function testGetGroups() {
  console.log('\n📋 Testing: GET /api/groups');
  const res = await fetch(`${BASE_URL}/api/groups`, {
    headers: { 'Cookie': authToken }
  });
  
  const data = await res.json();
  console.log(res.ok ? `✅ Retrieved ${data.groups?.length || 0} groups` : '❌ Failed:', data);
  return res.ok;
}

async function testSideShiftCoins() {
  console.log('\n💱 Testing: GET /api/sideshift/coins');
  const res = await fetch(`${BASE_URL}/api/sideshift/coins`);
  
  const data = await res.json();
  console.log(res.ok ? `✅ SideShift: ${data.coins?.length || 0} coins available` : '❌ Failed:', data);
  return res.ok;
}

async function testGeminiAnalyze() {
  console.log('\n🤖 Testing: POST /api/receipts/analyze');
  const res = await fetch(`${BASE_URL}/api/receipts/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64Image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    })
  });
  
  const data = await res.json();
  console.log(res.ok ? '✅ Gemini analysis complete' : '❌ Failed:', data);
  return res.ok;
}

async function runTests() {
  console.log('═══════════════════════════════════════');
  console.log('  BillSplitr API Testing Suite');
  console.log('═══════════════════════════════════════');
  
  const tests = [
    { name: 'Register', fn: testRegister },
    { name: 'Login', fn: testLogin },
    { name: 'Create Group', fn: testCreateGroup },
    { name: 'Get Groups', fn: testGetGroups },
    { name: 'SideShift Coins', fn: testSideShiftCoins },
    { name: 'Gemini Analyze', fn: testGeminiAnalyze }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.log(`❌ ${test.name} error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log('═══════════════════════════════════════\n');
}

runTests();
