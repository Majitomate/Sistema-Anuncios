import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { obtenerUsuarioPorEmail, actualizarPasswordUsuario } from '../models/usuarios.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sutus';

// Inicio de Sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await obtenerUsuarioPorEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar JWT estándar de sesión
    const token = jwt.sign(
      { id: user.id, rol: user.rol }, 
      JWT_SECRET,
      { expiresIn: '8h' } 
    );

    return res.status(200).json({
      message: 'Autenticación exitosa',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};