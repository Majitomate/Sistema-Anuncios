const pool = require('../config/db');

// Crear anuncio
const crearAnuncio = async (datos, imagen, documento) => {
  // El estado inicial depende de la fecha de inicio:
  // - Si ya llegó la hora de inicio (o es permanente) → TRUE
  // - Si todavía no empieza → FALSE (el cron lo activará cuando llegue la hora)
  const esPermanente = datos.esPermanente === 'true';
  const fechaInicio  = datos.fechaInicio ? new Date(datos.fechaInicio) : null;
  const estadoInicial = esPermanente || !fechaInicio || fechaInicio <= new Date();

  const query = `
    INSERT INTO anuncios 
    (titulo, subtitulo, contenido, tipo,
     imagen, imagen_tipo, 
     documento, documento_tipo,
     fecha_inicio, fecha_fin, prioridad, es_permanente, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, titulo, subtitulo, contenido, tipo,
              imagen_tipo, documento_tipo,
              estado, es_permanente,
              fecha_inicio, fecha_fin, prioridad,
              fecha_creacion, fecha_actualizacion;
  `;

  const values = [
    datos.titulo,
    datos.subtitulo,
    datos.contenido,
    datos.tipo,
    imagen ? imagen.buffer : null,
    imagen ? imagen.mimetype : null,
    documento ? documento.buffer : null,
    documento ? documento.mimetype : null,
    datos.fechaInicio || null,
    datos.fechaFin || null,
    datos.prioridad || 1,
    esPermanente,
    estadoInicial,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};


// Obtener anuncios
const obtenerAnuncios = async () => {
  const result = await pool.query(`
    SELECT
      id, titulo, subtitulo, contenido, tipo,
      imagen, imagen_tipo, documento_tipo,
      estado, es_permanente,
      fecha_inicio, fecha_fin, prioridad,
      fecha_creacion, fecha_actualizacion
    FROM anuncios
    ORDER BY id DESC;
  `);
  return result.rows;
};

// Obtener anuncio por id
const obtenerAnuncioPorId = async (id) => {
  const query = 'SELECT * FROM anuncios WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Editar anuncio
const editarAnuncio = async (id, datos, imagen, documento) => {
  const query = `
    UPDATE anuncios 
    SET 
      titulo = $1, 
      subtitulo = $2, 
      contenido = $3, 
      tipo = $4,
      imagen = COALESCE($5::bytea, imagen), 
      imagen_tipo = COALESCE($6::varchar, imagen_tipo), 
      documento = COALESCE($7::bytea, documento), 
      documento_tipo = COALESCE($8::varchar, documento_tipo),
      fecha_inicio = $9, 
      fecha_fin = $10, 
      prioridad = $11, 
      es_permanente = $12,
      estado = $13,
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $14
    RETURNING *;
  `;

  const values = [
    datos.titulo,
    datos.subtitulo,
    datos.contenido,
    datos.tipo,
    imagen ? imagen.buffer : null,
    imagen ? imagen.mimetype : null,
    documento ? documento.buffer : null,
    documento ? documento.mimetype : null,
    datos.fechaInicio || null,
    datos.fechaFin || null,
    datos.prioridad || 1,
    datos.esPermanente === 'true',
    datos.estado === 'true' || datos.estado === true,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};


// Eliminar anuncio
const eliminarAnuncio = async (id) => {
  const query = 'DELETE FROM anuncios WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount;
};

module.exports = {
  crearAnuncio,
  obtenerAnuncios,
  obtenerAnuncioPorId,
  editarAnuncio,
  eliminarAnuncio
};