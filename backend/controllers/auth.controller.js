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

// Recuperación de Contraseña
export const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ mensaje: 'El correo electrónico es requerido.' });
    }

    const usuario = await obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'No existe ninguna cuenta registrada con este correo.' });
    }

    // Generación de Token para la recuperación - 15 minutos
    const tokenRecuperacion = jwt.sign(
      { id: usuario.id, tipo: 'recuperacion' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Simulador de correo en la consola del servidor backend para pruebas en desarrollo
    const enlace = `http://localhost:5173/reset-password?token=${tokenRecuperacion}`;
    console.log(`\n✉️ [SUTUS EMAIL SIMULATOR] Enlace generado para ${email}:\n${enlace}\n`);

    return res.status(200).json({ 
      mensaje: 'Proceso de recuperación iniciado. Revisa tu correo electrónico para continuar.',
      debug_link: enlace 
    });

  } catch (error) {
    console.error('Error en solicitarRecuperacion:', error);
    return res.status(500).json({ mensaje: 'Error interno al solicitar la recuperación.' });
  }
};

// ==========================================
// 3. RESTABLECER LA CONTRASEÑA CON EL TOKEN (PÚBLICO)
// ==========================================
export const restablecerPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ mensaje: 'El token y la nueva contraseña son requeridos.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // Validar y desencriptar el token temporal
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ mensaje: 'El enlace de recuperación es inválido o ha expirado.' });
    }

    // Validamos que sea un token de tipo recuperación y no un token normal de sesión
    if (decoded.tipo !== 'recuperacion') {
      return res.status(401).json({ mensaje: 'Token no autorizado para esta operación.' });
    }

    // Encriptar la nueva contraseña de forma segura
    const salt = await bcrypt.genSalt(10);
    const nuevoHash = await bcrypt.hash(password, salt);

    // Guardar los cambios reutilizando la función nativa que ya tenías en tu modelo
    await actualizarPasswordUsuario(decoded.id, nuevoHash);

    return res.status(200).json({ mensaje: 'Tu contraseña ha sido restablecida con éxito.' });

  } catch (error) {
    console.error('Error en restablecerPassword:', error);
    return res.status(500).json({ mensaje: 'Error interno al intentar cambiar la contraseña.' });
  }
};