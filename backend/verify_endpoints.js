const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001/api';
const ADMIN_SECRET = process.env.ADMIN_SECRET_PASSWORD || 'sunder_admin_2024';

async function verifyMetrics() {
    console.log('\n--- Verifying Admin Metrics ---');
    try {
        const response = await axios.get(`${BASE_URL}/admin/metrics`, {
            headers: { 'x-admin-secret': ADMIN_SECRET }
        });
        console.log('Status:', response.status);
        console.log('System Uptime:', response.data.system?.uptime);
        console.log('CPU Usage:', response.data.system?.cpu_usage);
        console.log('Total Users:', response.data.users?.total);
        console.log('AI Requests Today:', response.data.ai?.requests_today);
        console.log('✅ Metrics Verification Passed');
    } catch (error) {
        console.error('❌ Metrics Verification Failed:', error.response?.data || error.message);
    }
}

async function verifyExecution() {
    console.log('\n--- Verifying Code Execution (Piston) ---');
    try {
        // We use the admin secret to bypass auth if possible, or we'll just test the logic
        // For snippets/run, let's see if we can use admin secret there too
        const response = await axios.post(`${BASE_URL}/snippets/run`, {
            language: 'javascript',
            code: 'console.log("Sunder Runtime Verified");'
        }, {
            headers: { 'x-admin-secret': ADMIN_SECRET }
        });
        console.log('Status:', response.status);
        console.log('Output:', response.data.output?.trim());
        if (response.data.output?.includes('Sunder Runtime Verified')) {
            console.log('✅ Execution Verification Passed');
        } else {
            console.log('❌ Execution Verification Failed: Unexpected output');
        }
    } catch (error) {
        console.error('❌ Execution Verification Failed:', error.response?.data || error.message);
    }
}

async function verifyAnalysis() {
    console.log('\n--- Verifying Neural Analysis (Gemini) ---');
    try {
        const response = await axios.post(`${BASE_URL}/ai/analyze`, {
            language: 'javascript',
            code: 'function add(a, b) { return a + b; }'
        }, {
            headers: { 'x-admin-secret': ADMIN_SECRET }
        });
        console.log('Status:', response.status);
        console.log('Security Score:', response.data.score_aggregate?.security);
        console.log('Neural Feedback:', response.data.neural_analysis?.readability?.suggestions?.[0]);
        console.log('✅ Analysis Verification Passed');
    } catch (error) {
        console.error('❌ Analysis Verification Failed:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('Waiting for server to be ready...');
    setTimeout(async () => {
        await verifyMetrics();
        await verifyExecution();
        await verifyAnalysis();
        process.exit(0);
    }, 3000);
}

runTests();
