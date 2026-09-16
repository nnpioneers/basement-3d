import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './infrastructure/database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW()');
    res.json({ status: 'ok', db: 'connected', time: dbRes.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
