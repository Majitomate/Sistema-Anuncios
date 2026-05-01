import {
  crearAnuncio,
  obtenerAnuncios,
  editarAnuncio,
  obtenerAnuncioPorId,
  eliminarAnuncio,
  obtenerAnunciosKiosco, // <-- ¡Nuevo método que deberás agregar a tu modelo!
  obtenerArchivosAnuncio,
} from '../models/anuncios.model.js';

// Obtener todos los anuncios (Para el Dashboard - Protegido)
export const listar = async (req, res) => {
  try {
    const anuncios = await obtenerAnuncios();
    return res.json(anuncios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obteniendo anuncios' });
  }
};

// Obtener anuncios activos y ordenados (Para la Vista Kiosco - Público)
export const listarKiosco = async (req, res) => {
  try {
    const anuncios = await obtenerAnunciosKiosco();
    return res.status(200).json(anuncios);
  } catch (error) {
    console.error('Error al obtener anuncios para el kiosco:', error);
    return res.status(500).json({ error: 'Error obteniendo anuncios del kiosco' });
  }
};

// Crear anuncio
export const crear = async (req, res) => {
  try {
    const datos = req.body;
    const imagen = req.files?.imagen?.[0];
    const documento = req.files?.documento?.[0];

    const anuncio = await crearAnuncio(datos, imagen, documento);
    return res.status(201).json(anuncio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creando anuncio' });
  }
};

// Obtener un anuncio
export const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = await obtenerAnuncioPorId(id);
    
    if (!anuncio) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    
    return res.json(anuncio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obteniendo anuncio' });
  }
};

// Editar anuncio
export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    const imagen = req.files?.imagen?.[0];
    const documento = req.files?.documento?.[0];

    const anuncio = await editarAnuncio(id, datos, imagen, documento);
    
    if (!anuncio) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    return res.json(anuncio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error actualizando anuncio' });
  }
};

// Descargar imagen
export const descargarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const archivos = await obtenerArchivosAnuncio(id);
    
    if (!archivos || !archivos.imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    res.set({
      'Content-Type': archivos.imagen_tipo || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', 
    });
    return res.send(archivos.imagen);
  } catch (error) {
    console.error('[Error descargarImagen]:', error);
    return res.status(500).json({ error: 'Error interno descargando imagen' });
  }
};

// Descargar documento
export const descargarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const archivos = await obtenerArchivosAnuncio(id);
    
    if (!archivos || !archivos.documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    res.set({
      'Content-Type': archivos.documento_tipo || 'application/pdf',
      'Content-Disposition': `inline; filename="anuncio_${id}_documento.pdf"`, 
    });
    return res.send(archivos.documento);
  } catch (error) {
    console.error('[Error descargarDocumento]:', error);
    return res.status(500).json({ error: 'Error interno descargando documento' });
  }
};

// Eliminar anuncio
export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const filas = await eliminarAnuncio(id);

    if (filas === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    return res.status(200).json({ mensaje: 'Anuncio eliminado permanentemente', id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error eliminando anuncio' });
  }
};