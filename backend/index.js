require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// DB + routes
const db = require('./src/db');
const api = require('./src/routes');

// API routes FIRST
app.use('/api', api);

// health check (DO NOT use "/")
app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'Netflix subscription API' });
});

// serve React build (IMPORTANT)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// React fallback route (MUST be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
  console.log('Server running on port', port);
});