const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all plans
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM plans ORDER BY price_cents');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get plan by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM plans WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create plan
router.post('/', async (req, res) => {
  try {
    const { name, price_cents, interval = 'monthly', description = '' } = req.body;
    const result = await db.query(
      'INSERT INTO plans (name, price_cents, interval, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price_cents, interval, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update plan
router.put('/:id', async (req, res) => {
  try {
    const { name, price_cents, interval, description } = req.body;
    const result = await db.query(
      'UPDATE plans SET name = $1, price_cents = $2, interval = $3, description = $4 WHERE id = $5 RETURNING *',
      [name, price_cents, interval, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete plan
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM plans WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
