require('newrelic');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const Sentry = require("@sentry/node");
// Profiling removed due to compatibility issues
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.expressIntegration(),
    // nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // profilesSampleRate: 1.0,
});

// Load environment variables
dotenv.config();

// Validate Environment
const validateEnv = require('./config/validateEnv');
validateEnv();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Create Express app
const app = express();

// Sentry Request Handler is automatically handled by expressIntegration if instrumented correctly.
// But setupExpressErrorHandler is needed for error reporting.

// Middleware
const { apiLimiter } = require('./middleware/rateLimiter');

// Security Middleware
app.use(helmet());
app.use(requestId);
app.use(requestLogger);

// Apply global rate limiter to all api routes
app.use('/api/', apiLimiter);
// CORS Configuration
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
].filter(Boolean); // Remove undefined/null values

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Sitemap Route (before other routes)
app.use('/', require('./routes/sitemap'));

// Webhook routes (Must be before express.json to handle raw body)
app.use('/api/webhooks', express.raw({ type: 'application/json' }), require('./routes/webhooks'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Health check endpoint
// Health check endpoints
app.use('/health', require('./routes/health'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.apiLimiter = apiLimiter; // for testing if needed

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/monitoring', require('./routes/monitoring'));
app.use('/api/admin/logs', require('./routes/logs'));
app.use('/api/analytics', require('./routes/analytics'));

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Global error handler
app.use(errorHandler);

const startMonitoring = require('./jobs/monitor');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  startMonitoring();

  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  // server object is not defined in this scope if startServer calls listen inside. 
  // We need to export server or handle it better. 
  // But for now replacing console.log
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Error: ${err.message}`);
  logger.error('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = app;