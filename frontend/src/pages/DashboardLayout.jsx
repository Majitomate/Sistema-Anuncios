import React, { useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import Encabezado from '../components/Encabezado.jsx';
import CuadriculaTarjetas from '../components/CuadriculaTarjetas.jsx';
import CrearAnuncio from '../pages/CrearAnuncio.jsx';
import EditarAnuncio from '../pages/EditarAnuncio.jsx';
import ModalDocumento from '../components/ModalDocumento.jsx';
import ModalVerAnuncio from '../components/ModalVerAnuncio.jsx';
import BotonEstado from '../components/BotonEstado.jsx';
import styles from '../styles/dashboard.module.css';
import { useAnuncios } from '../hooks/useAnuncios';

const bufferToUrl = (bufferObj, mimeType) => {
  if (!bufferObj || !bufferObj.data) return null;
  const bytes = new Uint8Array(bufferObj.data);
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
};

const DashboardLayout = ({ anuncios, onAnuncioCreado, rolUsuario, loading }) => {
  const { removeAnuncio, updateAnuncio } = useAnuncios();

  const puedeEditar = rolUsuario === 'editor' || rolUsuario === 'revisor';

  const [vista, setVista] = useState(null);       
  const [anuncioAEditar, setAnuncioAEditar] = useState(null);
  const [anuncioVer, setAnuncioVer] = useState(null);
  const [vistaActual, setVistaActual] = useState('cuadricula');
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const [documentoAbierto, setDocumentoAbierto] = useState(null);

  const obtenerUrlImagen = useCallback((anuncio) => {
    if (anuncio.imagen && anuncio.imagen.data) {
      return bufferToUrl(anuncio.imagen, anuncio.imagen_tipo);
    }
    return `http://localhost:3001/anuncios/${anuncio.id}/imagen`;
  }, []);

  const handleCerrar = useCallback(() => {
    setVista(null);
    setAnuncioAEditar(null);
  }, []);

  const handleGuardado = useCallback(() => {
    handleCerrar();
    if (onAnuncioCreado) onAnuncioCreado(); 
  }, [handleCerrar, onAnuncioCreado]);

  const handleEditarClick = useCallback((anuncio) => {
    setAnuncioAEditar(anuncio);
    setVista('editar');
  }, []);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await removeAnuncio(id); 
        if (onAnuncioCreado) onAnuncioCreado(); 
        Swal.fire({ title: '¡Eliminado!', text: 'El anuncio ha sido eliminado.', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ title: 'Error', text: 'Hubo un problema al eliminar.', icon: 'error' });
      }
    }
  };

  const handleToggleEstado = useCallback(async (id, nuevoEstado) => {
    if (!puedeEditar) {
      return Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para cambiar el estado de un anuncio.' });
    }

    try {
      const anuncio = anuncios.find((a) => a.id === id);
      if (!anuncio) return;

      const payload = new FormData();
      payload.append('estado', nuevoEstado);
      payload.append('titulo', anuncio.titulo);
      payload.append('subtitulo', anuncio.subtitulo);
      payload.append('contenido', anuncio.contenido);
      payload.append('tipo', anuncio.tipo);
      payload.append('prioridad', anuncio.prioridad);
      payload.append('esPermanente', anuncio.es_permanente); 

      if (!anuncio.es_permanente) {
        if (anuncio.fecha_inicio) payload.append('fechaInicio', anuncio.fecha_inicio);
        if (anuncio.fecha_fin) payload.append('fechaFin', anuncio.fecha_fin);
      }

      await updateAnuncio(id, payload);
      if (onAnuncioCreado) onAnuncioCreado();
    } catch {
      alert('Error al cambiar el estado');
    }
  }, [anuncios, onAnuncioCreado, updateAnuncio, puedeEditar]);

  const anunciosCarrusel = useMemo(() => anuncios.filter((a) => a.estado).slice(0, 5), [anuncios]);
  const sigAnuncio = () => setIndiceCarrusel((p) => (p + 1) % anunciosCarrusel.length);
  const antAnuncio = () => setIndiceCarrusel((p) => (p - 1 + anunciosCarrusel.length) % anunciosCarrusel.length);

  if (vista === 'crear') return <CrearAnuncio alCerrar={handleCerrar} onActualizado={handleGuardado} />;
  if (vista === 'editar' && anuncioAEditar) return <EditarAnuncio anuncio={anuncioAEditar} alCerrar={handleCerrar} onActualizado={handleGuardado} />;

  const anunciosActivos = anuncios.filter((a) => a.estado);
  const itemCarrusel = anunciosCarrusel[indiceCarrusel];

  return (
    <div className={styles.dashboardLayout}>
      <nav className={styles.navbar}>
        <div className={styles.navbarTitleGroup}>
          <img src="/logo-sutus.svg" alt="SUTUS" className={styles.navbarLogo} />
          <span className={styles.navbarTitle}>Dashboard de Anuncios SUTUS</span>
        </div>
        <div className={styles.navbarActions}>
            
          {puedeEditar && (
            <button type="button" className={styles.navbarActionButton} onClick={() => setVista('crear')}>
              + Nuevo Anuncio
            </button>
          )}

          <div className={styles.viewSwitcher}>
            <button className={`${styles.switchBtn} ${vistaActual === 'cuadricula' ? styles.active : ''}`} onClick={() => setVistaActual('cuadricula')}>🔲 Tarjetas</button>
            <button className={`${styles.switchBtn} ${vistaActual === 'lista' ? styles.active : ''}`} onClick={() => setVistaActual('lista')}>📄 Lista</button>
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        
        {/* Solo mostramos el carrusel si hay anuncios y no está cargando */}
        {!loading && anunciosCarrusel.length > 0 && itemCarrusel && (
          <section className={styles.carouselContainer} style={itemCarrusel.imagen_tipo ? { backgroundImage: `url(${obtenerUrlImagen(itemCarrusel)})` } : undefined}>
            <button className={styles.carouselNavBtnAnt} onClick={antAnuncio}>‹</button>
            <div className={styles.carouselContent}>
              <div className={styles.carouselItem} key={itemCarrusel.id}>
                <div className={styles.carouselText}>
                  <span className={styles.previsualizacionLabel}>PREVISUALIZACIÓN DE ANUNCIOS</span>
                  <h2>{itemCarrusel.titulo}</h2>
                  <p>{itemCarrusel.subtitulo}</p>
                </div>
                <div className={styles.carouselImageArea}>
                  {itemCarrusel.imagen_tipo ? (
                    <img src={obtenerUrlImagen(itemCarrusel)} alt={itemCarrusel.titulo} className={styles.carouselImage} />
                  ) : (
                    <div className={styles.noImagePlaceholder}><span>📄</span><p>Sin Imagen</p></div>
                  )}
                </div>
              </div>
            </div>
            <button className={styles.carouselNavBtnSig} onClick={sigAnuncio}>›</button>
            <div className={styles.carouselDots}>
              {anunciosCarrusel.map((_, i) => (
                <button key={i} className={`${styles.carouselDot} ${i === indiceCarrusel ? styles.carouselDotActive : ''}`} onClick={() => setIndiceCarrusel(i)} />
              ))}
            </div>
          </section>
        )}

        <Encabezado activos={anunciosActivos.length} total={anuncios.length} pantallas={1} ultimaActualizacion={new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} />

        {/* Contenido principal — carga, grid o lista */}
        <div style={{ marginTop: '24px' }}>
          {loading && anuncios.length === 0 ? (

            /* ── Cargando ── */
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Cargando anuncios...</p>
            </div>

          ) : vistaActual === 'cuadricula' ? (

            /* ── Vista grid ── */
            anuncios.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9eaa9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <p className={styles.emptyStateTitle}>No hay anuncios todavía</p>
                <p className={styles.emptyStateSub}>
                  Crea tu primer anuncio para que aparezca aquí y en las pantallas del sindicato.
                </p>
                {puedeEditar && (
                  <button type="button" className={styles.emptyStateBtn} onClick={() => setVista('crear')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Crear primer anuncio
                  </button>
                )}
              </div>
            ) : (
              <CuadriculaTarjetas
                anuncios={anuncios}
                onEditar={handleEditarClick}
                onEliminar={handleEliminar}
                onAbrirDocumento={setDocumentoAbierto}
                puedeEditar={puedeEditar}
              />
            )

          ) : (

            /* ── Vista lista ── */
            <div className={styles.announcementsTableContainer}>
              <div className={styles.listaTitleRow}>
                <h3 className={styles.listaTitle}>Gestión de Anuncios</h3>
                <span className={styles.listaContador}>{anuncios.length} anuncios</span>
              </div>
              <table className={styles.announcementsTable}>
                <thead>
                  <tr>
                    <th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {anuncios.length === 0 ? (
                    <tr className={styles.emptyTableRow}>
                      <td colSpan={5}>
                        <div className={styles.emptyTableCell}>
                          <div className={styles.emptyTableIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#9eaa9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <path d="M3 9h18M9 21V9"/>
                            </svg>
                          </div>
                          <p className={styles.emptyTableTitle}>La lista está vacía</p>
                          <p className={styles.emptyTableSub}>
                            {puedeEditar
                              ? 'Usa el botón "+ Nuevo Anuncio" para agregar el primero.'
                              : 'Aún no hay anuncios publicados.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    anuncios.map((anuncio) => {
                      const tipoClase = { general: styles.tipoGeneral, evento: styles.tipoEvento, convocatoria: styles.tipoConvocatoria, votacion: styles.tipoVotacion, resultado: styles.tipoResultado }[anuncio.tipo] ?? '';
                      const prioClase = { 3: styles.prioAlta, 2: styles.prioMedia, 1: styles.prioBaja }[anuncio.prioridad] ?? styles.prioMedia;
                      const prioLabel = { 3: 'Alta', 2: 'Media', 1: 'Baja' }[anuncio.prioridad] ?? 'Media';
                      const tipoLabel = anuncio.tipo ? anuncio.tipo.charAt(0).toUpperCase() + anuncio.tipo.slice(1) : '—';

                      return (
                        <tr key={anuncio.id}>
                          <td>
                            <div className={styles.tdTitulo}>{anuncio.titulo}</div>
                            {anuncio.subtitulo && <div className={styles.tdSubtitulo}>{anuncio.subtitulo}</div>}
                          </td>
                          <td><span className={`${styles.badgeTipoTable} ${tipoClase}`}>{tipoLabel}</span></td>
                          <td><span className={`${styles.badgePrioTable} ${prioClase}`}>{prioLabel}</span></td>
                          <td>
                            <BotonEstado id={anuncio.id} estado={anuncio.estado} onToggle={handleToggleEstado} disabled={!puedeEditar} />
                          </td>
                          <td>
                            <div className={styles.accionesGroupTable}>
                              <button className={styles.btnVer} onClick={() => setAnuncioVer(anuncio)}>👁 Ver</button>
                              {puedeEditar && (
                                <>
                                  <button className={styles.btnEditTable} onClick={() => handleEditarClick(anuncio)}>✎ Editar</button>
                                  <button className={styles.btnDeleteTable} onClick={() => handleEliminar(anuncio.id)}>🗑 Eliminar</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ModalDocumento urlDocumento={documentoAbierto} alCerrar={() => setDocumentoAbierto(null)} />
      <ModalVerAnuncio anuncio={anuncioVer} alCerrar={() => setAnuncioVer(null)} />
    </div>
  );
};

export default DashboardLayout;