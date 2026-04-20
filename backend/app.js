const express = require('express');
const cors = require('cors');
const { iniciarCronEstados } = require('./jobs/sincronizarEstados')

const app = express();

app.use(cors());
app.use(express.json());

iniciarCronEstados();

const anunciosRoutes = require('./routes/anuncios.routes');

app.use('/anuncios', anunciosRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando');
});
module.exports = app;