const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET all restaurants or search by name/location
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const conn = await pool.getConnection();
    let query = 'SELECT * FROM restaurants';
    let params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR location LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm];
    }

    const rows = await conn.query(query, params);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
