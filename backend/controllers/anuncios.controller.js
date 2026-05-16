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
    const imagenes = req.files?.imagen || [];
    const documento = req.files?.documento?.[0];
    const usuarioId = req.user.id; // Extraído de forma segura del JWT verificado

    const anuncio = await crearAnuncio(datos, imagenes, documento, usuarioId);
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
    const imagenes = req.files?.imagen || [];
    const documento = req.files?.documento?.[0] || null;
    const usuarioId = req.user.id; // Extraído de forma segura del JWT verificado

    const anuncioActualBD = await obtenerAnuncioPorId(id);
    
    if (!anuncioActualBD) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    const nuevoEstadoSolicitado = datos.estado === 'true' || datos.estado === true;
    const esPermanente = datos.esPermanente === 'true' || datos.esPermanente === true;
    const fechaInicio = datos.fechaInicio || anuncioActualBD.fecha_inicio;
    const fechaFin = datos.fechaFin || anuncioActualBD.fecha_fin;

    const estaDentroDeFechas = () => {
      if (esPermanente) return true;
      if (!fechaInicio) return false;

      const inicio = new Date(fechaInicio);
      const fin = fechaFin ? new Date(fechaFin) : null;
      const ahora = new Date();

      if (Number.isNaN(inicio.getTime())) return false;
      if (fin && Number.isNaN(fin.getTime())) return false;

      return inicio <= ahora && (!fin || ahora <= fin);
    };

    // Respetar el cambio manual del administrador.
    // Solo desactivamos automáticamente si el anuncio está fuera de su ventana de vigencia.
    if (nuevoEstadoSolicitado && !estaDentroDeFechas()) {
      datos.estado = false;
    }

    // Se pasa usuarioId como último argumento
    const fila = await editarAnuncio(id, datos, imagenes, documento, usuarioId);

    if (!fila) {
      return res.status(404).json({ error: 'Anuncio no encontrado al intentar guardar' });
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

    // Obtener la primera imagen
    const primeraImagenId = archivos.imagenes_ids[0];
    const archivo = await obtenerImagenPorId(primeraImagenId);

    if (!archivo || !archivo.imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.set({
      'Content-Type': archivo.imagen_tipo || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
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
      'Cache-Control': 'public, max-age=86400',
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

// Consultar Auditoría
export const consultarAuditoria = async (req, res) => {
  try {
    const { id } = req.params;
    const auditoria = await obtenerAuditoriaAnuncio(id);

    if (!auditoria) {
      return res.status(404).json({ error: 'Registro de auditoría no encontrado' });
    }

    // Inicializamos el array de detalles del cambio
    const cambiosDetectados = [];

    const creado = new Date(auditoria.fecha_creacion).getTime();
    const actualizado = new Date(auditoria.fecha_actualizacion).getTime();
    
    // Margen de 2 segundos por cualquier retraso en la transacción de la BD
    const fueModificado = (actualizado - creado) > 2000;

    if (fueModificado) {
      // Como buena práctica de auditoría, listamos las propiedades críticas activas en la última versión
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

    // Retornamos un objeto extendido respetando el estándar Airbnb (sin mutar el original)
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

    return res.status(200).json({ mensaje: 'Anuncio eliminado permanentemente', id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error eliminando anuncio' });
  }
};