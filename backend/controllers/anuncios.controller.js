import sharp from 'sharp';
import { Readable } from 'stream';
import {
  crearAnuncio,
  obtenerAnuncios,
  editarAnuncio,
  obtenerAnuncioPorId,
  eliminarAnuncio,
  obtenerAnunciosKiosco,
  obtenerArchivosAnuncio,
  obtenerImagenPorId,
  obtenerAuditoriaAnuncio,
} from '../models/anuncios.model.js';

// ==========================================
// FUNCIÓN AUXILIAR PARA OPTIMIZAR IMÁGENES
// ==========================================
const optimizarImagenes = async (imagenesMulter) => {
  if (!imagenesMulter || imagenesMulter.length === 0) return [];
  
  const imagenesOptimizadas = [];
  for (const img of imagenesMulter) {
    if (img.mimetype.startsWith('image/')) {
      // Comprime a WebP y reduce a tamaño HD
      const bufferOptimizado = await sharp(img.buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      
      imagenesOptimizadas.push({
        ...img,
        buffer: bufferOptimizado,
        mimetype: 'image/webp'
      });
    } else {
      imagenesOptimizadas.push(img);
    }
  }
  return imagenesOptimizadas;
};

// Obtener todos los anuncios
export const listar = async (req, res) => {
  try {
    const anuncios = await obtenerAnuncios();
    return res.json(anuncios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obteniendo anuncios' });
  }
};

// Obtener anuncios activos y ordenados
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
    const imagenesOriginales = req.files?.imagen || [];
    const documento = req.files?.documento?.[0];
    const usuarioId = req.user.id;

    // OPTIMIZAMOS ANTES DE GUARDAR
    const imagenes = await optimizarImagenes(imagenesOriginales);

    const anuncio = await crearAnuncio(datos, imagenes, documento, usuarioId);
    
    // Avisar a tablets
    const io = req.app.get('io');
    if (io) {
      io.emit('actualizacion_anuncios');
    }
    
    return res.status(201).json(anuncio);
  } catch (error) {
    console.error('[Error crear anuncio]:', error);
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
    const imagenesOriginales = req.files?.imagen || [];
    const documento = req.files?.documento?.[0] || null;
    const usuarioId = req.user.id; 
    const anuncioActualBD = await obtenerAnuncioPorId(id);

    if (!anuncioActualBD) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    // OPTIMIZAMOS LAS IMÁGENES NUEVAS
    const imagenes = await optimizarImagenes(imagenesOriginales);

    const fechaInicio = datos.fechaInicio || anuncioActualBD.fecha_inicio;
    const fechaFin = datos.fechaFin || anuncioActualBD.fecha_fin;

    // Conservamos el estado que el usuario envía durante la edición.
    // No forzamos desactivarlo solo porque las fechas actuales no estén vigentes.
    const fila = await editarAnuncio(id, datos, imagenes, documento, usuarioId);

    if (!fila) {
      return res.status(404).json({ error: 'Anuncio no encontrado al intentar guardar' });
    }

    // Avisar a tablets que hubo un cambio
    const io = req.app.get('io');
    if (io) {
      io.emit('actualizacion_anuncios');
    }

    return res.json(fila);
  } catch (error) {
    console.error('[Error actualizar]:', error);
    return res.status(500).json({ error: 'Error interno actualizando anuncio' });
  }
};

// Descargar imagen (primera imagen del anuncio)
export const descargarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const archivos = await obtenerArchivosAnuncio(id);

    if (!archivos || !archivos.imagenes_ids || archivos.imagenes_ids.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const primeraImagenId = archivos.imagenes_ids[0];
    const archivo = await obtenerImagenPorId(primeraImagenId);

    if (!archivo || !archivo.imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.set({
      'Content-Type': archivo.imagen_tipo || 'image/jpeg',
      'Cache-Control': 'public, max-age=604800', // 7 días
    });
    return res.send(archivo.imagen);
  } catch (error) {
    console.error('[Error descargarImagen]:', error);
    return res.status(500).json({ error: 'Error interno descargando imagen' });
  }
};

// Descargar imagen específica por ID de imagen
export const descargarImagenEspecifica = async (req, res) => {
  try {
    const { idImagen } = req.params;
    const archivo = await obtenerImagenPorId(idImagen);

    if (!archivo || !archivo.imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.set({
      'Content-Type': archivo.imagen_tipo || 'image/jpeg',
      'Cache-Control': 'public, max-age=604800', // 7 días
    });
    return res.send(archivo.imagen);
  } catch (error) {
    console.error('[Error descargarImagenEspecifica]:', error);
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

    // Cabeceras HTTP óptimas para PDFs y rendimiento
    res.set({
      'Content-Type': archivos.documento_tipo || 'application/pdf',
      'Content-Disposition': `inline; filename="anuncio_${id}_documento.pdf"`,
      'Cache-Control': 'public, max-age=604800', // 7 días
    });
    
    const streamEstudiante = new Readable();
    streamEstudiante.push(archivos.documento);
    streamEstudiante.push(null);

    // Envía el flujo directo al cliente (tablet) en porciones dinámicas
    return streamEstudiante.pipe(res);

  } catch (error) {
    console.error('[Error descargarDocumento]:', error);
    return res.status(500).json({ error: 'Error interno descargando documento' });
  }
};

// Consultar Auditoría
export const consultarAuditoria = async (req, res) => {
  try {
    const { id } = req.params;
    const auditoria = await obtenerAuditoriaAnuncio(id);

    if (!auditoria) {
      return res.status(404).json({ error: 'Registro de auditoría no encontrado' });
    }

    const cambiosDetectados = [];
    const creado = new Date(auditoria.fecha_creacion).getTime();
    const actualizado = new Date(auditoria.fecha_actualizacion).getTime();
    const fueModificado = (actualizado - creado) > 2000;

    if (fueModificado) {
      cambiosDetectados.push(`El anuncio fue editado operativamente.`);
      cambiosDetectados.push(`Clasificación actual: Tipo [${auditoria.tipo}] con Prioridad [${auditoria.prioridad === 3 ? 'Alta' : auditoria.prioridad === 2 ? 'Media' : 'Baja'}].`);

      if (auditoria.es_permanente) {
        cambiosDetectados.push('Establecido como contenido permanente del Kiosco.');
      } else {
        cambiosDetectados.push('Se ajustaron los rangos de vigencia horaria/calendario.');
      }

      if (auditoria.documento_tipo) {
        cambiosDetectados.push('Contiene un documento institucional adjunto (PDF).');
      }

      if (!auditoria.estado) {
        cambiosDetectados.push('⚠️ El administrador forzó el apagado del anuncio (Interruptor Maestro: Inactivo).');
      }
    } else {
      cambiosDetectados.push('El anuncio conserva su contenido y configuración original de creación.');
    }

    return res.status(200).json({
      ...auditoria,
      fueModificado,
      cambiosDetectados,
    });
  } catch (error) {
    console.error('[Error consultarAuditoria]:', error);
    return res.status(500).json({ error: 'Error interno obteniendo la auditoría' });
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

    // Avisar a tablets que se borró un anuncio
    const io = req.app.get('io');
    if (io) {
      io.emit('actualizacion_anuncios');
    }

    return res.status(200).json({ mensaje: 'Anuncio eliminado permanentemente', id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error eliminando anuncio' });
  }
};