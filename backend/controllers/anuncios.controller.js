const { 
  crearAnuncio, 
  obtenerAnuncios, 
  editarAnuncio, 
  obtenerAnuncioPorId, 
  eliminarAnuncio 
} = require('../models/anuncios.model');

// Obtener todos los anuncios
const listar = async (req, res) => {
  try {
    const anuncios = await obtenerAnuncios();
    return res.json(anuncios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obteniendo anuncios' });
  }
};

// Crear anuncio
const crear = async (req, res) => {
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
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = await obtenerAnuncioPorId(id);
    if (!anuncio) return res.status(404).json({ error: 'No encontrado' });
    return res.json(anuncio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error obteniendo anuncio' });
  }
};

// Editar anuncio
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    const imagen = req.files?.imagen?.[0];
    const documento = req.files?.documento?.[0];

    const anuncio = await editarAnuncio(id, datos, imagen, documento);
    if (!anuncio) return res.status(404).json({ error: 'Anuncio no encontrado' });

    return res.json(anuncio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error actualizando anuncio' });
  }
};

// Eliminar anuncio
const eliminar = async (req, res) => {
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

module.exports = { 
  crear, 
  listar, 
  obtenerPorId, 
  actualizar, 
  eliminar 
};
