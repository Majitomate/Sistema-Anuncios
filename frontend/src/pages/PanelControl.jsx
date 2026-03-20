import React, { useEffect, useState } from 'react';
import Encabezado from '../components/Encabezado.jsx';
import CrearAnuncio from './CrearAnuncio.jsx';
import EditarAnuncio from './EditarAnuncio.jsx';
import styles from '../styles/dashboard.module.css';
import '../styles/PanelControl.css';
import { useAnuncios } from '../hooks/useAnuncios';

const PRIORIDAD_LABELS = { 1: 'Baja', 2: 'Media', 3: 'Alta' };

const PanelControl = ({ onRegresar }) => {
  const {
    anuncios,
    loading,
    error,
    fetchAnuncios,
    removeAnuncio,
  } = useAnuncios();

  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [anuncioEditar, setAnuncioEditar] = useState(null);

  useEffect(() => {
    fetchAnuncios();
  }, [fetchAnuncios]);

  const anunciosActivos = anuncios.filter((a) => a.estado);

  const handleEliminar = async (id) => {
    if (window.confirm('¿Deseas eliminar este anuncio?')) {
      try {
        await removeAnuncio(id);
      } catch (err) {
        alert('Error eliminando anuncio');
      }
    }
  };

  if (loading) return <p>Cargando anuncios...</p>;
  if (error) return <p>Error: {error}</p>;

  if (mostrarCrear) {
    return (
      <CrearAnuncio
        alCerrar={() => setMostrarCrear(false)}
        alCrear={fetchAnuncios}
      />
    );
  }

  if (anuncioEditar) {
    return (
      <EditarAnuncio
        anuncio={anuncioEditar}
        alCerrar={() => setAnuncioEditar(null)}
        onActualizado={fetchAnuncios}
      />
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      <nav className={styles.navbar}>
        <div className={styles.navbarTitleGroup}>
          <button
            type="button"
            className={styles.backButtonSimple}
            onClick={onRegresar}
          >
            ←
          </button>
          <span className={styles.navbarTitle}>Panel de Control</span>
        </div>

        <div className={styles.navbarActions}>
          <button
            type="button"
            className={styles.navbarActionButton}
            onClick={() => setMostrarCrear(true)}
          >
            + Nuevo Anuncio
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <Encabezado
          activos={anunciosActivos.length}
          total={anuncios.length}
          pantallas={4}
          ultimaActualizacion={new Date().toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />

        <section className="gestion-container">
          <h2 className="gestion-title">Gestión de Anuncios</h2>
          <div className="tabla-scroll">
            <table className="tabla-gestion">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {anuncios.map((anuncio) => (
                  <tr key={anuncio.id}>
                    <td className="td-titulo">{anuncio.titulo}</td>
                    <td><span className="badge-tipo">{anuncio.tipo}</span></td>
                    <td>
                      <span className={`badge-prioridad ${PRIORIDAD_LABELS[anuncio.prioridad]}`}>
                        {PRIORIDAD_LABELS[anuncio.prioridad]}
                      </span>
                    </td>
                    <td>
                      <span className={anuncio.estado ? 'status-on' : 'status-off'}>
                        {anuncio.estado ? '● En pantalla' : '○ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="acciones-group">
                        <button
                          className="btn-edit"
                          onClick={() => setAnuncioEditar(anuncio)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleEliminar(anuncio.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PanelControl;
