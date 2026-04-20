const cron = require('node-cron');
const pool = require('../config/db');

const sincronizarEstados = async () => {
  try {
    // Activar los que ya deben estar activos y aún no lo están
    const activados = await pool.query(`
      UPDATE anuncios
      SET estado = TRUE,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE estado = FALSE
        AND (es_permanente = TRUE
             OR (fecha_inicio <= NOW() AND (fecha_fin IS NULL OR fecha_fin >= NOW())))
      RETURNING id, titulo
    `);

    // Desactivar los que ya vencieron y siguen activos
    const desactivados = await pool.query(`
      UPDATE anuncios
      SET estado = FALSE,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE estado = TRUE
        AND es_permanente = FALSE
        AND (
          fecha_fin < NOW()
          OR fecha_inicio > NOW()
        )
      RETURNING id, titulo
    `);

    const nActivados    = activados.rowCount;
    const nDesactivados = desactivados.rowCount;

    if (nActivados > 0 || nDesactivados > 0) {
      console.log(`[Cron] Sincronización completada — Activados: ${nActivados} | Desactivados: ${nDesactivados}`);
      if (nActivados > 0) {
        activados.rows.forEach(a => console.log(`  ✅ Activado: [${a.id}] ${a.titulo}`));
      }
      if (nDesactivados > 0) {
        desactivados.rows.forEach(a => console.log(`  ⏹  Desactivado: [${a.id}] ${a.titulo}`));
      }
    }
  } catch (error) {
    console.error('[Cron] Error al sincronizar estados:', error.message);
  }
};


 const iniciarCronEstados = () => {
  // Ejecutar inmediatamente al arrancar para corregir estados desde el inicio
  sincronizarEstados();

  // Luego correr cada minuto
  cron.schedule('* * * * *', sincronizarEstados, {
    timezone: 'America/Hermosillo',
  });

  console.log('[Cron] Job de sincronización de estados iniciado (cada minuto)');
};

module.exports = { iniciarCronEstados };