const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
    // If we are already connected, disconnect first
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    // Start memory server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Set the env var so other modules (like models/server) might see it if accessed later
    process.env.MONGO_URI = uri;
    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'test_jwt_secret';
    }

    // Connect mongoose
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

const close = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};

const clear = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};

module.exports = { connect, close, clear };
