// routes/skills.js — CRUD for skills, plus browse/search
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/skills?type=offer&search=guitar&category=Music
// Browse all skills (with owner info), excludes current user's own if ?excludeMine=1
router.get('/', (req, res) => {
  const { type, search, category } = req.query;
  let sql = `
    SELECT skills.*, users.name AS owner_name, users.location AS owner_location
    FROM skills JOIN users ON users.id = skills.user_id
    WHERE 1=1
  `;
  const params = [];

  if (type === 'offer' || type === 'want') {
    sql += ' AND skills.type = ?';
    params.push(type);
  }
  if (category) {
    sql += ' AND skills.category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (skills.skill_name LIKE ? OR skills.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY skills.created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /api/skills/mine — current user's own skills
router.get('/mine', authRequired, (req, res) => {
  const rows = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows);
});

// POST /api/skills — add a new skill (offer or want)
router.post('/', authRequired, (req, res) => {
  const { skill_name, category, type, description, level } = req.body;
  if (!skill_name || !type) return res.status(400).json({ error: 'skill_name and type are required' });
  if (!['offer', 'want'].includes(type)) return res.status(400).json({ error: "type must be 'offer' or 'want'" });

  const info = db.prepare(
    'INSERT INTO skills (user_id, skill_name, category, type, description, level) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, skill_name, category || 'General', type, description || '', level || 'Beginner');

  const row = db.prepare('SELECT * FROM skills WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// PUT /api/skills/:id — update own skill
router.put('/:id', authRequired, (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  if (skill.user_id !== req.user.id) return res.status(403).json({ error: 'Not your skill' });

  const { skill_name, category, type, description, level } = req.body;
  db.prepare(
    'UPDATE skills SET skill_name=?, category=?, type=?, description=?, level=? WHERE id=?'
  ).run(
    skill_name ?? skill.skill_name,
    category ?? skill.category,
    type ?? skill.type,
    description ?? skill.description,
    level ?? skill.level,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id));
});

// DELETE /api/skills/:id — delete own skill
router.delete('/:id', authRequired, (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  if (skill.user_id !== req.user.id) return res.status(403).json({ error: 'Not your skill' });

  db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
