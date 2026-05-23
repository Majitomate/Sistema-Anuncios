import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';


const getAuthHeaders = () => {
  const token = localStorage.getItem('sutus_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// INTERCEPTOR GLOBAL DE SEGURIDAD
const verificarAutenticacion = (res) => {
  if (res.status === 401) {
    // Limpieza total del almacenamiento
    localStorage.clear();
    
    // Disparamos la alerta estilizada
    Swal.fire({
      title: '¡Sesión Expirada!',
      text: 'Tu sesión ha terminado por inactividad. Por seguridad, ingresa tus credenciales de nuevo.',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/login';
      }
    });
    
    throw new Error('Sesión expirada. Redirigiendo...');
  }
  return res;
};

export const obtenerAuditoria = async (id, token) => {
  try {
    const response = await fetch(`${API}/anuncios/${id}/auditoria`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    verificarAutenticacion(response);

    if (!response.ok) throw new Error('No se pudo obtener la auditoría del anuncio');
    return await response.json();
  } catch (error) {
    console.error('[Error obtenerAuditoria service]:', error);
    throw error;
  }
};

export const obtenerAnuncios = async () => {
  const res = await fetch(API, { headers: getAuthHeaders() });
  verificarAutenticacion(res);
  
  if (!res.ok) throw new Error('Error obteniendo anuncios');
  return res.json();
};

export const eliminarAnuncio = async (id) => {
  const res = await fetch(`${API}/anuncios/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  verificarAutenticacion(res);
  
  if (!res.ok) throw new Error('Error eliminando anuncio');
  return res.json();
};

export const crearAnuncio = async (payload) => {
  const res = await fetch(`${API}/anuncios`, { 
    method: 'POST', 
    headers: getAuthHeaders(), 
    body: payload 
  });
  verificarAutenticacion(res);
  
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
  const res = await fetch(`${API}/anuncios/${id}`, { 
    method: 'PUT', 
    headers: getAuthHeaders(), 
    body: payload 
  });
  verificarAutenticacion(res);
  
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
  const res = await fetch(`${API}/anuncios/${id}`, { headers: getAuthHeaders() });
  verificarAutenticacion(res);
  
  if (!res.ok) throw new Error('Error obtaining individual anuncio');
  return res.json();
};