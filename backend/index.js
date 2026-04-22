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
app.use('/api', api);

// health check route
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Netflix subscription API' });
});

// serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// catch-all (VERY IMPORTANT for React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
  console.log('Server running on port', port);
});