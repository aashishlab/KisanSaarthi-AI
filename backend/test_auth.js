const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testRegistration() {
  console.log('--- Testing Farmer Registration ---');
  try {
    const res = await axios.post(`${API_URL}/farmer/register`, {
      name: "Test Farmer " + Date.now(),
      phone: "12345678" + Math.floor(Math.random() * 90 + 10),
      password: "password123",
      village: "Test Village",
      vehicle_no: "TEST-" + Date.now(),
      crop_type: "Sugarcane",
      preferred_hub: "Test Hub"
    });
    console.log('SUCCESS:', res.data.message);
    return res.data;
  } catch (err) {
    console.error('FAILED:', err.response ? err.response.data : err.message);
  }
}

async function testLogin(phone, password) {
  console.log(`--- Testing Login for ${phone} ---`);
  try {
    const res = await axios.post(`${API_URL}/login`, { phone, password });
    console.log('SUCCESS: Login as', res.data.role, 'Token:', res.data.token.substring(0, 10) + '...');
    return res.data;
  } catch (err) {
    console.error('FAILED:', err.response ? err.response.data : err.message);
  }
}

async function runTests() {
  const farmer = await testRegistration();
  if (farmer) {
    // Note: Since we generated a random phone, we need to log it
    // But for this test script, we'll just use a known one if we want consistency
  }
  
  // Test with a known factory if one exists, or register one
  console.log('--- Testing Factory Registration ---');
  try {
    const res = await axios.post(`${API_URL}/factory/register`, {
      factory_name: "Test Factory " + Date.now(),
      phone: "98765432" + Math.floor(Math.random() * 90 + 10),
      password: "factorypass",
      hub_name: "Test Hub",
      category: "Sugar Mill",
      location: "Test Location",
      latitude: 1.0,
      longitude: 1.0,
      capacity_per_slot: 10
    });
    console.log('SUCCESS:', res.data.message);
    const factoryPhone = res.config.data.phone; // This might not work easily
  } catch (err) {
    console.error('FAILED:', err.response ? err.response.data : err.message);
  }
}

// runTests();
