
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
    console.log('Testing Superadmin Dashboard Endpoints...');

    const endpoints = [
        '/superadmin/stats',
        '/superadmin/charts/user-growth',
        '/superadmin/charts/performance',
        '/superadmin/activity-feed',
        '/superadmin/organizations'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint}...`);
            const response = await axios.get(`${API_URL}${endpoint}`);
            console.log(`✅ ${endpoint} - Status: ${response.status}`);
            console.log('Data:', JSON.stringify(response.data).substring(0, 100) + '...');
        } catch (error: any) {
            if (error.response) {
                console.log(`⚠️ ${endpoint} - Status: ${error.response.status} (Expected if not authenticated)`);
                if (error.response.status === 404) {
                    console.error(`❌ ${endpoint} - FAILED (404 Not Found)`);
                }
            } else {
                console.error(`❌ ${endpoint} - FAILED (Network Error)`);
            }
        }
    }
}

testEndpoints();
