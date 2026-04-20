import express from 'express';
import multer from 'multer';
import { validarCreacionAnuncio, validarEdicionAnuncio } from '../middlewares/validarAnuncio.js';
import { verifyToken } from '../middlewares/auth.js'; // Importamos el middleware de JWT
import {
  listar,
  listarKiosco,
  crear,
  obtenerPorId,
  descargarImagen,
  descargarDocumento,
  actualizar,
  eliminar,
} from '../controllers/anuncios.controller.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const archivos = upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'documento', maxCount: 1 },
]);

// ==========================================
// RUTAS PÚBLICAS (No requieren token)
// ==========================================

// Kiosco (Solo activos, ordenados por prioridad)
// IMPORTANTE: Definir rutas estáticas antes que las dinámicas (/:id)
router.get('/kiosco', listarKiosco);

// Descargar imagen / documento (Usualmente público para que funcione en etiquetas <img> o <iframe>)
router.get('/:id/imagen', descargarImagen);
router.get('/:id/documento', descargarDocumento);


// ==========================================
// RUTAS PROTEGIDAS (Requieren token)
// ==========================================

// Aplicamos el middleware a todas las rutas que se definan debajo de esta línea
router.use(verifyToken);

// Obtener todos los anuncios (Dashboard)
router.get('/', listar);

// Obtener un anuncio por id
router.get('/:id', obtenerPorId);

// Crear anuncio
router.post('/', archivos, validarCreacionAnuncio, crear);

// Editar anuncio
router.put('/:id', archivos, validarEdicionAnuncio, actualizar);

// Eliminar anuncio
router.delete('/:id', eliminar);

export default router;