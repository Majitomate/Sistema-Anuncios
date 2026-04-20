import express from 'express';
import cors from 'cors';
import { iniciarCronEstados } from './jobs/sincronizarEstados.js';
import anunciosRoutes from './routes/anuncios.routes.js';
import { login } from './controllers/auth.controller.js';

const app = express();

app.use(cors());
app.use(express.json());

// Iniciar job de sincronización
iniciarCronEstados();

// Rutas
app.use('/anuncios', anunciosRoutes);

app.post('/login', login);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

export default app;