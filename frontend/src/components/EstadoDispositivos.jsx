import { useState, useEffect } from 'react';
import s from '../styles/EstadoDispositivos.module.css';

const API = 'http://localhost:3001';

const EstadoDispositivos = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    cargarEstado();
    
    if (autoRefresh) {
      const intervalo = setInterval(cargarEstado, 10000); // Refresh cada 10 segundos
      return () => clearInterval(intervalo);
    }
  }, [autoRefresh]);

  const cargarEstado = async () => {
    try {
      const token = localStorage.getItem('sutus_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Obtener estado de dispositivos
      const resDispositivos = await fetch(`${API}/dispositivos/estado`, { headers });
      if (resDispositivos.ok) {
        setDispositivos(await resDispositivos.json());
      }

      // Obtener estadísticas
      const resEstadisticas = await fetch(`${API}/dispositivos/estadisticas`, { headers });
      if (resEstadisticas.ok) {
        setEstadisticas(await resEstadisticas.json());
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearTiempo = (fecha) => {
    if (!fecha) return 'Desconocida';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatearDiferencia = (segundos) => {
    if (!segundos) return 'Hace poco';
    if (segundos < 60) return 'Hace unos segundos';
    if (segundos < 3600) return `Hace ${Math.floor(segundos / 60)} min`;
    if (segundos < 86400) return `Hace ${Math.floor(segundos / 3600)} horas`;
    return `Hace ${Math.floor(segundos / 86400)} días`;
  };

  const obtenerClaseEstado = (estado, segundosSinConexion) => {
    if (estado === 'conectado') return 'conectado';
    if (segundosSinConexion > 600) return 'critico'; // Rojo si lleva más de 10 min sin conexión
    return 'desconectado';
  };

  if (loading) return <div className={s.container}>Cargando...</div>;

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2>Estado de Dispositivos (Kioscos)</h2>
        <div className={s.controles}>
          <label>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-actualizar (10s)
          </label>
          <button onClick={cargarEstado} className={s.btnRefresh}>
            🔄 Actualizar ahora
          </button>
        </div>
      </div>

      {error && <div className={s.error}>Error: {error}</div>}

      {estadisticas && (
        <div className={s.estadisticas}>
          <div className={s.stat}>
            <span className={s.label}>Total Dispositivos</span>
            <span className={s.valor}>{estadisticas.total_dispositivos}</span>
          </div>
          <div className={`${s.stat} ${s.conectados}`}>
            <span className={s.label}>Conectados</span>
            <span className={s.valor}>{estadisticas.dispositivos_conectados}</span>
          </div>
          <div className={`${s.stat} ${s.desconectados}`}>
            <span className={s.label}>Desconectados</span>
            <span className={s.valor}>{estadisticas.dispositivos_desconectados}</span>
          </div>
        </div>
      )}

      {dispositivos.length === 0 ? (
        <div className={s.vacio}>
          <p>No hay dispositivos registrados</p>
        </div>
      ) : (
        <div className={s.tabla}>
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Identificador</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Última Conexión</th>
                <th>Tiempo Sin Conexión</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((d) => (
                <tr key={d.id} className={s[obtenerClaseEstado(d.estado_conexion, d.segundos_sin_conexion)]}>
                  <td>
                    <span className={`${s.badge} ${s[d.estado_conexion]}`}>
                      {d.estado_conexion === 'conectado' ? '● Conectado' : '○ Desconectado'}
                    </span>
                  </td>
                  <td className={s.monospace}>{d.identificador.slice(-12)}</td>
                  <td>{d.nombre}</td>
                  <td>{d.ubicacion}</td>
                  <td>{formatearTiempo(d.ultima_conexion)}</td>
                  <td>{formatearDiferencia(d.segundos_sin_conexion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={s.footer}>
        <small>
          Última actualización: {new Date().toLocaleTimeString('es-MX')}
        </small>
      </div>
    </div>
  );
};

export default EstadoDispositivos;
