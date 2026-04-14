const express = require('express');
const router = express.Router();
const db = require('../db');

// Process payment (simplified version without separate payments table)
router.post('/', async (req,res)=>{
  try {
    const {user_id, plan_id, payment_method = 'credit_card', amount_cents} = req.body;
    if(!user_id || !plan_id) return res.status(400).json({error:'user_id and plan_id required'});
    
    // Validate user exists
    const userResult = await db.query('SELECT id, name FROM users WHERE id=$1', [user_id]);
    if(!userResult.rows.length) return res.status(404).json({error:'User not found'});
    
    // Get plan details
    const planResult = await db.query('SELECT * FROM plans WHERE id=$1', [plan_id]);
    if(!planResult.rows.length) return res.status(404).json({error:'Plan not found'});
    
    const plan = planResult.rows[0];
    const user = userResult.rows[0];
    
    // Simulate payment processing
    const started = new Date().toISOString().slice(0,10);
    const d = new Date(); d.setMonth(d.getMonth()+1);
    const ends = d.toISOString().slice(0,10);
    
    // Create subscription
    const result = await db.query('INSERT INTO subscriptions (user_id,plan_id,status,started_at,ends_at) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [user_id, plan_id, 'active', started, ends]);
    
    const subscriptionId = result.rows[0].id;
    
    // Return payment confirmation (simulated)
    res.status(201).json({
      id: subscriptionId,
      user_id: user_id,
      plan_id: plan_id,
      amount_cents: plan.price_cents,
      payment_method: payment_method,
      status: 'completed',
      transaction_id: `txn_${Date.now()}`,
      created_at: new Date().toISOString(),
      subscription_id: subscriptionId
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({error: 'Payment processing failed', details: error.message});
  }
});

// Get payment history (simulated from subscriptions)
router.get('/', async (req,res)=>{
  try {
    const result = await db.query(`
      SELECT 
        s.id,
        s.user_id,
        u.name as user_name,
        s.plan_id,
        p.name as plan_name,
        p.price_cents as amount_cents,
        'credit_card' as payment_method,
        'completed' as status,
        'txn_' || s.id as transaction_id,
        s.created_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({error: 'Database error', details: error.message});
  }
});

// Legacy endpoint for backward compatibility
router.post('/charge', async (req,res)=>{
  const {user_id, plan_id, token} = req.body;
  if(!user_id || !plan_id) return res.status(400).json({error:'user_id and plan_id required'});
  
  // Validate user exists
  const userResult = await db.query('SELECT id FROM users WHERE id=$1', [user_id]);
  if(!userResult.rows.length) return res.status(404).json({error:'User not found'});
  
  // token is ignored in mock
  // get plan price
  const planResult = await db.query('SELECT * FROM plans WHERE id=$1', [plan_id]);
  if(!planResult.rows.length) return res.status(404).json({error:'plan not found'});
  
  const plan = planResult.rows[0];
  
  // simulate charge success
  const started = new Date().toISOString().slice(0,10);
  const d = new Date(); d.setMonth(d.getMonth()+1);
  const ends = d.toISOString().slice(0,10);
  const result = await db.query('INSERT INTO subscriptions (user_id,plan_id,status,started_at,ends_at) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [user_id, plan_id, 'active', started, ends]);
  
  res.json({ok:true, charge:{amount_cents: plan.price_cents, currency:'INR'}, subscription_id: result.rows[0].id});
});

module.exports = router;
