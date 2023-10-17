const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(morgan('tiny'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});