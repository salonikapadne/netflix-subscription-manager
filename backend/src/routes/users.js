const express = require('express');
const router = express.Router();
const db = require('../db');

// Login existing user - requires exact name and email match
router.post('/login', async (req,res)=>{
  const {name, email} = req.body;
  if(!email) return res.status(400).json({error:'Email is required'});
  if(!name) return res.status(400).json({error:'Name is required'});
  
  const [rows] = await db.query('SELECT * FROM users WHERE email=? AND name=?', [email, name]);
  
  if(rows.length === 0) {
    return res.status(401).json({error:'Invalid credentials. Name and email do not match any account.'});
  }
  
  res.json(rows[0]);
});

// Register new user - creates account with name and email
router.post('/register', async (req,res)=>{
  const {name, email} = req.body;
  if(!email) return res.status(400).json({error:'Email is required'});
  if(!name) return res.status(400).json({error:'Name is required'});
  
  // Check if email already exists
  const [existingRows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
  if(existingRows.length > 0) {
    return res.status(409).json({error:'An account with this email already exists. Please login instead.'});
  }
  
  // Create new user
  const [r] = await db.query('INSERT INTO users (name,email) VALUES (?,?)', [name, email]);
  const [u] = await db.query('SELECT * FROM users WHERE id=?', [r.insertId]);
  res.status(201).json(u[0]);
});

// list users
router.get('/', async (req,res)=>{
  const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(rows);
});

// get user
router.get('/:id', async (req,res)=>{
  const [rows] = await db.query('SELECT * FROM users WHERE id=?', [req.params.id]);
  if(!rows.length) return res.status(404).json({error:'not found'});
  res.json(rows[0]);
});

module.exports = router;
