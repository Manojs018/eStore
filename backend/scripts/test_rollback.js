const mongoose = require('mongoose');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');

const runCommand = (command) => {
    try {
        execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (error) {
        console.error(`Command failed: ${command}`);
        process.exit(1);
    }
};

const runTest = async () => {
    console.log('🚀 Starting Rollback Test...');

    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Reset state
    console.log('1️⃣ Resetting database state...');
    await Product.deleteMany({});
    await Product.create({ name: 'Test Product', price: 10, description: 'Test', category: 'electronics', stock: 10, imageUrl: 'test.jpg' });

    // 2. Verify initial state (no migration field)
    const initialProduct = await Product.findOne({ name: 'Test Product' });
    if (initialProduct.toObject().migrationTest) {
        console.error('❌ Error: migrationTest field already exists before migration!');
        process.exit(1);
    }
    console.log('✅ Initial state verified.');

    // 3. Run Migration
    console.log('2️⃣ Running Migration (adding field)...');
    runCommand('npm run db:migrate');

    // 4. Verify Migration
    const migratedProduct = await Product.findOne({ name: 'Test Product' });
    // We need to use lean() or inspect _doc because schema might not have the field defined
    // Actually, Mongoose requires schema definition to see fields unless we use strict: false or access raw document.
    // Using collection driver directly via mongoose.connection based on previous failures
    const rawProductMigrated = await mongoose.connection.collection('products').findOne({ name: 'Test Product' });

    if (!rawProductMigrated.migrationTest) {
        console.error('❌ Error: Migration failed. Field not added.');
        process.exit(1);
    }
    console.log('✅ Migration applied successfully.');

    // 5. Run Rollback
    console.log('3️⃣ Running Rollback...');
    runCommand('npm run db:rollback');

    // 6. Verify Rollback
    const rolledBackProduct = await mongoose.connection.collection('products').findOne({ name: 'Test Product' });
    if (rolledBackProduct.migrationTest) {
        console.error('❌ Error: Rollback failed. Field still exists.');
        process.exit(1);
    }
    console.log('✅ Rollback verified successfully.');

    console.log('🎉 ALL TESTS PASSED: Rollback procedure is working correctly.');
    process.exit(0);
};

runTest().catch(err => {
    console.error(err);
    process.exit(1);
});
