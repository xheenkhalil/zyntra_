
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 1. Login as Superadmin to get token
async function loginSuperAdmin() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@zyntra.com', // Assuming this user exists
            password: 'password123'
        });
        const token = response.headers['set-cookie']?.[0]?.split(';')[0];
        console.log('✅ Logged in as Superadmin');
        return token;
    } catch (error: any) {
        console.error('❌ Login Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function testCRUD() {
    const cookie = await loginSuperAdmin();
    const headers = { Cookie: cookie };

    let quizId = '';

    // 2. CREATE
    console.log('\n--- Testing CREATE ---');
    try {
        const response = await axios.post(`${API_URL}/superadmin/guest-quizzes`, {
            title: 'Test Quiz CRUD',
            category: 'Testing'
        }, { headers });
        console.log('✅ Created Quiz:', response.data);
        quizId = response.data.id;
    } catch (error: any) {
        console.error('❌ Create Failed:', error.response?.data || error.message);
    }

    if (!quizId) return;

    // 3. UPDATE
    console.log('\n--- Testing UPDATE ---');
    try {
        const response = await axios.put(`${API_URL}/superadmin/guest-quizzes/${quizId}`, {
            title: 'Test Quiz CRUD Updated',
            category: 'Testing Updated',
            status: 'published'
        }, { headers });
        console.log('✅ Updated Quiz:', response.data);
    } catch (error: any) {
        console.error('❌ Update Failed:', error.response?.data || error.message);
    }

    // 4. DELETE
    console.log('\n--- Testing DELETE ---');
    try {
        const response = await axios.delete(`${API_URL}/superadmin/guest-quizzes/${quizId}`, { headers });
        console.log('✅ Deleted Quiz:', response.data);
    } catch (error: any) {
        console.error('❌ Delete Failed:', error.response?.data || error.message);
    }
}

testCRUD();
