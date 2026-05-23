import { useState, useEffect } from 'react';
import s from '../styles/EstadoDispositivos.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const EstadoDispositivos = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    cargarEstado();

    if (autoRefresh) {
      const intervalo = setInterval(cargarEstado, 10000);
      return () => clearInterval(intervalo);
    }
  }, [autoRefresh]);

  const cargarEstado = async () => {
    try {
      const token = localStorage.getItem('sutus_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const resDispositivos = await fetch(`${API}/dispositivos/estado`, { headers });
      if (resDispositivos.ok) setDispositivos(await resDispositivos.json());

      const resEstadisticas = await fetch(`${API}/dispositivos/estadisticas`, { headers });
      if (resEstadisticas.ok) setEstadisticas(await resEstadisticas.json());

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearTiempo = (fecha) => {
    if (!fecha) return 'Desconocida';
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const formatearDiferencia = (segundos) => {
    if (!segundos)        return 'Hace poco';
    if (segundos < 60)    return 'Hace unos segundos';
    if (segundos < 3600)  return `Hace ${Math.floor(segundos / 60)} min`;
    if (segundos < 86400) return `Hace ${Math.floor(segundos / 3600)} h`;
    return `Hace ${Math.floor(segundos / 86400)} días`;
  };

  const obtenerClaseEstado = (estado, segundosSinConexion) => {
    if (estado === 'conectado') return 'conectado';
    if (segundosSinConexion > 600) return 'critico';
    return 'desconectado';
  };

  if (loading) {
    return (
      <div className={s.container}>
        <div className={s.loadingWrap}>
          <div className={s.spinner} />
          <span>Cargando dispositivos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>

      {/* ── Cabecera ── */}
      <div className={s.header}>
        <h2>Estado de Dispositivos · Kioscos</h2>
        <div className={s.controles}>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-actualizar (10 s)
          </label>
          <button onClick={cargarEstado} className={s.btnRefresh}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <div className={s.error}>⚠ {error}</div>}

      {/* ── Estadísticas ── */}
      {estadisticas && (
        <div className={s.estadisticas}>
          <div className={`${s.stat} ${s.total}`}>
            <div className={s.statAccent} />
            <div className={s.statBody}>
              <span className={s.label}>Total</span>
              <span className={s.valor}>{estadisticas.total_dispositivos}</span>
            </div>
          </div>

          <div className={`${s.stat} ${s.conectados}`}>
            <div className={s.statAccent} />
            <div className={s.statBody}>
              <span className={s.label}>Conectados</span>
              <span className={s.valor}>{estadisticas.dispositivos_conectados}</span>
            </div>
          </div>

          <div className={`${s.stat} ${s.desconectados}`}>
            <div className={s.statAccent} />
            <div className={s.statBody}>
              <span className={s.label}>Desconectados</span>
              <span className={s.valor}>{estadisticas.dispositivos_desconectados}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
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
                <th>Sin Conexión</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((d) => (
                <tr
                  key={d.id}
                  className={s[obtenerClaseEstado(d.estado_conexion, d.segundos_sin_conexion)]}
                >
                  <td>
                    <span className={`${s.badge} ${s[d.estado_conexion]}`}>
                      {d.estado_conexion === 'conectado' ? '● Conectado' : '○ Desconectado'}
                    </span>
                  </td>
                  <td>
                    <span className={s.monospace}>{d.identificador.slice(-12)}</span>
                  </td>
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

      {/* ── Footer ── */}
      <div className={s.footer}>
        <small>Última actualización: {new Date().toLocaleTimeString('es-MX')}</small>
      </div>
    </div>
  );
};

export default EstadoDispositivos;