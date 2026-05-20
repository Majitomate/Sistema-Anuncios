const API_URL = 'http://localhost:3001/usuarios';

const obtenerHeaders = () => {
  const token = localStorage.getItem('sutus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const obtenerUsuarios = async () => {
  const res = await fetch(API_URL, { headers: obtenerHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener usuarios');
  return data;
};

export const agregarUsuario = async (usuarioData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(usuarioData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
  return data;
};

export const actualizarUsuario = async (id, usuarioData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: obtenerHeaders(),
    body: JSON.stringify(usuarioData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
  return data;
};

export const eliminarUsuario = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: obtenerHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  return data;
};


export const actualizarPassword = async (passwordActual, passwordNueva) => {
    const token = localStorage.getItem('sutus_token');
    
    if (!token) {
        throw new Error('No estás autenticado');
    }

    const response = await fetch(`${API_URL}/cambiar-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ passwordActual, passwordNueva }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al cambiar la contraseña');
    }

    return data;
};