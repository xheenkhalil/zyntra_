
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testGuestRoutes() {
    console.log('Testing Guest Routes...');
    try {
        console.log('Fetching public quizzes...');
        const response = await axios.get(`${API_URL}/public/quizzes`);
        console.log(`✅ Status: ${response.status}`);
        console.log('Data:', response.data);
    } catch (error: any) {
        if (error.response) {
            console.error(`❌ FAILED - Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error('❌ FAILED - Network Error', error.message);
        }
    }

    console.log('\nTesting Admin Guest Quiz Route (Should Fail)...');
    try {
        const response = await axios.get(`${API_URL}/superadmin/guest-quizzes`);
        console.log(`❌ Status: ${response.status} (Should have failed)`);
    } catch (error: any) {
        if (error.response) {
            console.log(`✅ Expected Failure - Status: ${error.response.status}`);
            console.log('Data:', error.response.data);
        } else {
            console.error('❌ FAILED - Network Error', error.message);
        }
    }
}

testGuestRoutes();
