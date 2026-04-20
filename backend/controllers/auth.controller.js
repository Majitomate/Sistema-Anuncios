import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sutus';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // 1. Buscar usuario en PostgreSQL
    const userQuery = 'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = $1';
    const { rows } = await pool.query(userQuery, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol }, // Payload
      JWT_SECRET,
      { expiresIn: '8h' } // Expiración estándar
    );

    // 4. Responder (sin enviar el password de vuelta)
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