const fs = require('fs');
const path = require('path');

const MONITOR_URL = 'http://localhost:5000/health';
const LOG_FILE = path.join(__dirname, 'uptime_monitor.log');
const INTERVAL = 5000; // Check every 5 seconds

console.log(`Starting monitoring simulation for ${MONITOR_URL}...`);
console.log(`Logs will be written to ${LOG_FILE}`);

const logStatus = (status, message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${status.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(logEntry.trim());
};

const checkHealth = async () => {
    try {
        const start = Date.now();
        const response = await fetch(MONITOR_URL);
        const latency = Date.now() - start;

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
                logStatus('up', `Service operational. Latency: ${latency}ms`);
            } else {
                logStatus('down', `Service unhealthy. Status: ${response.status}. Data: ${JSON.stringify(data)}`);
                console.error("🚨 ALERT: Service ISSUE! Sending email notification...");
            }
        } else {
            logStatus('down', `Service returned ${response.status}.`);
            console.error("🚨 ALERT: Service DOWN! Sending SMS notification...");
        }
    } catch (error) {
        logStatus('down', `Service unreachable. Error: ${error.message}`);
        console.error("🚨 ALERT: Service UNREACHABLE! Sending SMS notification...");
    }
};

// Initial check
checkHealth();

// Periodic checks
setInterval(checkHealth, INTERVAL);
