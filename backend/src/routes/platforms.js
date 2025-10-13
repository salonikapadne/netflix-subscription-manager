const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all platforms
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM platforms WHERE is_active = TRUE ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Get single platform
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM platforms WHERE id = ? AND is_active = TRUE', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Platform not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching platform:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Get plans for a specific platform
router.get('/:id/plans', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, pl.name as platform_name, pl.brand_color 
      FROM plans p 
      JOIN platforms pl ON p.platform_id = pl.id 
      WHERE p.platform_id = ? AND p.is_active = TRUE 
      ORDER BY p.price_cents
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching platform plans:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

module.exports = router;