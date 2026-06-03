import React, { useState } from 'react';
import s from '../styles/PanelControl.module.css';
import { useAnuncioDetalle } from '../hooks/useAnuncioDetalle';
import ModalDocumento from '../components/ModalDocumento.jsx';

/* ── Constantes ── */
const PRIORIDAD_LABELS = { 1: 'Baja', 2: 'Media', 3: 'Alta' };
const PRIORIDAD_CLASES = {
  1: s.prioridadBaja,
  2: s.prioridadMedia,
  3: s.prioridadAlta,
};

const TIPO_LABELS = {
  general: 'General',
  evento: 'Evento',
  convocatoria: 'Convocatoria',
  votacion: 'Votación',
  resultado: 'Resultado',
};

const TIPO_CLASES = {
  general: s.tipoGeneral,
  evento: s.tipoEvento,
  convocatoria: s.tipoConvocatoria,
  votacion: s.tipoVotacion,
  resultado: s.tipoResultado,
};

/* ── Helpers ── */
const formatFecha = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/* ── Componente ── */
const ModalVerAnuncio = ({ anuncio, alCerrar }) => {
  const [documentoAbierto, setDocumentoAbierto] = useState(null);
  const [indiceImagen, setIndiceImagen] = useState(0);
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const { anuncio: detalleAnuncio, loading: cargandoArchivos } = useAnuncioDetalle(anuncio?.id);

  const imagenesUrls = detalleAnuncio?.imagenes ? detalleAnuncio.imagenes.map(img => `${API}/anuncios/imagen/${img.id}`) : [];
  const documentoUrl = detalleAnuncio?.tiene_documento ? `${API}/anuncios/${detalleAnuncio.id}/documento` : null;

  // Funciones limpias para el carrusel
  const nextImagen = () => setIndiceImagen((i) => (i + 1) % imagenesUrls.length);
  const prevImagen = () => setIndiceImagen((i) => (i - 1 + imagenesUrls.length) % imagenesUrls.length);

  if (!anuncio) return null;

  const prioridadLabel = PRIORIDAD_LABELS[anuncio.prioridad] || '—';
  const tipoLabel = TIPO_LABELS[anuncio.tipo] || anuncio.tipo;

  return (
    <div
      className={s.modalOverlay}
      onClick={alCerrar}
      role="presentation"
    >
      <div
        className={s.modalContenido}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle: ${anuncio.titulo}`}
      >

        {/* ── Header ── */}
        <div className={s.modalHeader}>
          <div className={s.modalHeaderTexto}>
            <span className={`${s.badgeTipo} ${TIPO_CLASES[anuncio.tipo] ?? ''}`}>
              {tipoLabel}
            </span>
            <h2 className={s.modalTitulo}>{anuncio.titulo}</h2>
          </div>
          <button
            type="button"
            className={s.modalCerrarBtn}
            onClick={alCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* ── Cuerpo ── */}
        <div className={s.modalCuerpo}>

          {/* Subtítulo */}
          {anuncio.descripcion_corta && (
            <p className={s.modaldescripcion_corta}>{anuncio.descripcion_corta}</p>
          )}

          {/* Badges */}
          <div className={s.modalBadgesRow}>
            <span className={`${s.modalBadgeEstado} ${anuncio.estado ? s.modalBadgeActivo : s.modalBadgeInactivo}`}>
              <span className={s.botonEstadoPunto} />
              {anuncio.estado ? 'Activo' : 'Inactivo'}
            </span>
            <span className={`${s.badgePrioridad} ${PRIORIDAD_CLASES[anuncio.prioridad] ?? ''}`}>
              {prioridadLabel}
            </span>
            {anuncio.es_permanente && (
              <span className={s.modalBadgePermanente}>Permanente</span>
            )}
          </div>

          {/* ── SECCIÓN DE IMÁGENES / CARRUSEL MEJORADO ── */}
          {cargandoArchivos ? (
            <div className={s.modalSkeleton} aria-label="Cargando imagen..." />
          ) : imagenesUrls.length > 0 ? (
            <div className={s.modalSeccion}>
              <span className={s.modalEtiqueta}>
                {imagenesUrls.length > 1 ? `Imágenes de la galería (${imagenesUrls.length})` : 'Imagen principal'}
              </span>
              
              {imagenesUrls.length === 1 ? (
                <div className={s.modalImagenWrap}>
                  <img
                    src={imagenesUrls[0]}
                    alt={anuncio.titulo}
                    className={s.modalImagen}
                  />
                </div>
              ) : (
                <div className={s.carruselContainer}>
                  {/* Flecha Izquierda */}
                  <button type="button" className={`${s.carruselBtn} ${s.carruselBtnPrev}`} onClick={prevImagen} aria-label="Anterior">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  
                  <div className={s.carruselImagenWrapper}>
                    <img 
                      src={imagenesUrls[indiceImagen]} 
                      alt={`Imagen ${indiceImagen + 1} de ${imagenesUrls.length}`} 
                      className={s.modalImagen} 
                    />
                    {/* Contador flotante estilo cristal */}
                    <div className={s.carruselContador}>
                      {indiceImagen + 1} / {imagenesUrls.length}
                    </div>
                  </div>

                  {/* Flecha Derecha */}
                  <button type="button" className={`${s.carruselBtn} ${s.carruselBtnNext}`} onClick={nextImagen} aria-label="Siguiente">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Puntitos interactivos (Dots) */}
                  <div className={s.carruselIndicadores}>
                    {imagenesUrls.map((_, idx) => (
                      <button 
                        key={idx} 
                        type="button"
                        aria-label={`Ir a la imagen ${idx + 1}`}
                        onClick={() => setIndiceImagen(idx)}
                        className={`${s.indicador} ${idx === indiceImagen ? s.indicadorActivo : ''}`} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className={s.modalDivisor} />

          {/* Contenido */}
          <div className={s.modalSeccion}>
            <span className={s.modalEtiqueta}>Contenido</span>
            <p className={s.modalTexto}>{anuncio.contenido || '—'}</p>
          </div>

          {/* Fechas */}
          {!anuncio.es_permanente && (
            <div className={s.modalFilaDoble}>
              <div className={s.modalSeccion}>
                <span className={s.modalEtiqueta}>Fecha de inicio</span>
                <p className={s.modalTexto}>{formatFecha(anuncio.fecha_inicio)}</p>
              </div>
              <div className={s.modalSeccion}>
                <span className={s.modalEtiqueta}>Fecha de fin</span>
                <p className={s.modalTexto}>{formatFecha(anuncio.fecha_fin)}</p>
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className={s.modalFilaDoble}>
            <div className={s.modalSeccion}>
              <span className={s.modalEtiqueta}>Creado</span>
              <p className={s.modalTexto}>{formatFecha(anuncio.fecha_creacion)}</p>
            </div>
            <div className={s.modalSeccion}>
              <span className={s.modalEtiqueta}>Última actualización</span>
              <p className={s.modalTexto}>{formatFecha(anuncio.fecha_actualizacion)}</p>
            </div>
          </div>

          {/* Documento adjunto */}
          {!cargandoArchivos && documentoUrl && (
            <div className={s.modalSeccion}>
              <span className={s.modalEtiqueta}>Documento adjunto</span>
              <button
                type="button" 
                onClick={() => setDocumentoAbierto(documentoUrl)}
                className={s.modalDocumentoBtn}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Ver documento
              </button>
            </div>
          )}

        </div>

        {/* ── Footer ──*/}
        <div className={s.modalFooter}>
          <button
            type="button"
            className={s.modalBtnCerrar}
            onClick={alCerrar}
          >
            Cerrar
          </button>
        </div>

      </div>
      <ModalDocumento
        urlDocumento={documentoAbierto}
        alCerrar={() => setDocumentoAbierto(null)}
      />
    </div>
  );
};

export default ModalVerAnuncio;