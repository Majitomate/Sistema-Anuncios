import pool from '../config/db.js';

// Obtener la contraseña actual del usuario
export const obtenerPasswordUsuario = async (id) => {
  const query = 'SELECT password FROM usuarios WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0]; // Retorna { password: '...' } o undefined
};

// Actualizar la contraseña por el nuevo hash
export const actualizarPasswordUsuario = async (id, nuevoHash) => {
  const query = 'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id';
  const result = await pool.query(query, [nuevoHash, id]);
  return result.rows[0];
};