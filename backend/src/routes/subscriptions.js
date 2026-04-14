const express = require('express');
const router = express.Router();
const db = require('../db');

// create subscription
router.post('/', async (req,res)=>{
  const {user_id, plan_id, status='active', months=1} = req.body;
  if(!user_id || !plan_id) return res.status(400).json({error:'user_id and plan_id required'});
  
  // Validate user exists
  const userResult = await db.query('SELECT id FROM users WHERE id=$1', [user_id]);
  if(!userResult.rows.length) return res.status(404).json({error:'User not found'});
  
  // Validate plan exists
  const planResult = await db.query('SELECT id FROM plans WHERE id=$1', [plan_id]);
  if(!planResult.rows.length) return res.status(404).json({error:'Plan not found'});
  
  // Check for existing active subscription for this plan
  const existingSubResult = await db.query(
    'SELECT id FROM subscriptions WHERE user_id=$1 AND plan_id=$2 AND status=$3',
    [user_id, plan_id, 'active']
  );
  
  if(existingSubResult.rows.length > 0) {
    return res.status(409).json({error:'You already have an active subscription for this plan. Please cancel it first if you want to change plans.'});
  }
  
  const started = new Date().toISOString().slice(0,10);
  const d = new Date();
  d.setMonth(d.getMonth()+months);
  const ends = d.toISOString().slice(0,10);
  
  const result = await db.query('INSERT INTO subscriptions (user_id,plan_id,status,started_at,ends_at) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [user_id, plan_id, status, started, ends]);
  res.status(201).json(result.rows[0]);
});

// list subscriptions with plan details
router.get('/', async (req,res)=>{
  try {
    const result = await db.query(`
      SELECT s.*, 
             u.name as user_name, u.email,
             p.name as plan_name, p.price_cents
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN plans p ON s.plan_id = p.id  
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({error: 'Database error'});
  }
});

// get by id
router.get('/:id', async (req,res)=>{
  const result = await db.query('SELECT * FROM subscriptions WHERE id=$1', [req.params.id]);
  if(!result.rows.length) return res.status(404).json({error:'not found'});
  res.json(result.rows[0]);
});

// cancel subscription
router.post('/:id/cancel', async (req,res)=>{
  await db.query('UPDATE subscriptions SET status=$1 WHERE id=$2', ['cancelled', req.params.id]);
  const result = await db.query('SELECT * FROM subscriptions WHERE id=$1', [req.params.id]);
  res.json(result.rows[0]);
});

module.exports = router;
