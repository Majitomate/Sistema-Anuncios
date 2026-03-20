const express = require('express');
const multer = require('multer');
const { validarCreacionAnuncio } = require('../middlewares/validarAnuncio');
const { listar, crear, obtenerPorId, actualizar } = require('../controllers/anuncios.controller');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'documento', maxCount: 1 },
  ]),
  validarCreacionAnuncio,
  crear,
);

router.get('/', listar);

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

module.exports = router;
