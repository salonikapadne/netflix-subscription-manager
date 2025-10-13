const express = require('express');
const router = express.Router();
const db = require('../db');

// create subscription
router.post('/', async (req,res)=>{
  const {user_id, plan_id, status='active', months=1} = req.body;
  if(!user_id || !plan_id) return res.status(400).json({error:'user_id and plan_id required'});
  
  // Validate user exists
  const [userRows] = await db.query('SELECT id FROM users WHERE id=?', [user_id]);
  if(!userRows.length) return res.status(404).json({error:'User not found'});
  
  // Validate plan exists
  const [planRows] = await db.query('SELECT id FROM plans WHERE id=?', [plan_id]);
  if(!planRows.length) return res.status(404).json({error:'Plan not found'});
  
  const started = new Date().toISOString().slice(0,10);
  const d = new Date();
  d.setMonth(d.getMonth()+months);
  const ends = d.toISOString().slice(0,10);
  const [r] = await db.query('INSERT INTO subscriptions (user_id,plan_id,status,started_at,ends_at) VALUES (?,?,?,?,?)',
    [user_id, plan_id, status, started, ends]);
  const [rows] = await db.query('SELECT * FROM subscriptions WHERE id=?', [r.insertId]);
  res.status(201).json(rows[0]);
});

// list subscriptions with plan details
router.get('/', async (req,res)=>{
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
             u.name as user_name, u.email,
             p.name as plan_name, p.price_cents
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN plans p ON s.plan_id = p.id  
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({error: 'Database error'});
  }
});

// get by id
router.get('/:id', async (req,res)=>{
  const [rows] = await db.query('SELECT * FROM subscriptions WHERE id=?', [req.params.id]);
  if(!rows.length) return res.status(404).json({error:'not found'});
  res.json(rows[0]);
});

// cancel subscription
router.post('/:id/cancel', async (req,res)=>{
  await db.query('UPDATE subscriptions SET status=? WHERE id=?', ['cancelled', req.params.id]);
  const [rows]= await db.query('SELECT * FROM subscriptions WHERE id=?', [req.params.id]);
  res.json(rows[0]);
});

module.exports = router;
