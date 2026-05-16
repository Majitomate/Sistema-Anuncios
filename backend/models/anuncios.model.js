import pool from '../config/db.js';

// Crear anuncio
export const crearAnuncio = async (datos, imagenes, documento, usuarioId) => {
  const esPermanente = datos.esPermanente === 'true';
  const estadoInicial = true; 

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const queryAnuncio = `
      INSERT INTO anuncios 
      (titulo, descripcion_corta, contenido, tipo,
       documento, documento_tipo,
       fecha_inicio, fecha_fin, prioridad, es_permanente, estado, 
       creado_por, modificado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const valuesAnuncio = [
      datos.titulo, datos.descripcion_corta, datos.contenido, datos.tipo,
      documento ? documento.buffer : null, documento ? documento.mimetype : null,
      datos.fechaInicio || null, datos.fechaFin || null,
      datos.prioridad || 1, esPermanente, estadoInicial,
      usuarioId, usuarioId, // $12 y $13
    ];

    const resAnuncio = await client.query(queryAnuncio, valuesAnuncio);
    const anuncioCreado = resAnuncio.rows[0];

    if (imagenes && imagenes.length > 0) {
      for (const img of imagenes) {
        await client.query(
          `INSERT INTO anuncios_imagenes (anuncio_id, imagen, imagen_tipo) VALUES ($1, $2, $3)`,
          [anuncioCreado.id, img.buffer, img.mimetype]
        );
      }
    }

    await client.query('COMMIT');
    return anuncioCreado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Obtener anuncio por id
export const obtenerAnuncioPorId = async (id) => {
  const query = `
    SELECT
      id, titulo, descripcion_corta, contenido, tipo,
      documento_tipo,
      estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad,
      fecha_creacion, fecha_actualizacion,
      CASE WHEN documento IS NOT NULL THEN true ELSE false END AS tiene_documento,
      -- Evaluamos dinámicamente si realmente debe estar activo en pantalla
      CASE 
        WHEN estado = false THEN false
        WHEN es_permanente = true THEN true
        WHEN (NOW() >= fecha_inicio AND (fecha_fin IS NULL OR NOW() <= fecha_fin)) THEN true
        ELSE false
      END AS esta_vigente
    FROM anuncios
    WHERE id = $1;
  `;
  const result = await pool.query(query, [id]);
  const anuncio = result.rows[0];

  if (anuncio) {
    // Obtener las imágenes asociadas
    const imgQuery = 'SELECT id, imagen_tipo FROM anuncios_imagenes WHERE anuncio_id = $1 ORDER BY id';
    const imgResult = await pool.query(imgQuery, [id]);
    anuncio.imagenes = imgResult.rows.map(row => ({ id: row.id, tipo: row.imagen_tipo }));
  }

  return anuncio;
};

export const obtenerArchivosAnuncio = async (id) => {
  const query = 'SELECT documento, documento_tipo FROM anuncios WHERE id = $1;';

  const result = await pool.query(query, [id]);
  const anuncio = result.rows[0];

  if (anuncio) {
    const imgResult = await pool.query('SELECT id FROM anuncios_imagenes WHERE anuncio_id = $1', [id]);
    anuncio.imagenes_ids = imgResult.rows.map(row => row.id);
  }
  return anuncio;
};

// Función para buscar una imagen en específico
export const obtenerImagenPorId = async (idImagen) => {
  const result = await pool.query('SELECT imagen, imagen_tipo FROM anuncios_imagenes WHERE id = $1', [idImagen]);
  return result.rows[0];
};

// Obtener todos los anuncios (Dashboard) con el cálculo automático de vigencia
export const obtenerAnuncios = async () => {
  const result = await pool.query(`
    SELECT
      id, titulo, descripcion_corta, contenido, tipo,
      documento_tipo, estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad,
      fecha_creacion, fecha_actualizacion,
      -- Si el administrador lo apagó manualmente (estado = false), esta_vigente SIEMPRE será false
      CASE 
        WHEN estado = false THEN false
        WHEN es_permanente = true THEN true
        WHEN (NOW() >= fecha_inicio AND (fecha_fin IS NULL OR NOW() <= fecha_fin)) THEN true
        ELSE false
      END AS esta_vigente
    FROM anuncios ORDER BY id DESC;
  `);

  const anuncios = result.rows;

  // Para cada anuncio, obtener sus imágenes
  for (const anuncio of anuncios) {
    const imgResult = await pool.query('SELECT id, imagen_tipo FROM anuncios_imagenes WHERE anuncio_id = $1 ORDER BY id', [anuncio.id]);
    anuncio.imagenes = imgResult.rows.map(row => ({ id: row.id, tipo: row.imagen_tipo }));
  }

  return anuncios;
};

// Obtener anuncios Kiosco
export const obtenerAnunciosKiosco = async () => {
  const resultTemporales = await pool.query(`
    SELECT
      id, titulo, descripcion_corta, contenido, tipo,
      documento_tipo, estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad
    FROM anuncios
    WHERE estado = true 
      AND es_permanente = false
      AND (NOW() >= fecha_inicio AND (fecha_fin IS NULL OR NOW() <= fecha_fin))
    ORDER BY prioridad DESC, fecha_creacion DESC
  `);

  let anuncios = resultTemporales.rows;

  if (anuncios.length === 0) {
    const resultPermanentes = await pool.query(`
      SELECT
        id, titulo, descripcion_corta, contenido, tipo,
        documento_tipo, estado, es_permanente,
        fecha_inicio, fecha_fin, prioridad
      FROM anuncios
      WHERE estado = true
        AND es_permanente = true
      ORDER BY prioridad DESC, fecha_creacion DESC
    `);
    anuncios = resultPermanentes.rows;
  }

  for (const anuncio of anuncios) {
    const imgResult = await pool.query(
      'SELECT id, imagen_tipo FROM anuncios_imagenes WHERE anuncio_id = $1 ORDER BY id', 
      [anuncio.id]
    );
    anuncio.imagenes = imgResult.rows.map(row => ({ id: row.id, tipo: row.imagen_tipo }));
  }

  return anuncios;
};

// Eliminar anuncio
export const eliminarAnuncio = async (id) => {
  const result = await pool.query('DELETE FROM anuncios WHERE id = $1', [id]);
  return result.rowCount;
};

// Editar anuncio
export const editarAnuncio = async (id, datos, imagenes, documento, usuarioId) => {
  // SE AGREGA: modificado_por = $12
  const query = `
    UPDATE anuncios SET 
      titulo = $1, descripcion_corta = $2, contenido = $3, tipo = $4,
      documento = COALESCE($5::bytea, documento), 
      documento_tipo = COALESCE($6::varchar, documento_tipo),
      fecha_inicio = $7, fecha_fin = $8, prioridad = $9, 
      es_permanente = $10, estado = $11, modificado_por = $12,
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $13 RETURNING *;
  `;
  const values = [
    datos.titulo, datos.descripcion_corta, datos.contenido, datos.tipo,
    documento ? documento.buffer : null, documento ? documento.mimetype : null,
    datos.fechaInicio || null, datos.fechaFin || null, datos.prioridad || 1,
    datos.esPermanente === 'true', datos.estado === 'true' || datos.estado === true,
    usuarioId, id,
  ];

  const result = await pool.query(query, values);
  const anuncioActualizado = result.rows[0];

  if (anuncioActualizado && imagenes && imagenes.length > 0) {
    for (const img of imagenes) {
      await pool.query(
        `INSERT INTO anuncios_imagenes (anuncio_id, imagen, imagen_tipo) VALUES ($1, $2, $3)`,
        [anuncioActualizado.id, img.buffer, img.mimetype]
      );
    }
  }
  return anuncioActualizado;
};

export const obtenerAuditoriaAnuncio = async (id) => {
  const query = `
    SELECT 
      a.id AS anuncio_id,
      a.titulo,
      a.descripcion_corta,
      a.contenido,
      a.tipo,
      a.prioridad,
      a.estado,
      a.es_permanente,
      a.fecha_inicio,
      a.fecha_fin,
      a.documento_tipo,
      a.fecha_creacion,
      a.fecha_actualizacion,
      u1.nombre AS creado_por_nombre,
      u1.email AS creado_por_email,
      u2.nombre AS modificado_por_nombre,
      u2.email AS modificado_por_email
    FROM anuncios a
    LEFT JOIN usuarios u1 ON a.creado_por = u1.id
    LEFT JOIN usuarios u2 ON a.modificado_por = u2.id
    WHERE a.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};