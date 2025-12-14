const { MongoClient } = require('mongodb');

async function testAll() {
  console.log('=== Testing All API Keys ===\n');

  // Test MongoDB
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB: Connected successfully');
    await client.close();
  } catch (e) {
    console.error('❌ MongoDB Error:', e.message);
  }

  // Test Gemini
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    if (data.models) {
      console.log('✅ Gemini API: Working -', data.models.length, 'models available');
    } else {
      console.log('❌ Gemini Error:', data);
    }
  } catch (e) {
    console.error('❌ Gemini Error:', e.message);
  }

  // Test Pinata
  try {
    const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
      }
    });
    const data = await res.json();
    if (data.message) {
      console.log('✅ Pinata API:', data.message);
    } else {
      console.log('❌ Pinata Error:', data);
    }
  } catch (e) {
    console.error('❌ Pinata Error:', e.message);
  }

  // Test SideShift
  try {
    const res = await fetch('https://sideshift.ai/api/v2/coins');
    const data = await res.json();
    console.log('✅ SideShift API: Working -', data.length, 'coins available');
  } catch (e) {
    console.error('❌ SideShift Error:', e.message);
  }

  // Test Polygon RPC
  try {
    const res = await fetch(process.env.POLYGON_AMOY_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    const data = await res.json();
    if (data.result) {
      const blockNumber = parseInt(data.result, 16);
      console.log('✅ Polygon Amoy RPC: Connected - Block', blockNumber);
    } else {
      console.log('❌ Polygon RPC Error:', data);
    }
  } catch (e) {
    console.error('❌ Polygon RPC Error:', e.message);
  }

  console.log('\n=== Test Complete ===');
}

testAll();