// API Test Script
// Run with: node test-api.js

// Mock environment for testing
global.fetch = require('node-fetch');

// Test endpoints - replace with actual Supabase URL and key
const SUPABASE_URL = 'your_supabase_url_here';
const SUPABASE_KEY = 'your_supabase_anon_key_here';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Get Stock Points
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stock_points`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const stockPoints = await response.json();
    console.log('✅ Stock Points:', stockPoints.length, 'items');
    console.log('Sample:', stockPoints[0]);
  } catch (error) {
    console.log('❌ Stock Points Error:', error.message);
  }

  // Test 2: Get Vehicles
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const vehicles = await response.json();
    console.log('✅ Vehicles:', vehicles.length, 'items');
    console.log('Sample:', vehicles[0]);
  } catch (error) {
    console.log('❌ Vehicles Error:', error.message);
  }

  // Test 3: Create Test Vehicle
  try {
    const testVehicle = {
      vehicle_number: 'TEST-001',
      weight: 1000,
      type: 'registered'
    };
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testVehicle)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Vehicle Created:', result);
    } else {
      console.log('❌ Vehicle Creation Failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Vehicle Creation Error:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
}

// Instructions
console.log('📋 Setup Instructions:');
console.log('1. Replace SUPABASE_URL and SUPABASE_KEY above');
console.log('2. Run: npm install node-fetch');
console.log('3. Run: node test-api.js');
console.log('\n');
