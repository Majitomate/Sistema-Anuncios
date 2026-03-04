const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando :)');
});

const testRoutes = require('./routes/test.routes');
app.use(testRoutes);

module.exports = app;