import express from 'express';
import { iniciarCronEstados } from './jobs/sincronizarEstados.js';
import anunciosRoutes from './routes/anuncios.routes.js';
import dispositivosRoutes from './routes/dispositivos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import { login } from './controllers/auth.controller.js';

const app = express();
// CONFIGURACIÓN DE SEGURIDAD (CORS PERSONALIZADO)
const permitirConexionesCORS = (req, res, next) => {
  const origin = req.headers.origin || '*';
  
  // Quién puede conectarse
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  
  // Qué métodos y encabezados están permitidos
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  const requestHeaders = req.headers['access-control-request-headers'] || 'Content-Type, Authorization';
  res.setHeader('Access-Control-Allow-Headers', requestHeaders);

  // Permiso especial para redes locales
  if (req.headers['access-control-request-private-network'] || (origin && origin !== '*')) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }

  // Respuesta rápida a las peticiones de seguridad previas
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  next();
};

app.use(permitirConexionesCORS);

// MIDDLEWARES GLOBALES
app.use(express.json());

// TAREAS AUTOMÁTICAS EN SEGUNDO PLANO
iniciarCronEstados();

// RUTAS DEL SISTEMA (ENDPOINTS)
app.post('/login', login);

// Rutas de Módulos
app.use('/anuncios', anunciosRoutes);
app.use('/dispositivos', dispositivosRoutes);
app.use('/usuarios', usuariosRoutes);

// Ruta Raíz de Diagnóstico (Prueba del servidor)
app.get('/', (req, res) => {
  res.send('API funcionando');
});

export default app;