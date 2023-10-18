const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: 'benizhang123',
  port: 5432,
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movies API',
      version: '1.0.0',
      description: 'API documentation for Movies',
    },
  },
  apis: ['Movies_API.js'], // Specify the file containing your API routes
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get a list of movies
 *     description: Get a list of movies with pagination
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of movies
 *         content:
 *           application/json:
 *             example:
 *               - { id: 1, title: 'Movie 1', genre: 'Action', year: 2022 }
 *               - { id: 2, title: 'Movie 2', genre: 'Adventure', year: 2023 }
 */

app.get('/movies', async (req, res) => {
  const { page, limit } = req.query;

  // Default values if not provided
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const offset = (pageNumber - 1) * itemsPerPage;

  try {
    const result = await pool.query('SELECT * FROM movies OFFSET $1 LIMIT $2', [offset, itemsPerPage]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });  