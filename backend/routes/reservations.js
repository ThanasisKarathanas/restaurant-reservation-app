const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { restaurant_id, date, time, people_count } = req.body;

  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO reservations (user_id, restaurant_id, date, time, people_count) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, restaurant_id, date, time, people_count]
    );
    conn.release();
    res.status(201).json({ message: 'Reservation created' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reservation', error: err });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM reservations WHERE user_id = ? ORDER BY date DESC',
      [req.user.userId]
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reservations', error: err });
  }
});

module.exports = router;
