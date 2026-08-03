import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// Connect to Database
// connectDB(); // Mock backend for landing page doesn't strictly need a DB if it's just a UI demo, but it's set up for the MERN requirement.

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('AWARE API is running...');
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
