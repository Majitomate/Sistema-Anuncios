import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const obtenerHeaders = () => {
  const token = localStorage.getItem('sutus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// INTERCEPTOR GLOBAL DE SEGURIDAD CON SWEETALERT2
const verificarAutenticacion = (res) => {
  if (res.status === 401) {
    // Limpiamos las variables de sesión del Administrador
    localStorage.removeItem('sutus_token');
    localStorage.removeItem('sutus_rol');
    localStorage.removeItem('sutus_nombre');
    localStorage.removeItem('sutus_email');
    
    // Mostramos el modal estético y esperamos el clic para redirigir
    Swal.fire({
      title: '¡Sesión Expirada!',
      text: 'Tu sesión ha terminado por inactividad. Por seguridad, ingresa tus credenciales de nuevo.',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false, // Evita que cierren el modal dando clic afuera
      allowEscapeKey: false     // Evita que lo cierren con la tecla Escape
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/login';
      }
    });
    
    throw new Error('Sesión expirada. Redirigiendo...');
  }
  return res;
};

export const obtenerUsuarios = async () => {
  const res = await fetch(`${API}/usuarios`, { headers: obtenerHeaders() });
  verificarAutenticacion(res); 
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener usuarios');
  return data;
};

export const agregarUsuario = async (usuarioData) => {
  const res = await fetch(`${API}/usuarios`, {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(usuarioData),
  });
  verificarAutenticacion(res); 
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
  return data;
};

export const actualizarUsuario = async (id, usuarioData) => {
  const res = await fetch(`${API}/usuarios/${id}`, {
    method: 'PUT',
    headers: obtenerHeaders(),
    body: JSON.stringify(usuarioData),
  });
  verificarAutenticacion(res); 
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
  return data;
};

export const eliminarUsuario = async (id) => {
  const res = await fetch(`${API}/usuarios/${id}`, {
    method: 'DELETE',
    headers: obtenerHeaders(),
  });
  verificarAutenticacion(res); 
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  return data;
};

export const obtenerUsuarioActivo = async () => {
  const res = await fetch(`${API}/usuarios/me`, { headers: obtenerHeaders() });
  verificarAutenticacion(res); 
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener usuario activo');
  return data;
};

export const actualizarPassword = async (passwordActual, passwordNueva) => {
    const token = localStorage.getItem('sutus_token');
    if (!token) throw new Error('No estás autenticado');

    const res = await fetch(`${API}/cambiar-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ passwordActual, passwordNueva }),
    });
    verificarAutenticacion(res); 

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al cambiar la contraseña');
    return data;
};