import pool from '../config/db.js';

/**
 * Registra o actualiza un heartbeat de dispositivo
 * @param {string} identificador - Identificador único del dispositivo
 * @param {string} nombre - Nombre del dispositivo
 * @param {string} ubicacion - Ubicación del dispositivo
 * @returns {Promise} Dispositivo actualizado
 */
export const registrarHeartbeat = async (identificador, nombre = null, ubicacion = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insertar o actualizar el dispositivo en un solo paso
    const dispositivoResult = await client.query(
      `INSERT INTO dispositivos_kioscos 
         (identificador, nombre, ubicacion, estado_conexion, ultima_conexion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'conectado', NOW(), NOW())
       ON CONFLICT (identificador)
       DO UPDATE SET
         nombre = COALESCE(EXCLUDED.nombre, dispositivos_kioscos.nombre),
         ubicacion = COALESCE(EXCLUDED.ubicacion, dispositivos_kioscos.ubicacion),
         estado_conexion = 'conectado',
         ultima_conexion = NOW(),
         fecha_actualizacion = NOW()
       RETURNING *;
      `,
      [identificador, nombre || null, ubicacion || null]
    );

    if (!dispositivoResult.rows || dispositivoResult.rows.length === 0) {
      throw new Error('No se pudo obtener el dispositivo después del heartbeat');
    }

    const dispositivoId = dispositivoResult.rows[0].id;
    const dispositivo = dispositivoResult.rows[0];

    // Registrar en log de conexiones
    await client.query(
      `INSERT INTO conexiones_log (dispositivo_id, identificador_dispositivo, tipo_evento, detalles)
       VALUES ($1, $2, $3, $4)`,
      [dispositivoId, identificador, 'heartbeat', JSON.stringify({ timestamp: new Date() })]
    );

    await client.query('COMMIT');
    return dispositivo;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtiene el estado de conexión de todos los dispositivos
 * @returns {Promise<Array>} Lista de dispositivos con su estado
 */
export const obtenerEstadoDispositivos = async () => {
  try {
    const resultado = await pool.query(`
      SELECT 
        id,
        identificador,
        nombre,
        ubicacion,
        estado_conexion,
        ultima_conexion,
        EXTRACT(EPOCH FROM (NOW() - ultima_conexion))::INTEGER as segundos_sin_conexion
      FROM dispositivos_kioscos
      ORDER BY ultima_conexion DESC
    `);
    return resultado.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el estado de un dispositivo específico
 * @param {string} identificador - Identificador del dispositivo
 * @returns {Promise} Estado del dispositivo
 */
export const obtenerEstadoDispositivo = async (identificador) => {
  try {
    const resultado = await pool.query(
      `SELECT 
        id,
        identificador,
        nombre,
        ubicacion,
        estado_conexion,
        ultima_conexion,
        EXTRACT(EPOCH FROM (NOW() - ultima_conexion))::INTEGER as segundos_sin_conexion
       FROM dispositivos_kioscos
       WHERE identificador = $1`,
      [identificador]
    );
    return resultado.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Detecta desconexiones basadas en tiempo sin heartbeat
 * @param {number} minutosUmbrales - Minutos sin heartbeat para considerar desconectado
 * @returns {Promise<Array>} Dispositivos desconectados
 */
export const detectarDesconexiones = async (minutosUmbrales = 10) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener dispositivos que no han enviado heartbeat en X minutos
    const desconectados = await client.query(
      `SELECT id, identificador 
       FROM dispositivos_kioscos 
       WHERE estado_conexion = 'conectado'
       AND (NOW() - ultima_conexion) > INTERVAL '1 minute' * $1`,
      [minutosUmbrales]
    );

    // Actualizar estado de desconexión
    for (const dispositivo of desconectados.rows) {
      await client.query(
        `UPDATE dispositivos_kioscos 
         SET estado_conexion = $1, fecha_actualizacion = NOW() 
         WHERE id = $2`,
        ['desconectado', dispositivo.id]
      );

      // Registrar en log
      await client.query(
        `INSERT INTO conexiones_log (dispositivo_id, identificador_dispositivo, tipo_evento, detalles)
         VALUES ($1, $2, $3, $4)`,
        [dispositivo.id, dispositivo.identificador, 'desconectado', 
         JSON.stringify({ razon: 'Timeout por falta de heartbeat', umbral_minutos: minutosUmbrales })]
      );
    }

    await client.query('COMMIT');
    return desconectados.rows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtiene el historial de conexiones de un dispositivo
 * @param {number} dispositivoId - ID del dispositivo
 * @param {number} limiteRegistros - Cantidad de registros a obtener
 * @returns {Promise<Array>} Historial de conexiones
 */
export const obtenerHistorialDispositivo = async (dispositivoId, limiteRegistros = 50) => {
  try {
    const resultado = await pool.query(
      `SELECT * FROM conexiones_log 
       WHERE dispositivo_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [dispositivoId, limiteRegistros]
    );
    return resultado.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene estadísticas de conexión
 * @returns {Promise} Estadísticas de conectividad
 */
export const obtenerEstadisticas = async () => {
  try {
    const resultado = await pool.query(`
      SELECT 
        COUNT(*) as total_dispositivos,
        SUM(CASE WHEN estado_conexion = 'conectado' THEN 1 ELSE 0 END) as dispositivos_conectados,
        SUM(CASE WHEN estado_conexion = 'desconectado' THEN 1 ELSE 0 END) as dispositivos_desconectados
      FROM dispositivos_kioscos
    `);
    return resultado.rows[0];
  } catch (error) {
    throw error;
  }
};
