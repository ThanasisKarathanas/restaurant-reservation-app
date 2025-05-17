const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
const restaurantRoutes = require('./routes/restaurants');
const reservationRoutes = require('./routes/reservations');

app.use('/api', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);

// Test Route for Database
app.get('/api/test-db', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query('SELECT 1 + 1 AS result');
    conn.release();
    res.json({ db_connection: 'successful', result });
  } catch (err) {
    res.status(500).json({ db_connection: 'failed', error: err.message });
  }
});

// Test Route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});


