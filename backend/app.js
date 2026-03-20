const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const anunciosRoutes = require('./routes/anuncios.routes');

app.use('/anuncios', anunciosRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando');
});
module.exports = app;