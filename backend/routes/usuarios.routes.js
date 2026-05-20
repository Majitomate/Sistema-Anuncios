import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    listarUsuarios,
    agregar,
    actualizar,
    eliminar,
    cambiarPassword
} from '../controllers/usuarios.controller.js';

const router = express.Router();

// ==========================================
// RUTAS PROTEGIDAS (Requieren token)
// ==========================================

router.use(verifyToken);
router.post('/cambiar-password', cambiarPassword);
router.get('/', listarUsuarios);
router.post('/', agregar);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

export default router;