require('dotenv').config();

const config = {
    mongodb: {
        url: process.env.MONGO_URI || "mongodb://localhost:27017",
        databaseName: process.env.DB_NAME || "estore",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".js",
    useFileHash: false,
    moduleSystem: 'commonjs',
};

module.exports = config;
