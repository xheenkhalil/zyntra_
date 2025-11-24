const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login endpoint...');
        const response = await axios.post('http://127.0.0.1:5001/api/auth/login', {
            email: 'test@example.com',
            password: 'password'
        });
        console.log('Login successful:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Login failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received');
        }
    }
}

testLogin();
