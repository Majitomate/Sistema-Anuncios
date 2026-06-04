import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import compression from 'compression';
import { iniciarCronEstados } from './jobs/sincronizarEstados.js';
import anunciosRoutes from './routes/anuncios.routes.js';
import dispositivosRoutes from './routes/dispositivos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import { login } from './controllers/auth.controller.js';

const app = express();

// CREAMOS EL SERVIDOR HTTP Y EL SERVIDOR DE WEBSOCKETS
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier origen
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

// CORS PERSONALIZADO
const permitirConexionesCORS = (req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  const requestHeaders = req.headers['access-control-request-headers'] || 'Content-Type, Authorization';
  res.setHeader('Access-Control-Allow-Headers', requestHeaders);

  if (req.headers['access-control-request-private-network'] || (origin && origin !== '*')) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};

app.use(permitirConexionesCORS);

// MIDDLEWARES DE RENDIMIENTO
app.use(compression());
app.use(express.json());

// WEBSOCKETS
io.on('connection', (socket) => {
  console.log(`🟢 Nueva tablet/cliente conectado por WebSocket: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

// TAREAS AUTOMÁTICAS
iniciarCronEstados();

// RUTAS DEL SISTEMA
app.post('/login', login);
app.use('/anuncios', anunciosRoutes);
app.use('/dispositivos', dispositivosRoutes);
app.use('/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// INICIAR EL SERVIDOR
export { httpServer };
export default app;