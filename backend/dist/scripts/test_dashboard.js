"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const testDashboard = async () => {
    try {
        // You'll need to get the actual token from your browser cookies
        const response = await axios_1.default.get('http://localhost:5000/api/courseadmin/dashboard-batch', {
            withCredentials: true,
            headers: {
                'Cookie': 'token=YOUR_TOKEN_HERE' // Replace with actual token from browser
            }
        });
        console.log('✅ Success:', JSON.stringify(response.data, null, 2));
    }
    catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
};
testDashboard();
