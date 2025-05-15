const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const conn = await pool.getConnection();

    // Check if email already exists
    const existing = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password and insert new user
    const hashed = await bcrypt.hash(password, 10);
    await conn.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    conn.release();

   res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('❌ Backend registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const conn = await pool.getConnection();
    const users = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (!users.length || !(await bcrypt.compare(password, users[0].password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: users[0].user_id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
});

module.exports = router;
