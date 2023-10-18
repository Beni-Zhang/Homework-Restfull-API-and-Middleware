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

// Register user endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  const query = 'INSERT INTO users (email, password) VALUES ($1, $2)';
  const values = [email, password];

  pool.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send('Error registering user');
    } else {
      const token = jwt.sign({ email }, jwtSecret);
      res.status(201).json({ token }); // Send the token as a response for successful registration
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
        const token = jwt.sign({ email }, jwtSecret);
        res.status(200).json({ token }); // Send the token as a response for successful login
      } else {
        res.status(401).send('Invalid credentials');
      }
    }
  });
});


app.get('/movies', authenticateJWT, (req, res) => {
  const user = req.user;

  console.log('User role:', user.role);

  if (user.role === 'Supervisor') {
    const query = 'SELECT * FROM movies';
    pool.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching movies:', err);
        res.status(500).send('Error fetching movies');
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