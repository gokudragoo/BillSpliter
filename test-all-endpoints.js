// Comprehensive API Endpoint Testing Script for BillSplitr

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testGroupId = '';
let testExpenseId = '';

async function testEndpoint(name, method, endpoint, body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    
    console.log(`\n${response.ok ? '✅' : '❌'} ${name}`);
    console.log(`   ${method} ${endpoint}`);
    console.log(`   Status: ${response.status}`);
    if (data.message || data.error) {
      console.log(`   Message: ${data.message || data.error}`);
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`\n❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🧪 BillSplitr Comprehensive API Testing Suite');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const testEmail = `test${Date.now()}@billsplitr.com`;
  const testPassword = 'TestPassword123!';
  
  // 1. Test Authentication Endpoints
  console.log('\n📋 AUTHENTICATION ENDPOINTS');
  console.log('─────────────────────────────────────────────────────');
  
  const registerResult = await testEndpoint(
    'Register User',
    'POST',
    '/api/auth/register',
    { email: testEmail, password: testPassword, name: 'Test User' }
  );
  
  const loginResult = await testEndpoint(
    'Login User',
    'POST',
    '/api/auth/login',
    { email: testEmail, password: testPassword }
  );
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log(`   🔑 Auth Token: ${authToken.substring(0, 20)}...`);
  }
  
  await testEndpoint(
    'Get Current User',
    'GET',
    '/api/auth/me',
    null,
    { Authorization: `Bearer ${authToken}` }
  );
  
  await testEndpoint(
    'Link Wallet Address',
    'POST',
    '/api/auth/wallet',
    { walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
    { Authorization: `Bearer ${authToken}` }
  );
  
  // 2. Test Group Endpoints
  console.log('\n\n📋 GROUP MANAGEMENT ENDPOINTS');
  console.log('─────────────────────────────────────────────────────');
  
  const createGroupResult = await testEndpoint(
    'Create Group',
    'POST',
    '/api/groups',
    { 
      name: 'Test Group',
      description: 'A test group for API testing',
      currency: 'USDC'
    },
    { Authorization: `Bearer ${authToken}` }
  );
  
  if (createGroupResult.success && createGroupResult.data.group) {
    testGroupId = createGroupResult.data.group._id;
    console.log(`   🆔 Group ID: ${testGroupId}`);
  }
  
  await testEndpoint(
    'Get All Groups',
    'GET',
    '/api/groups',
    null,
    { Authorization: `Bearer ${authToken}` }
  );
  
  if (testGroupId) {
    await testEndpoint(
      'Get Specific Group',
      'GET',
      `/api/groups/${testGroupId}`,
      null,
      { Authorization: `Bearer ${authToken}` }
    );
    
    await testEndpoint(
      'Get Group Balances',
      'GET',
      `/api/groups/${testGroupId}/balances`,
      null,
      { Authorization: `Bearer ${authToken}` }
    );
  }
  
  // 3. Test Expense Endpoints
  console.log('\n\n📋 EXPENSE MANAGEMENT ENDPOINTS');
  console.log('─────────────────────────────────────────────────────');
  
  if (testGroupId) {
    const createExpenseResult = await testEndpoint(
      'Create Expense',
      'POST',
      '/api/expenses',
      {
        groupId: testGroupId,
        amount: 50.00,
        description: 'Test Dinner Expense',
        category: 'food',
        paidBy: testEmail,
        splitAmong: [testEmail]
      },
      { Authorization: `Bearer ${authToken}` }
    );
    
    if (createExpenseResult.success && createExpenseResult.data.expense) {
      testExpenseId = createExpenseResult.data.expense._id;
      console.log(`   🆔 Expense ID: ${testExpenseId}`);
    }
  }
  
  await testEndpoint(
    'Get All Expenses',
    'GET',
    '/api/expenses',
    null,
    { Authorization: `Bearer ${authToken}` }
  );
  
  if (testExpenseId) {
    await testEndpoint(
      'Get Specific Expense',
      'GET',
      `/api/expenses/${testExpenseId}`,
      null,
      { Authorization: `Bearer ${authToken}` }
    );
  }
  
  // 4. Test SideShift Endpoints
  console.log('\n\n📋 SIDESHIFT API ENDPOINTS');
  console.log('─────────────────────────────────────────────────────');
  
  await testEndpoint(
    'Get Available Coins',
    'GET',
    '/api/sideshift/coins'
  );
  
  await testEndpoint(
    'Create Shift (Quote)',
    'POST',
    '/api/sideshift/shift',
    {
      depositCoin: 'btc',
      settleCoin: 'usdc',
      depositAmount: '0.001',
      settleAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    }
  );
  
  // 5. Test Settlement Endpoints
  console.log('\n\n📋 SETTLEMENT ENDPOINTS');
  console.log('─────────────────────────────────────────────────────');
  
  if (testGroupId) {
    await testEndpoint(
      'Create Settlement',
      'POST',
      '/api/settlements',
      {
        groupId: testGroupId,
        from: testEmail,
        to: 'other@example.com',
        amount: 25.00,
        txHash: '0xabc123...',
        depositCoin: 'eth',
        settleCoin: 'usdc'
      },
      { Authorization: `Bearer ${authToken}` }
    );
  }
  
  await testEndpoint(
    'Get All Settlements',
    'GET',
    '/api/settlements',
    null,
    { Authorization: `Bearer ${authToken}` }
  );
  
  // 6. Test Receipt Endpoints
  console.log('\n\n📋 RECEIPT ANALYSIS ENDPOINTS');
  console.log('─────────────────────────────────────────────────────');
  
  await testEndpoint(
    'Analyze Receipt (without file)',
    'POST',
    '/api/receipts/analyze',
    { imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...' }
  );
  
  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  ✨ Testing Complete!');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('🔍 Review the results above to verify all endpoints.\n');
  console.log('📝 Key Test Data:');
  console.log(`   - Test Email: ${testEmail}`);
  console.log(`   - Test Password: ${testPassword}`);
  if (authToken) console.log(`   - Auth Token: ${authToken.substring(0, 30)}...`);
  if (testGroupId) console.log(`   - Group ID: ${testGroupId}`);
  if (testExpenseId) console.log(`   - Expense ID: ${testExpenseId}`);
  console.log('');
}

// Run all tests
runTests().catch(console.error);
