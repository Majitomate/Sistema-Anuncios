import cron from 'node-cron';
import pool from '../config/db.js';

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

export const iniciarCronEstados = () => {
  // Se ejecuta cada minuto
  cron.schedule('* * * * *', sincronizarEstados);
  console.log('[Cron] Servicio de desactivación por expiración iniciado.');
};