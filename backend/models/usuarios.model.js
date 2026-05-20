import pool from '../config/db.js';

// Listar todos los usuarios
export const obtenerUsuarios = async () => {
  const query = `
    SELECT id, nombre, email, rol
    FROM usuarios 
    ORDER BY id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Crear un nuevo usuario
export const agregarUsuario = async (datos, hashPassword) => {
  const query = `
    INSERT INTO usuarios (nombre, email, password, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, email, rol;
  `;
  const values = [datos.nombre, datos.email, hashPassword, datos.rol];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Editar un usuario
export const editarUsuario = async (id, datos) => {
  const query = `
    UPDATE usuarios 
    SET nombre = $1, email = $2, rol = $3
    WHERE id = $4
    RETURNING id, nombre, email, rol;
  `;
  const values = [datos.nombre, datos.email, datos.rol, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Eliminar un usuario
export const eliminarUsuario = async (id) => {
  const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rowCount;
};

// Verificar si un correo ya existe
export const verificarEmailExistente = async (email, excluirId = null) => {
  let query = 'SELECT id FROM usuarios WHERE email = $1';
  const values = [email];

  if (excluirId) {
    query += ' AND id <> $2';
    values.push(excluirId);
  }

  const result = await pool.query(query, values);
  return result.rows.length > 0;
};

// Obtener la contraseña actual del usuario
export const obtenerPasswordUsuario = async (id) => {
  const query = 'SELECT password FROM usuarios WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Actualizar la contraseña por el nuevo hash
export const actualizarPasswordUsuario = async (id, nuevoHash) => {
  const query = 'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id';
  const result = await pool.query(query, [nuevoHash, id]);
  return result.rows[0];
};