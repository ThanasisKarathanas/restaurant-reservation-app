const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const search = req.query.search || '';
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'SELECT * FROM restaurants WHERE name LIKE ? OR location LIKE ?',
      [`%${search}%`, `%${search}%`]
    );
    conn.release();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch restaurants', error: err });
  }
});

module.exports = router;
