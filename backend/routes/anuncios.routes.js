const express = require('express');
const multer  = require('multer');
const { validarCreacionAnuncio, validarEdicionAnuncio } = require('../middlewares/validarAnuncio');
const {
  listar,
  crear,
  obtenerPorId,
  descargarImagen,
  descargarDocumento,
  actualizar,
  eliminar,
} = require('../controllers/anuncios.controller');

const router  = express.Router();
const storage = multer.memoryStorage();
const upload  = multer({ storage });

const archivos = upload.fields([
  { name: 'imagen',    maxCount: 1 },
  { name: 'documento', maxCount: 1 },
]);

// Obtener todos los anuncios
router.get('/', listar);

// Obtener un anuncio por id
router.get('/:id', obtenerPorId);

// Descargar imagen / documento
router.get('/:id/imagen',    descargarImagen);
router.get('/:id/documento', descargarDocumento);

// Crear anuncio
router.post('/', archivos, validarCreacionAnuncio, crear);

// Editar anuncio — usa validarEdicionAnuncio (fechas opcionales)
router.put('/:id', archivos, validarEdicionAnuncio, actualizar);

// Eliminar anuncio
router.delete('/:id', eliminar);

module.exports = router;