module.exports = {
    async up(db, client) {
        // Add a test field to all products
        await db.collection('products').updateMany(
            {},
            { $set: { migrationTest: true } }
        );
    },

    async down(db, client) {
        // Remove the test field
        await db.collection('products').updateMany(
            {},
            { $unset: { migrationTest: "" } }
        );
    }
};
