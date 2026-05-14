const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./db');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://winshan-web-extension.vercel.app/' 
  ]
}));

app.use(express.json());
app.use('/', routes);

const PORT = process.env.PORT || 3000;

async function start() {
  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected ✅');
      break;
    } catch (err) {
      console.log(`Waiting for database... (${retries} retries left)`);
      retries--;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
