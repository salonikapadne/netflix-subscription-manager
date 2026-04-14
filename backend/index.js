require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const db = require('./src/db');
const api = require('./src/routes');
app.use('/api', api);

app.get('/', (req,res)=> res.send({ok:true, msg:'Netflix subscription API'}));
const path = require("path");

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});
app.listen(port, ()=> console.log('Server running on port', port));
