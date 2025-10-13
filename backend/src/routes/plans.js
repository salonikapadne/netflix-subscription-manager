const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all plans
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plans ORDER BY price_cents');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get plan by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create plan
router.post('/', async (req, res) => {
  try {
    const { name, price_cents, interval = 'monthly', description = '' } = req.body;
    const [result] = await db.query(
      'INSERT INTO plans (name, price_cents, `interval`, description) VALUES (?, ?, ?, ?)',
      [name, price_cents, interval, description]
    );
    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update plan
router.put('/:id', async (req, res) => {
  try {
    const { name, price_cents, interval, description } = req.body;
    await db.query(
      'UPDATE plans SET name = ?, price_cents = ?, `interval` = ?, description = ? WHERE id = ?',
      [name, price_cents, interval, description, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete plan
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM plans WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
