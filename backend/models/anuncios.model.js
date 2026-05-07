import pool from '../config/db.js';

// Crear anuncio con múltiples imágenes
export const crearAnuncio = async (datos, imagenes, documento) => {
  const esPermanente = datos.esPermanente === 'true';
  const fechaInicio = datos.fechaInicio ? new Date(datos.fechaInicio) : null;
  const estadoInicial = esPermanente || !fechaInicio || fechaInicio <= new Date();

  // Usamos un 'client' para hacer una transacción segura
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Iniciar transacción

    // 1. Guardar el anuncio (ya no incluimos las columnas de imagen aquí)
    const queryAnuncio = `
      INSERT INTO anuncios 
      (titulo, descripcion_corta, contenido, tipo,
       documento, documento_tipo,
       fecha_inicio, fecha_fin, prioridad, es_permanente, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const valuesAnuncio = [
      datos.titulo, datos.descripcion_corta, datos.contenido, datos.tipo,
      documento ? documento.buffer : null, documento ? documento.mimetype : null,
      datos.fechaInicio || null, datos.fechaFin || null,
      datos.prioridad || 1, esPermanente, estadoInicial
    ];

    const resAnuncio = await client.query(queryAnuncio, valuesAnuncio);
    const anuncioCreado = resAnuncio.rows[0];

    // 2. Guardar las imágenes en la nueva tabla usando un bucle
    if (imagenes && imagenes.length > 0) {
      for (const img of imagenes) {
        await client.query(
          `INSERT INTO anuncios_imagenes (anuncio_id, imagen, imagen_tipo) VALUES ($1, $2, $3)`,
          [anuncioCreado.id, img.buffer, img.mimetype]
        );
      }
    }

    await client.query('COMMIT'); // Confirmar si todo salió bien
    return anuncioCreado;
  } catch (error) {
    await client.query('ROLLBACK'); // Deshacer todo si hay error
    throw error;
  } finally {
    client.release();
  }
};

// Obtener anuncio por id (ahora devuelve la lista de IDs de sus imágenes)
export const obtenerAnuncioPorId = async (id) => {
  const query = `
    SELECT
      id, titulo, descripcion_corta, contenido, tipo,
      documento_tipo,
      estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad,
      fecha_creacion, fecha_actualizacion,
      CASE WHEN documento IS NOT NULL THEN true ELSE false END AS tiene_documento
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

// NUEVO: Función para buscar una imagen en específico
export const obtenerImagenPorId = async (idImagen) => {
  const result = await pool.query('SELECT imagen, imagen_tipo FROM anuncios_imagenes WHERE id = $1', [idImagen]);
  return result.rows[0];
};

// Obtener todos los anuncios (Dashboard) - Quitamos imagen_tipo
export const obtenerAnuncios = async () => {
  const result = await pool.query(`
    SELECT
      id, titulo, descripcion_corta, contenido, tipo,
      documento_tipo, estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad,
      fecha_creacion, fecha_actualizacion
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

// Obtener anuncios Kiosco - Quitamos imagen_tipo
export const obtenerAnunciosKiosco = async () => {
  const result = await pool.query(`
    SELECT
      id, titulo, descripcion_corta, contenido, tipo,
      documento_tipo, estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad
    FROM anuncios
    WHERE estado = true 
  AND (
    es_permanente = true 
    OR (NOW() >= fecha_inicio AND (fecha_fin IS NULL OR NOW() <= fecha_fin))
  )
    ORDER BY prioridad DESC, fecha_creacion DESC
  `);

  const anuncios = result.rows;

  // Para cada anuncio, obtener sus imágenes
  for (const anuncio of anuncios) {
    const imgResult = await pool.query('SELECT id, imagen_tipo FROM anuncios_imagenes WHERE anuncio_id = $1 ORDER BY id', [anuncio.id]);
    anuncio.imagenes = imgResult.rows.map(row => ({ id: row.id, tipo: row.imagen_tipo }));
  }

  return anuncios;
};

// Eliminar anuncio (Al tener "ON DELETE CASCADE" en tu SQL, borrará las fotos automáticamente)
export const eliminarAnuncio = async (id) => {
  const result = await pool.query('DELETE FROM anuncios WHERE id = $1', [id]);
  return result.rowCount;
};

// Editar anuncio (Versión simple: solo actualiza info y agrega nuevas fotos si envían)
export const editarAnuncio = async (id, datos, imagenes, documento) => {
  const query = `
    UPDATE anuncios SET 
      titulo = $1, descripcion_corta = $2, contenido = $3, tipo = $4,
      documento = COALESCE($5::bytea, documento), 
      documento_tipo = COALESCE($6::varchar, documento_tipo),
      fecha_inicio = $7, fecha_fin = $8, prioridad = $9, 
      es_permanente = $10, estado = $11, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $12 RETURNING *;
  `;
  const values = [
    datos.titulo, datos.descripcion_corta, datos.contenido, datos.tipo,
    documento ? documento.buffer : null, documento ? documento.mimetype : null,
    datos.fechaInicio || null, datos.fechaFin || null, datos.prioridad || 1,
    datos.esPermanente === 'true', datos.estado === 'true' || datos.estado === true, id
  ];

  const result = await pool.query(query, values);
  const anuncioActualizado = result.rows[0];

  // Si mandan nuevas fotos al editar, las agregamos a la galería
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