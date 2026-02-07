const { execSync } = require('child_process');

console.log('🔄 Starting Database Rollback...');

try {
    // Check migration status first
    console.log('Checking current migration status...');
    execSync('npm run db:migrate:status', { stdio: 'inherit' });

    // Run the rollback
    console.log('Reverting last migration...');
    execSync('npm run db:migrate:undo', { stdio: 'inherit' });

    console.log('✅ Database Rollback Successful!');
} catch (error) {
    console.error('❌ Database Rollback Failed:', error.message);
    process.exit(1);
}
