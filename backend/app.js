const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const anunciosRoutes = require('./routes/anuncios.routes');

app.use('/anuncios', anunciosRoutes);

module.exports = app;