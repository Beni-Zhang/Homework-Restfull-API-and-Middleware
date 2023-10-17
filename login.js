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
  try {
    const result = await pool.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id', [email, password, role]);
    const userId = result.rows[0].id;
    const token = jwt.sign({ userId, role }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

function authenticateToken(req, res, next) {
  const token = req.headers['token'];
  if (token == null) {
    console.log('No token provided');
    return res.sendStatus(401);
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log('Token verified:', user);
    req.user = user;
    next();
  });
}

app.get('/movies', authenticateToken, (req, res) => {
  if (req.role === 'Supervisor') {
    res.json({ message: 'Welcome to the Movies page, Supervisor!' });
  } else {
    res.status(403).json({ error: 'Forbidden. Only supervisors can access this page.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});