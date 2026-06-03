import express from 'express';
import { login, solicitarRecuperacion, restablecerPassword } from '../controllers/auth.controller.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);

export default router;