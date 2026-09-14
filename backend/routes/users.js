// routes/users.js — public profile view
const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/users/:id — public profile with their skills
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, name, email, bio, location, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const skills = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...user, skills });
});

module.exports = router;
