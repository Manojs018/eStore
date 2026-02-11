
async function testLogs() {
    try {
        // 1. Login as Admin
        // Try standard admin from seed/tests
        console.log('Attempting login with admin@test.com...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@estore.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        console.log('Login success');
        const token = loginData.data.token;

        // 2. Fetch Logs
        console.log('Fetching logs...');
        const logsRes = await fetch('http://localhost:5000/api/admin/logs', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!logsRes.ok) {
            console.error('Fetch logs failed:', logsRes.status, await logsRes.text());
            return;
        }

        const logsData = await logsRes.json();
        console.log('Logs fetched successfully');
        console.log('Count:', logsData.count);
        // Print first log to verify structure
        if (logsData.data.length > 0) {
            console.log('First Log:', JSON.stringify(logsData.data[0], null, 2));
        } else {
            console.log('No logs found');
        }

    } catch (error) {
        console.error('Test error:', error);
    }
}

testLogs();
