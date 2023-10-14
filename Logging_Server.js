const express = require('express');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Use Morgan to log HTTP requests
app.use(morgan('dev'));

// ...

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
