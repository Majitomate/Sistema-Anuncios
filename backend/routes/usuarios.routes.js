import express from 'express';
import { verifyToken } from '../middlewares/auth.js'; 
import { cambiarPassword } from '../controllers/usuarios.controller.js';

const router = express.Router();

// ==========================================
// RUTAS PROTEGIDAS (Requieren token)
// ==========================================

router.use(verifyToken);
router.post('/cambiar-password', cambiarPassword);

export default router;