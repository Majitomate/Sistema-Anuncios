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
  if (!res.ok) throw new Error('Error creando anuncio');
  return res.json();
};

export const editarAnuncio = async (id, payload) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: payload });
  if (!res.ok) throw new Error('Error editando anuncio');
  return res.json();
};

// Añade esto al final de tu archivo src/services/anuncios.services.js
export const obtenerAnuncioPorId = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error obteniendo anuncio individual');
  return res.json();
};