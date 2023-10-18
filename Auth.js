const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: 'benizhang123',
  port: 5432,
});

const jwtSecret = 'beny';

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
    const { id, title, genres ,year } = req.body;
    const result = await pool.query('INSERT INTO movies (id, title, genres ,year) VALUES ($1, $2, $3, $4) RETURNING *', [id, title, genres, year]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE endpoint to remove a movie by ID
app.delete('/movies', async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT endpoint to update a movie by ID
app.put('/movies', async (req, res) => {
  try {
    const { title, genres, year, id } = req.body;
    const result = await pool.query('UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4 RETURNING *', [title, genres, year, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register user endpoint
app.post('/register', (req, res) => {
  const { email, password, id, role } = req.body;

  const query = 'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)';
  const values = [id, email, password, role];

  pool.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send('Error registering user');
    } else {
      const token = jwt.sign({ id, email, role }, jwtSecret);
      console.log('User role:', role); 
      res.status(201).json({ token });
    }
  });
});

// Login user endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
  const values = [email, password];

  pool.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send('Error logging in');
    } else {
      if (result.rows.length === 1) {
        const { role } = result.rows[0];
        const token = jwt.sign({ email, role }, jwtSecret);
        console.log('User role:', role); 
        res.status(200).json({ token }); 
      } else {
        res.status(401).send('Invalid credentials');
      }
    }
  });
});

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (token) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {

        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get('/users', authenticateJWT, (req, res) => {
  const user = req.user;

  console.log('User role:, User email:', user.role, user.email);

  if (user.role === 'Supervisor') {
    const query = 'SELECT * FROM users';
    pool.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
      } else {
        const movies = result.rows;
        res.json({ movies });
      }
    });
  } else {
    res.status(403).send('Access forbidden for non-supervisors');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});