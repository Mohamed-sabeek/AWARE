import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { startSensorMonitor } from './services/sensorMonitor.js';
import authRoutes from './routes/authRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import satelliteRoutes from './routes/satelliteRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
connectDB();

// Start background services
startSensorMonitor();

const app = express();
const server = http.createServer(app);
if (!process.env.FRONTEND_URL) {
  console.warn('WARNING: FRONTEND_URL environment variable is not set.');
}

const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : undefined;

const allowedOrigins = [
  'http://localhost:5183',
  'http://localhost:5173',
  frontendUrl
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked Origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);

app.get('/', (req, res) => {
  res.send('AWARE API is running...');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected',
    time: new Date().toISOString()
  });
});

// Socket.io connection for dashboard live data
io.on('connection', (socket) => {
  console.log('Socket.io Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket.io Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5009;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
