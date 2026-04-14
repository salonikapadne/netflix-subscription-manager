const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto').randomBytes(32).toString('hex');
const { sendPasswordResetEmail, sendPasswordChangeConfirmation } = require('../emailService');

// Login existing user - requires exact name, email and password match
router.post('/login', async (req,res)=>{
  const {name, email, password} = req.body;
  if(!email) return res.status(400).json({error:'Email is required'});
  if(!name) return res.status(400).json({error:'Name is required'});
  if(!password) return res.status(400).json({error:'Password is required'});
  
  const result = await db.query('SELECT * FROM users WHERE email=$1 AND name=$2', [email, name]);
  
  if(result.rows.length === 0) {
    return res.status(401).json({error:'Invalid credentials. Name and email do not match any account.'});
  }
  
  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  
  if(!passwordMatch) {
    return res.status(401).json({error:'Invalid credentials. Password is incorrect.'});
  }
  
  // Return user without password_hash
  const { password_hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Register new user - creates account with name, email and password
router.post('/register', async (req,res)=>{
  const {name, email, password} = req.body;
  if(!email) return res.status(400).json({error:'Email is required'});
  if(!name) return res.status(400).json({error:'Name is required'});
  if(!password) return res.status(400).json({error:'Password is required'});
  
  if(password.length < 6) {
    return res.status(400).json({error:'Password must be at least 6 characters long'});
  }
  
  // Check if email already exists
  const existingResult = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  console.log('Existing user check result:', JSON.stringify(existingResult.rows));
  if(existingResult.rows.length > 0) {
    return res.status(409).json({error:'An account with this email already exists. Please login instead.'});
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create new user
  const insertResult = await db.query('INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,created_at', [name, email, passwordHash]);
  console.log('New user created:', JSON.stringify(insertResult.rows[0]));
  res.status(201).json(insertResult.rows[0]);
});

// list users
router.get('/', async (req,res)=>{
  const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(result.rows);
});

// get user
router.get('/:id', async (req,res)=>{
  const result = await db.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
  if(!result.rows.length) return res.status(404).json({error:'not found'});
  res.json(result.rows[0]);
});

// Forgot password - send reset email
router.post('/forgot-password', async (req,res)=>{
  const {email} = req.body;
  if(!email) return res.status(400).json({error:'Email is required'});
  
  try {
    // Check if user exists
    const userResult = await db.query('SELECT id, name, email FROM users WHERE email=$1', [email]);
    
    if(userResult.rows.length === 0) {
      // For security, don't reveal if email exists
      return res.status(200).json({message:'If an account exists with this email, a password reset link will be sent shortly.'});
    }
    
    const user = userResult.rows[0];
    
    // Generate reset token (valid for 1 hour)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token in database
    await db.query(
      'UPDATE users SET password_reset_token=$1, password_reset_expires=$2 WHERE id=$3',
      [resetToken, resetExpires, user.id]
    );
    
    // Send email with reset link
    await sendPasswordResetEmail(user.email, user.name, resetToken);
    
    res.status(200).json({message:'If an account exists with this email, a password reset link will be sent shortly.'});
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({error:'An error occurred. Please try again later.'});
  }
});

// Reset password - validate token and update password
router.post('/reset-password', async (req,res)=>{
  const {token, newPassword} = req.body;
  
  if(!token) return res.status(400).json({error:'Reset token is required'});
  if(!newPassword) return res.status(400).json({error:'New password is required'});
  
  if(newPassword.length < 6) {
    return res.status(400).json({error:'Password must be at least 6 characters long'});
  }
  
  try {
    // Find user with valid reset token
    const userResult = await db.query(
      'SELECT id, name, email FROM users WHERE password_reset_token=$1 AND password_reset_expires > NOW()',
      [token]
    );
    
    if(userResult.rows.length === 0) {
      return res.status(400).json({error:'Password reset token is invalid or has expired. Please request a new one.'});
    }
    
    const user = userResult.rows[0];
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password_hash=$1, password_reset_token=NULL, password_reset_expires=NULL WHERE id=$2',
      [passwordHash, user.id]
    );
    
    // Send confirmation email
    await sendPasswordChangeConfirmation(user.email, user.name);
    
    res.status(200).json({message:'Password has been reset successfully. You can now login with your new password.'});
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({error:'An error occurred. Please try again later.'});
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req,res)=>{
  const {token} = req.body;
  
  if(!token) return res.status(400).json({error:'Reset token is required'});
  
  try {
    const userResult = await db.query(
      'SELECT id, email FROM users WHERE password_reset_token=$1 AND password_reset_expires > NOW()',
      [token]
    );
    
    if(userResult.rows.length === 0) {
      return res.status(400).json({error:'Invalid or expired token'});
    }
    
    res.status(200).json({message:'Token is valid', email: userResult.rows[0].email});
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({error:'An error occurred. Please try again later.'});
  }
});

module.exports = router;
