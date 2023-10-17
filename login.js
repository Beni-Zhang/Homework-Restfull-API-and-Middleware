// app.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = 3000;
const secretKey = 'jndjanf2rj23j5njnk2k4nn5n7n9nj53nn2nn265jndjgns';  // Ganti dengan kunci rahasia yang kuat

app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: 'benizhang123',
  port: 5432,
});

app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
    const result = await pool.query(`INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id`, [email, password, role]);
    const userId = result.rows[0].id;
    if (err) {
      console.log(err)
      res.status(500).json(err);
    } else {
      res.status(200).json(result);
      }
    });

app.post('/login', async (req, res) => {
  const { email, password } = req.body;  
  pool.query(`SELECT * FROM public.users WHERE email = '${email}' AND password = '${password}'`,)
    if (err) {
      console.log(err)
      res.status(500).json(err);
    } else {
      res.status(200).json(result);
      }
  });

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get('/movies', authenticateToken, (req, res) => {
  if (req.user.role === 'supervisor') {
    res.json({ message: 'Welcome to the Movies page, Supervisor!' });
  } else {
    res.status(403).json({ error: 'Forbidden. Only supervisors can access this page.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});