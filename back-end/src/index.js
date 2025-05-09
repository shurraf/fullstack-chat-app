import express from 'express';
import dotenv from 'dotenv';
import router from './routes/authRoute.js';
import { connectDb } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import messageRouter from './routes/messageRoute.js';
import { app, server } from './lib/socket.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const port = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Or your frontend domain if deploying separately
    credentials: true,
  })
);

// API Routes
app.use('/api/auth', router);
app.use('/api/messages', messageRouter);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../front-end/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Start server
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  connectDb();
});
