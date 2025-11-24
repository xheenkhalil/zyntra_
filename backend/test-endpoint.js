const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/courseadmin/dashboard-batch',
    method: 'GET',
    headers: {
        'Cookie': 'token=your_token_here' // Replace with actual token from browser
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.end();
