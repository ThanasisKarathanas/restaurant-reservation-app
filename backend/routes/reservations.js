const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// POST create new reservation
router.post('/', authenticateToken, async (req, res) => {
  const { restaurant_id, date, time, people_count } = req.body;
  const user_id = req.user.userId;

  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO reservations (user_id, restaurant_id, date, time, people_count) VALUES (?, ?, ?, ?, ?)',
      [user_id, restaurant_id, date, time, people_count]
    );
    conn.release();
    res.json({ message: 'Reservation created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reservations of logged-in user
router.get('/user', authenticateToken, async (req, res) => {
  const user_id = req.user.userId;
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT r.*, res.name AS restaurant_name FROM reservations r JOIN restaurants res ON r.restaurant_id = res.restaurant_id WHERE r.user_id = ?',
      [user_id]
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update reservation
router.put('/:id', authenticateToken, async (req, res) => {
  const { date, time, people_count } = req.body;
  const user_id = req.user.userId;
  const reservation_id = req.params.id;

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'UPDATE reservations SET date = ?, time = ?, people_count = ? WHERE reservation_id = ? AND user_id = ?',
      [date, time, people_count, reservation_id, user_id]
    );
    conn.release();
    if (result.affectedRows === 0) {
      return res.status(403).json({ message: 'Unauthorized or reservation not found' });
    }
    res.json({ message: 'Reservation updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE reservation
router.delete('/:id', authenticateToken, async (req, res) => {
  const user_id = req.user.userId;
  const reservation_id = req.params.id;

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [reservation_id, user_id]
    );
    conn.release();
    if (result.affectedRows === 0) {
      return res.status(403).json({ message: 'Unauthorized or reservation not found' });
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
