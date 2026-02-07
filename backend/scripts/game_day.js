const mongoose = require('mongoose');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const logger = require('../utils/logger'); // Assuming logger exists based on server.js

// Mock an incident
const SIMULATION_TYPE = process.argv[2] || 'db_connection_loss';

console.log('🚨 STARTING GAME DAY SIMULATION: ' + SIMULATION_TYPE);
console.log('================================================');

const delay = ms => new Promise(res => setTimeout(res, ms));

const simulateDBLoss = async () => {
    console.log('[10:00:00] Incident Triggered: Database connectivity lost.');

    // Simulate by attempting connection to bad URI
    const BAD_URI = "mongodb://invalid-host:27017/estore";

    console.log('[10:00:05] ALERT: Application logs showing connection errors.');
    try {
        await mongoose.connect(BAD_URI, { connectTimeoutMS: 2000, serverSelectionTimeoutMS: 2000 });
    } catch (err) {
        console.log(`[10:00:07] LOGS: ${err.message}`);
    }

    console.log('\n--- 📖 RUNBOOK ACTION REQUIRED (See RUNBOOK.md Section 1) ---');
    console.log('1. Check MongoDB Status');
    console.log('2. Verify Network/Credentials');
    console.log('------------------------------------------------------------\n');

    await delay(2000);

    console.log('[10:05:00] Operator Action: Investigating configuration...');
    console.log('[10:07:00] Operator Action: Restoring correct MONGO_URI...');

    // Restore connection
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not set in .env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`[10:08:00] RECOVERY: MongoDB Connected: ${mongoose.connection.host}`);
        console.log('✅ INCIDENT RESOLVED');
    } catch (err) {
        console.error('❌ RECOVERY FAILED:', err.message);
        process.exit(1);
    }
};

const runSimulation = async () => {
    switch (SIMULATION_TYPE) {
        case 'db_connection_loss':
            await simulateDBLoss();
            break;
        default:
            console.log('Unknown simulation type');
    }
    process.exit(0);
};

runSimulation();
