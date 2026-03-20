import React, { useState, useCallback, useMemo } from 'react';
import Encabezado from '../components/Encabezado.jsx';
import CuadriculaTarjetas from '../components/CuadriculaTarjetas.jsx';
import CrearAnuncio from '../pages/CrearAnuncio.jsx';
import EditarAnuncio from '../pages/EditarAnuncio.jsx';
import ModalDocumento from '../components/ModalDocumento.jsx';
import styles from '../styles/dashboard.module.css';
import { useAnuncios } from '../hooks/useAnuncios';

const bufferToUrl = (bufferObj, mimeType) => {
  if (!bufferObj || !bufferObj.data) return null;
  const bytes = new Uint8Array(bufferObj.data);
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
};

const DashboardLayout = ({ anuncios, onAnuncioCreado }) => {
  const { removeAnuncio } = useAnuncios();

  const [vista, setVista] = useState(null);       // null | 'crear' | 'editar'
  const [anuncioAEditar, setAnuncioAEditar] = useState(null);
  const [vistaActual, setVistaActual] = useState('cuadricula');
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const [documentoAbierto, setDocumentoAbierto] = useState(null);

  /* ── Callbacks ────────────────────────────────────────────────────────── */
  const handleCerrar = useCallback(() => {
    setVista(null);
    setAnuncioAEditar(null);
  }, []);

  const handleGuardado = useCallback(() => {
    handleCerrar();
    onAnuncioCreado();          // refresca la lista en App.jsx
  }, [handleCerrar, onAnuncioCreado]);

  const handleEditarClick = useCallback((anuncio) => {
    setAnuncioAEditar(anuncio);
    setVista('editar');
  }, []);

  const handleEliminar = useCallback(async (id) => {
    if (!window.confirm('¿Deseas eliminar este anuncio?')) return;
    try {
      await removeAnuncio(id);
      onAnuncioCreado();         // refresca tras eliminar
    } catch {
      alert('Error al eliminar el anuncio');
    }
  }, [removeAnuncio, onAnuncioCreado]);

  /* ── Carrusel ─────────────────────────────────────────────────────────── */
  const anunciosCarrusel = useMemo(
    () => anuncios.filter((a) => a.estado).slice(0, 5),
    [anuncios],
  );

  const sigAnuncio = () =>
    setIndiceCarrusel((p) => (p + 1) % anunciosCarrusel.length);
  const antAnuncio = () =>
    setIndiceCarrusel((p) => (p - 1 + anunciosCarrusel.length) % anunciosCarrusel.length);

  /* ── Vistas de formulario ─────────────────────────────────────────────── */
  if (vista === 'crear') {
    return (
      <CrearAnuncio
        alCerrar={handleCerrar}
        alCrear={handleGuardado}
      />
    );
  }

  if (vista === 'editar' && anuncioAEditar) {
    return (
      <EditarAnuncio
        anuncio={anuncioAEditar}
        alCerrar={handleCerrar}
        onActualizado={handleGuardado}
      />
    );
  }

  /* ── Dashboard principal ──────────────────────────────────────────────── */
  const anunciosActivos = anuncios.filter((a) => a.estado);
  const itemCarrusel = anunciosCarrusel[indiceCarrusel];

  return (
    <div className={styles.dashboardLayout}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <span className={styles.navbarTitle}>Dashboard de Anuncios SUTUS</span>
        <div className={styles.navbarActions}>
          <button
            type="button"
            className={styles.navbarActionButton}
            onClick={() => setVista('crear')}
          >
            + Nuevo Anuncio
          </button>
          <div className={styles.viewSwitcher}>
            <button
              className={`${styles.switchBtn} ${vistaActual === 'cuadricula' ? styles.active : ''}`}
              onClick={() => setVistaActual('cuadricula')}
            >
              🔲 Grid
            </button>
            <button
              className={`${styles.switchBtn} ${vistaActual === 'lista' ? styles.active : ''}`}
              onClick={() => setVistaActual('lista')}
            >
              📄 Lista
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>

        {/* Carrusel */}
        {anunciosCarrusel.length > 0 && itemCarrusel && (
          <section
            className={styles.carouselContainer}
            style={
              itemCarrusel.imagen
                ? { backgroundImage: `url(${bufferToUrl(itemCarrusel.imagen, itemCarrusel.imagen_tipo)})` }
                : undefined
            }
          >
            <button className={styles.carouselNavBtnAnt} onClick={antAnuncio}>‹</button>

            <div className={styles.carouselContent}>
              <div className={styles.carouselItem} key={itemCarrusel.id}>
                <div className={styles.carouselText}>
                  <span className={styles.previsualizacionLabel}>PREVISUALIZACIÓN DE ANUNCIOS</span>
                  <h2>{itemCarrusel.titulo}</h2>
                  <p>{itemCarrusel.subtitulo}</p>
                </div>
                {!itemCarrusel.imagen && (
                  <div className={styles.carouselImageArea}>
                    <div className={styles.noImagePlaceholder}>Sin Imagen</div>
                  </div>
                )}
              </div>
            </div>

            <button className={styles.carouselNavBtnSig} onClick={sigAnuncio}>›</button>

            <div className={styles.carouselDots}>
              {anunciosCarrusel.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.carouselDot} ${i === indiceCarrusel ? styles.carouselDotActive : ''}`}
                  onClick={() => setIndiceCarrusel(i)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Métricas */}
        <Encabezado
          activos={anunciosActivos.length}
          total={anuncios.length}
          pantallas={1}
          ultimaActualizacion={new Date().toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />

        {/* Vista Grid / Lista */}
        <div style={{ marginTop: '24px' }}>
          {vistaActual === 'cuadricula' ? (
            <CuadriculaTarjetas
              anuncios={anuncios}
              onEditar={handleEditarClick}
              onEliminar={handleEliminar}
              onAbrirDocumento={setDocumentoAbierto}
            />
          ) : (
            <div className={styles.announcementsTableContainer}>
              <h3 className={styles.listaTitle}>Gestión Detallada de Anuncios</h3>
              <table className={styles.announcementsTable}>
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
                      <td className={styles.tdTitulo}>{anuncio.titulo}</td>
                      <td><span className={styles.badgeTipoTable}>{anuncio.tipo}</span></td>
                      <td>{anuncio.prioridad}</td>
                      <td className={anuncio.estado ? styles.statusOnTable : styles.statusOffTable}>
                        {anuncio.estado ? 'Activo' : 'Inactivo'}
                      </td>
                      <td>
                        <div className={styles.accionesGroupTable}>
                          <button
                            className={styles.btnEditTable}
                            onClick={() => handleEditarClick(anuncio)}
                          >
                            ✎ Editar
                          </button>
                          <button
                            className={styles.btnDeleteTable}
                            onClick={() => handleEliminar(anuncio.id)}
                          >
                            🗑 Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal documento */}
      <ModalDocumento
        urlDocumento={documentoAbierto}
        alCerrar={() => setDocumentoAbierto(null)}
      />

    </div>
  );
};

export default DashboardLayout;