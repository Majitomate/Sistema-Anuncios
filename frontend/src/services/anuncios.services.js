const API_URL = 'http://localhost:3001/anuncios';

export const obtenerAnuncios = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error obteniendo anuncios');
  return res.json();
};

export const eliminarAnuncio = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error eliminando anuncio');
  return res.json();
};

export const crearAnuncio = async (payload) => {
  const res = await fetch(API_URL, { method: 'POST', body: payload });
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
  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: payload });
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
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error obteniendo anuncio individual');
  return res.json();
};