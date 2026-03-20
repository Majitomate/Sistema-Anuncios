const express = require('express');
const multer = require('multer');
const { validarCreacionAnuncio } = require('../middlewares/validarAnuncio');
const {
  listar,
  crear,
  obtenerPorId,
  actualizar,
  eliminar
} = require('../controllers/anuncios.controller');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para crear anuncio
router.post(
  '/',
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'documento', maxCount: 1 },
  ]),
  validarCreacionAnuncio,
  crear,
);

// Ruta para obtener anuncios
router.get('/', listar);

// Ruta para obtener un anuncio
router.get('/:id', obtenerPorId);

// Ruta para editar un anuncio  
router.put(
  '/:id',
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'documento', maxCount: 1 }
  ]),
  validarCreacionAnuncio,
  actualizar
);

// Ruta para eliminar un anuncio
router.delete('/:id', eliminar);

module.exports = router;
