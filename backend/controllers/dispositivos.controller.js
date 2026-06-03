import {
  registrarHeartbeat,
  obtenerEstadoDispositivos,
  obtenerEstadoDispositivo,
  detectarDesconexiones,
  obtenerHistorialDispositivo,
  obtenerEstadisticas,
} from '../models/dispositivos.model.js';

/**
 * Registra un heartbeat del dispositivo kiosco
 * POST /heartbeat
 */
export const enviarHeartbeat = async (req, res) => {
  try {
    const { identificador, nombre, ubicacion } = req.body;

    if (!identificador) {
      return res.status(400).json({ 
        error: 'El identificador del dispositivo es requerido' 
      });
    }

    const dispositivo = await registrarHeartbeat(identificador, nombre, ubicacion);
    return res.status(200).json({
      mensaje: 'Heartbeat registrado exitosamente',
      dispositivo,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[Error heartbeat]:', error);
    return res.status(500).json({ 
      error: 'Error registrando heartbeat del dispositivo' 
    });
  }
};

/**
 * Obtiene el estado de todos los dispositivos
 * GET /dispositivos/estado
 */
export const obtenerEstado = async (req, res) => {
  try {
    const dispositivos = await obtenerEstadoDispositivos();
    return res.status(200).json(dispositivos);
  } catch (error) {
    console.error('[Error obtener estado]:', error);
    return res.status(500).json({ 
      error: 'Error obteniendo estado de dispositivos' 
    });
  }
};

/**
 * Obtiene el estado de un dispositivo específico
 * GET /dispositivos/:identificador/estado
 */
export const obtenerEstadoUnico = async (req, res) => {
  try {
    const { identificador } = req.params;
    const dispositivo = await obtenerEstadoDispositivo(identificador);
    
    if (!dispositivo) {
      return res.status(404).json({ 
        error: 'Dispositivo no encontrado' 
      });
    }

    return res.status(200).json(dispositivo);
  } catch (error) {
    console.error('[Error obtener estado único]:', error);
    return res.status(500).json({ 
      error: 'Error obteniendo estado del dispositivo' 
    });
  }
};

/**
 * Detecta desconexiones de dispositivos
 * POST /dispositivos/detectar-desconexiones
 */
export const detectarDesconexionesManual = async (req, res) => {
  try {
    const { minutosUmbrales = 10 } = req.body;
    const desconectados = await detectarDesconexiones(minutosUmbrales);
    
    return res.status(200).json({
      mensaje: `Se detectaron ${desconectados.length} dispositivos desconectados`,
      dispositivos: desconectados,
      umbral_minutos: minutosUmbrales
    });
  } catch (error) {
    console.error('[Error detectar desconexiones]:', error);
    return res.status(500).json({ 
      error: 'Error detectando desconexiones' 
    });
  }
};

/**
 * Obtiene el historial de un dispositivo
 * GET /dispositivos/:dispositivoId/historial
 */
export const obtenerHistorial = async (req, res) => {
  try {
    const { dispositivoId } = req.params;
    const { limite = 50 } = req.query;
    
    const historial = await obtenerHistorialDispositivo(parseInt(dispositivoId), parseInt(limite));
    return res.status(200).json(historial);
  } catch (error) {
    console.error('[Error obtener historial]:', error);
    return res.status(500).json({ 
      error: 'Error obteniendo historial del dispositivo' 
    });
  }
};

/**
 * Obtiene estadísticas de conectividad
 * GET /dispositivos/estadisticas
 */
export const obtenerEstadisticasConexion = async (req, res) => {
  try {
    const estadisticas = await obtenerEstadisticas();
    return res.status(200).json(estadisticas);
  } catch (error) {
    console.error('[Error obtener estadísticas]:', error);
    return res.status(500).json({ 
      error: 'Error obteniendo estadísticas' 
    });
  }
};
