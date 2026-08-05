import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import satelliteRoutes from './routes/satelliteRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const allowedOrigins = [
  'http://localhost:5183',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

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

// Mock Socket.io connection for dashboard live data simulation
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Emit mock air quality data every 5 seconds
  const interval = setInterval(() => {
    socket.emit('air-quality-update', {
      aqi: Math.floor(Math.random() * (150 - 20) + 20),
      co2: Math.floor(Math.random() * (800 - 400) + 400),
      pm25: Math.floor(Math.random() * (50 - 5) + 5),
      timestamp: new Date()
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 5009;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
