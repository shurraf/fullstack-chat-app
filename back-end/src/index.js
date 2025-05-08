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

const port = process.env.PORT;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use('/api/auth', router);
app.use('/api/messages', messageRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../front-end/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end', 'dist', 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
  connectDb();
});
