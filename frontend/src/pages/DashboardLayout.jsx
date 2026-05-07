import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import Encabezado from '../components/Encabezado.jsx';
import CuadriculaTarjetas from '../components/CuadriculaTarjetas.jsx';
import NavbarDashboard from '../components/NavbarDashboard.jsx';
import CarruselAnuncios from '../components/CarruselAnuncios.jsx';
import ListaAnuncios from '../components/ListaAnuncios.jsx';
import CrearAnuncio from '../pages/CrearAnuncio.jsx';
import EditarAnuncio from '../pages/EditarAnuncio.jsx';
import ModalDocumento from '../components/ModalDocumento.jsx';
import ModalVerAnuncio from '../components/ModalVerAnuncio.jsx';
import styles from '../styles/dashboard.module.css';
import { useAnuncios } from '../hooks/useAnuncios';

const bufferToUrl = (bufferObj, mimeType) => {
  if (!bufferObj?.data) return null;
  const blob = new Blob([new Uint8Array(bufferObj.data)], { type: mimeType });
  return URL.createObjectURL(blob);
};

const DashboardLayout = ({ anuncios, onAnuncioCreado, rolUsuario, loading }) => {
  const { removeAnuncio, updateAnuncio } = useAnuncios();
  const puedeEditar = rolUsuario === 'admin' || rolUsuario === 'editor' || rolUsuario === 'revisor';

  const [vista,             setVista]             = useState(null);
  const [anuncioAEditar,    setAnuncioAEditar]    = useState(null);
  const [anuncioVer,        setAnuncioVer]        = useState(null);
  const [vistaActual,       setVistaActual]       = useState('cuadricula');
  const [indiceCarrusel,    setIndiceCarrusel]    = useState(0);
  const [documentoAbierto,  setDocumentoAbierto]  = useState(null);

  useEffect(() => {
    document.title = 'Panel de Control — SUTUS'; 

    const revisarPantalla = () => {
      if (window.innerWidth <= 768) {
        setVistaActual('cuadricula');
      }
    };

    revisarPantalla();

    window.addEventListener('resize', revisarPantalla);
    return () => window.removeEventListener('resize', revisarPantalla);
  }, []);


  const obtenerUrlImagen = useCallback((anuncio) => {
    if (anuncio.imagenes && anuncio.imagenes.length > 0) {
      return `http://localhost:3001/anuncios/imagen/${anuncio.imagenes[0].id}`;
    }
    return null;
  }, []);

  const handleCerrar    = useCallback(() => { setVista(null); setAnuncioAEditar(null); }, []);
  const handleGuardado  = useCallback(() => { handleCerrar(); onAnuncioCreado?.(); }, [handleCerrar, onAnuncioCreado]);
  const handleEditarClick = useCallback((anuncio) => { setAnuncioAEditar(anuncio); setVista('editar'); }, []);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        await removeAnuncio(id);
        onAnuncioCreado?.();
        Swal.fire({ title: '¡Eliminado!', text: 'El anuncio ha sido eliminado.', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch {
        Swal.fire({ title: 'Error', text: 'Hubo un problema al eliminar.', icon: 'error' });
      }
    }
  };

  const handleToggleEstado = useCallback(async (id, nuevoEstado) => {
    if (!puedeEditar) {
      return Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para cambiar el estado.' });
    }
    try {
      const anuncio = anuncios.find((a) => a.id === id);
      if (!anuncio) return;
      const payload = new FormData();
      payload.append('estado', nuevoEstado);
      payload.append('titulo', anuncio.titulo);
      payload.append('descripcion_corta', anuncio.descripcion_corta);
      payload.append('contenido', anuncio.contenido);
      payload.append('tipo', anuncio.tipo);
      payload.append('prioridad', anuncio.prioridad);
      payload.append('esPermanente', anuncio.es_permanente);
      if (!anuncio.es_permanente) {
        if (anuncio.fecha_inicio) payload.append('fechaInicio', anuncio.fecha_inicio);
        if (anuncio.fecha_fin)    payload.append('fechaFin', anuncio.fecha_fin);
      }
      await updateAnuncio(id, payload);
      onAnuncioCreado?.();
    } catch {
      alert('Error al cambiar el estado');
    }
  }, [anuncios, onAnuncioCreado, updateAnuncio, puedeEditar]);

  const anunciosCarrusel = useMemo(() => anuncios.filter((a) => a.estado).slice(0, 5), [anuncios]);
  const anunciosActivos  = anuncios.filter((a) => a.estado);

  if (vista === 'crear') return <CrearAnuncio alCerrar={handleCerrar} onActualizado={handleGuardado} />;
  if (vista === 'editar' && anuncioAEditar) return <EditarAnuncio anuncio={anuncioAEditar} alCerrar={handleCerrar} onActualizado={handleGuardado} />;

  return (
      <div className={styles.dashboardLayout}>

        <NavbarDashboard
            puedeEditar={puedeEditar}
            vistaActual={vistaActual}
            onCambiarVista={setVistaActual}
            onCrearAnuncio={() => setVista('crear')}
        />

        <main className={styles.mainContent}>

          {!loading && anunciosCarrusel.length > 0 && (
              <CarruselAnuncios
                  anuncios={anunciosCarrusel}
                  indice={indiceCarrusel}
                  onAnterior={() => setIndiceCarrusel((p) => (p - 1 + anunciosCarrusel.length) % anunciosCarrusel.length)}
                  onSiguiente={() => setIndiceCarrusel((p) => (p + 1) % anunciosCarrusel.length)}
                  onIrA={setIndiceCarrusel}
                  obtenerUrlImagen={obtenerUrlImagen}
              />
          )}

          <Encabezado
              activos={anunciosActivos.length}
              total={anuncios.length}
              pantallas={1}
              ultimaActualizacion={new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          />

          <div style={{ marginTop: '24px' }}>
            {loading && anuncios.length === 0 ? (
                <div className={styles.loadingWrap}>
                  <div className={styles.spinner} />
                  <p className={styles.loadingText}>Cargando anuncios...</p>
                </div>

            ) : vistaActual === 'cuadricula' ? (
                anuncios.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#9eaa9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <p className={styles.emptyStateTitle}>No hay anuncios todavía</p>
                      <p className={styles.emptyStateSub}>Crea tu primer anuncio para que aparezca aquí y en las pantallas del sindicato.</p>
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
                <ListaAnuncios
                    anuncios={anuncios}
                    puedeEditar={puedeEditar}
                    onEditar={handleEditarClick}
                    onEliminar={handleEliminar}
                    onVer={setAnuncioVer}
                    onToggleEstado={handleToggleEstado}
                />
            )}
          </div>
        </main>

        <ModalDocumento urlDocumento={documentoAbierto} alCerrar={() => setDocumentoAbierto(null)} />
        <ModalVerAnuncio anuncio={anuncioVer} alCerrar={() => setAnuncioVer(null)} />
      </div>
  );
};

export default DashboardLayout;