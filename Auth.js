const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: 'your_db_username',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

app.use(bodyParser.json());

// GET endpoint to fetch movies
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint to add a new movie
app.post('/movies', async (req, res) => {
  try {
    const { title, year, director } = req.body;
    const result = await pool.query('INSERT INTO movies (title, year, director) VALUES ($1, $2, $3) RETURNING *', [title, year, director]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE endpoint to remove a movie by ID
app.delete('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT endpoint to update a movie by ID
app.put('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, year, director } = req.body;
    const result = await pool.query('UPDATE movies SET title = $1, year = $2, director = $3 WHERE id = $4 RETURNING *', [title, year, director, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hashedPassword]);
    const user = result.rows[0];

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id, email: user.email }, 'your_secret_key', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example of protected route using token verification middleware
app.get('/protected', verifyToken, (req, res) => {
  // You can access the user's information from req.user
  res.json({ message: 'This is a protected route', user: req.user });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(403).json({ error: 'Token is missing' });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
