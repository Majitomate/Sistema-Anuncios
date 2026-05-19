import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
  enviarHeartbeat,
  obtenerEstado,
  obtenerEstadoUnico,
  detectarDesconexionesManual,
  obtenerHistorial,
  obtenerEstadisticasConexion,
} from '../controllers/dispositivos.controller.js';

const router = express.Router();

// ==========================================
// RUTAS PÚBLICAS (No requieren token)
// ==========================================

// Registrar heartbeat del dispositivo
router.post('/heartbeat', enviarHeartbeat);

// Obtener estado de un dispositivo específico
router.get('/:identificador/estado', obtenerEstadoUnico);

// ==========================================
// RUTAS PROTEGIDAS (Requieren token)
// ==========================================

router.use(verifyToken);

// Obtener estado de todos los dispositivos (Admin)
router.get('/estado', obtenerEstado);

// Detectar desconexiones
router.post('/detectar-desconexiones', detectarDesconexionesManual);

// Obtener historial de un dispositivo
router.get('/:dispositivoId/historial', obtenerHistorial);

// Obtener estadísticas de conectividad
router.get('/estadisticas', obtenerEstadisticasConexion);

export default router;
