const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const authenticateToken = require('../middleware/auth')
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const conn = await pool.getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    conn.release();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query('SELECT name, email FROM users WHERE user_id = ?', [userId]);
    conn.release();

    if (result.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;