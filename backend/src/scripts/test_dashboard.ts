import axios from 'axios';

const testDashboard = async () => {
    try {
        // You'll need to get the actual token from your browser cookies
        const response = await axios.get('http://localhost:5000/api/courseadmin/dashboard-batch', {
            withCredentials: true,
            headers: {
                'Cookie': 'token=YOUR_TOKEN_HERE' // Replace with actual token from browser
            }
        });
        console.log('✅ Success:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
};

testDashboard();
