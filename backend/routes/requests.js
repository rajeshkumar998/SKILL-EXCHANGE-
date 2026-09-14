// routes/requests.js — skill exchange requests between users
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/requests — send a request to swap/learn a skill
router.post('/', authRequired, (req, res) => {
  const { skill_id, message } = req.body;
  if (!skill_id) return res.status(400).json({ error: 'skill_id is required' });

  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(skill_id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  if (skill.user_id === req.user.id) return res.status(400).json({ error: "You can't request your own skill" });

  const info = db.prepare(
    'INSERT INTO requests (from_user_id, to_user_id, skill_id, message) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, skill.user_id, skill_id, message || '');

  const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// GET /api/requests/received — requests sent to me
router.get('/received', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT requests.*, skills.skill_name, skills.type AS skill_type, users.name AS from_user_name
    FROM requests
    JOIN skills ON skills.id = requests.skill_id
    JOIN users ON users.id = requests.from_user_id
    WHERE requests.to_user_id = ?
    ORDER BY requests.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// GET /api/requests/sent — requests I sent
router.get('/sent', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT requests.*, skills.skill_name, skills.type AS skill_type, users.name AS to_user_name
    FROM requests
    JOIN skills ON skills.id = requests.skill_id
    JOIN users ON users.id = requests.to_user_id
    WHERE requests.from_user_id = ?
    ORDER BY requests.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// PUT /api/requests/:id — accept or reject (only recipient can act)
router.put('/:id', authRequired, (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "status must be 'accepted' or 'rejected'" });
  }
  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.to_user_id !== req.user.id) return res.status(403).json({ error: 'Not your request to manage' });

  db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id));
});

module.exports = router;
