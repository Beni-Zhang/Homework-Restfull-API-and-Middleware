const express = require('express');
const app = express();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movies',
    password: 'benizhang123',
    port: 5432,
  });
  
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

// Swagger definition options
const swaggerDefinition = {
  info: {
    title: 'User API',
    version: '1.0.0',
    description: 'API for user registration and login',
  },
  basePath: '/',
};

// Options for the swagger-jsdoc package
const options = {
  swaggerDefinition,
  apis: ['./Users_API.js'], // Replace with the path to your route definitions
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger documentation using swagger-ui-express
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with email, password, id, and role.
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             id:
 *               type: string
 *             role:
 *               type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Error registering user
 */

app.post('/register', (req, res) => {
    const { email, password, id, role } = req.body;
  
    const query = 'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)';
    const values = [id, email, password, role];
  
    pool.query(query, values, (err, result) => {
      if (err) {
        res.status(500).send('Error registering user');
      } else {
        res.status(201).send('User registered successfully');
      }
    });
  });

  /**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     description: Logs in a user with email and password.
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Error logging in
 */
  
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
          console.log('User role:', role);
          res.status(200).send('User logged in successfully');
        } else {
          res.status(401).send('Invalid credentials');
        }
      }
    });
  });

// Start your Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});