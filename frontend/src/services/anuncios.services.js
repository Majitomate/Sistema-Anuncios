const API_URL = 'http://localhost:3001/anuncios';

// Función para inyectar el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('sutus_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const obtenerAuditoria = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/${id}/auditoria`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('No se pudo obtener la auditoría del anuncio');
    }

    return await response.json();
  } catch (error) {
    console.error('[Error obtenerAuditoria service]:', error);
    throw error;
  }
};

export const obtenerAnuncios = async () => {
  // Token por si hay anuncios que solo el admin puede ver
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error obteniendo anuncios');
  return res.json();
};

export const eliminarAnuncio = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeaders() // Token
  });
  if (!res.ok) throw new Error('Error eliminando anuncio');
  return res.json();
};

export const crearAnuncio = async (payload) => {
  const res = await fetch(API_URL, { 
    method: 'POST', 
    headers: getAuthHeaders(), // Token
    body: payload 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (errorData.errores && Array.isArray(errorData.errores)) {
      const mensajes = errorData.errores.map(err => err.msg).join('\n');
      throw new Error(mensajes);
    }
    throw new Error('Error creando anuncio');
  }
  return res.json();
};

export const editarAnuncio = async (id, payload) => {
  const res = await fetch(`${API_URL}/${id}`, { 
    method: 'PUT', 
    headers: getAuthHeaders(), // Token
    body: payload 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (errorData.errores && Array.isArray(errorData.errores)) {
      const mensajes = errorData.errores.map(err => err.msg).join('\n');
      throw new Error(mensajes);
    }
    throw new Error('Error editando anuncio');
  }
  return res.json();
};

export const obtenerAnuncioPorId = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error obteniendo anuncio individual');
  return res.json();
};