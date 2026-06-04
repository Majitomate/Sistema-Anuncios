import cron from 'node-cron';
import pool from '../config/db.js';
import { detectarDesconexiones } from '../models/dispositivos.model.js';

const sincronizarEstados = async () => {
  try {
    const desactivados = await pool.query(`
      UPDATE anuncios
      SET estado = FALSE,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE estado = TRUE
        AND es_permanente = FALSE
        AND fecha_fin < NOW()
      RETURNING id, titulo
    `);

    const nDesactivados = desactivados.rowCount;

    if (nDesactivados > 0) {
      console.log(`[Cron] Sincronización completada — Desactivados por expiración: ${nDesactivados}`);
      desactivados.rows.forEach(a => console.log(`  ⏹  Desactivado por tiempo finalizado: [${a.id}] ${a.titulo}`));
    }
  } catch (error) {
    console.error('[Cron] Error al sincronizar estados:', error.message);
  }
};

/**
 * Detecta desconexiones de dispositivos cada X minutos
 * Se considera desconectado si no envía heartbeat en 10 minutos
 */
const detectarDesconexionesAutomatico = async () => {
  try {
    const desconectados = await detectarDesconexiones(10); // 10 minutos de timeout
    
    if (desconectados.length > 0) {
      console.log(`[Cron] Desconexiones detectadas: ${desconectados.length}`);
      desconectados.forEach(d => console.log(`  ⚠️  Dispositivo desconectado: ${d.identificador}`));
    }
  } catch (error) {
    console.error('[Cron] Error detectando desconexiones:', error.message);
  }
};

export const iniciarCronEstados = () => {
  // Desactivar anuncios expirados - Se ejecuta cada minuto
  cron.schedule('* * * * *', sincronizarEstados);
  console.log('[Cron] Servicio de desactivación por expiración iniciado.');
  
  // Detectar desconexiones de dispositivos - Se ejecuta cada 5 minutos
  cron.schedule('*/5 * * * *', detectarDesconexionesAutomatico);
  console.log('[Cron] Servicio de detección de desconexiones iniciado.');
};