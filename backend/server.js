import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import seedWorkouts from './config/seedWorkouts.js';
import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import communityRoutes from './routes/communityRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '8mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/community', communityRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) {
    const field = err.keyPattern?.username ? 'Username' : 'Email';
    return res.status(409).json({ message: `${field} is already in use.` });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({ message: process.env.NODE_ENV === 'production' && status === 500 ? 'Something went wrong. Please try again.' : err.message || 'Something went wrong. Please try again.' });
});

const port = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedWorkouts();
  const server = app.listen(port, () => console.log(`blanc API listening on ${port}`));
  server.on('error', async (error) => {
    if (error.code !== 'EADDRINUSE') {
      console.error('API listener failed:', error.message);
      process.exitCode = 1;
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1500) });
      const health = await response.json();
      if (response.ok && health.status === 'ok') {
        console.log(`blanc API is already running on port ${port}; the existing server is ready to use.`);
        await mongoose.disconnect();
        return;
      }
    } catch { /* The port belongs to another process or the health check did not respond. */ }

    console.error(`Port ${port} is already in use by another process. Stop it or set a different PORT in backend/.env.`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

start().catch((error) => { console.error('API startup failed:', error.message); process.exit(1); });
