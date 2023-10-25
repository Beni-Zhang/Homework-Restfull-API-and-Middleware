const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.json());

// PostgreSQL database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movies',
    password: 'benizhang123',
    port: 5432,
});

// Swagger definition options
const swaggerDefinition = {
  info: {
    title: 'Movie API',
    version: '1.0.0',
    description: 'API for managing movies',
  },
  basePath: '/',
};

// Options for the swagger-jsdoc package
const options = {
  swaggerDefinition,
  apis: ['./Movies_API.js'], // Replace with the path to your route definitions
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger documentation using swagger-ui-express
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// GET endpoint to fetch movies
/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get a list of movies
 *     description: Returns a list of all movies.
 *     responses:
 *       200:
 *         description: A list of movies.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       500:
 *         description: Internal server error.
 */
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint to add a new movie
/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Add a new movie
 *     description: Add a new movie to the database.
 *     parameters:
 *       - name: movie
 *         in: body
 *         description: The movie to add.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Movie'
 *     responses:
 *       201:
 *         description: The added movie.
 *       500:
 *         description: Internal server error.
 */
app.post('/movies', async (req, res) => {
  try {
    const { id, title, genres, year } = req.body;
    const result = await pool.query('INSERT INTO movies (id, title, genres, year) VALUES ($1, $2, $3, $4) RETURNING *', [id, title, genres, year]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// DELETE endpoint to remove a movie by ID
/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie by ID
 *     description: Delete a movie from the database by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the movie to delete.
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: The deleted movie.
 *       404:
 *         description: Movie not found.
 *       500:
 *         description: Internal server error.
 */
app.delete('/movies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT endpoint to update a movie by ID
/**
 * @swagger
 * /movies:
 *   put:
 *     summary: Update a movie by ID
 *     description: Update a movie in the database by its ID.
 *     parameters:
 *       - name: movie
 *         in: body
 *         description: The movie to update.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Movie'
 *     responses:
 *       200:
 *         description: The updated movie.
 *       500:
 *         description: Internal server error.
 */
app.put('/movies', async (req, res) => {
  try {
    const { id, title, genres, year } = req.body;
    const result = await pool.query('UPDATE movies SET title = $2, genres = $3, year = $4 WHERE id = $1 RETURNING *', [id, title, genres, year]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Define Swagger definitions for your movie object
/**
 * @swagger
 * definitions:
 *   Movie:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       title:
 *         type: string
 *       genres:
 *         type: array
 *         items:
 *           type: string
 *       year:
 *         type: integer
 */

// Start your Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
