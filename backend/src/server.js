import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import formsRouter from './routes/forms.routes.js';
import responsesRouter from './routes/responses.routes.js';
import authRouter from './routes/auth.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();

// Security & middleware
app.use(helmet());
// Increase body size limits to allow embedded images/base64 uploads from builder
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS configuration for production deployment
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:3000', // Alternative local port
  'https://formcraft-io.netlify.app', // Replace with your Netlify domain
  process.env.CORS_ORIGIN // Custom origin from environment
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Ensure preflight requests receive CORS headers
app.options('*', cors(corsOptions));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint for Render
app.get('/api/health', (_req, res) => {
  res.json({ 
    ok: true, 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint for Render
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Form Builder API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (_req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/forms', formsRouter);
app.use('/api/responses', responsesRouter);
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start().catch((error) => {
  console.error('💥 Server startup failed:', error);
  process.exit(1);
});

export default app;


