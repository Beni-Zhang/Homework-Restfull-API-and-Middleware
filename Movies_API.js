const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

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
 *               - { title: 'Movie 1', year: 2022, director: 'Director 1' }
 *               - { title: 'Movie 2', year: 2023, director: 'Director 2' }
 */
app.get('/movies', async (req, res) => {
    // Implement pagination logic here
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });  