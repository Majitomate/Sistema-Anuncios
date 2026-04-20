import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sutus';

export const verifyToken = (req, res, next) => {
  // Extraer token del header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No se proporcionó un token válido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar decodificación
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guardamos el payload (id, rol) para el siguiente paso
    
    return next(); // Pasa al siguiente controlador
  } catch (error) {
    return res.status(401).json({ message: 'Token expirado o inválido' });
  }
};