import React, { useState, useEffect } from 'react';
import s from '../styles/PanelControl.module.css';
import { obtenerAnuncioPorId } from '../services/anuncios.services';
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
const bufferToUrl = (bufferObj, mimeType) => {
  if (!bufferObj?.data) return null;
  const blob = new Blob([new Uint8Array(bufferObj.data)], { type: mimeType });
  return URL.createObjectURL(blob);
};

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
  const [archivos, setArchivos] = useState({ imagenUrl: null, documentoUrl: null });
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const [documentoAbierto, setDocumentoAbierto] = useState(null);
  const API_BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    if (!anuncio) {
      setArchivos({ imagenUrl: null, documentoUrl: null });
      return;
    }

    const cargar = async () => {
      setCargandoArchivos(true);
      try {
        const data = await obtenerAnuncioPorId(anuncio.id);

        setArchivos({
          imagenUrl: data.tiene_imagen ? `${API_BASE_URL}/anuncios/${data.id}/imagen` : null,
          documentoUrl: data.tiene_documento ? `${API_BASE_URL}/anuncios/${data.id}/documento` : null,
        });
      } catch (error) {
        console.error('Error al cargar detalle del anuncio:', error);
        setArchivos({ imagenUrl: null, documentoUrl: null });
      } finally {
        setCargandoArchivos(false);
      }
    };

    cargar();
  }, [anuncio?.id]);

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
          {anuncio.subtitulo && (
            <p className={s.modalSubtitulo}>{anuncio.subtitulo}</p>
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

          {/* Imagen */}
          {cargandoArchivos ? (
            <div className={s.modalSkeleton} aria-label="Cargando imagen..." />
          ) : archivos.imagenUrl ? (
            <div className={s.modalSeccion}>
              <span className={s.modalEtiqueta}>Imagen</span>
              <div className={s.modalImagenWrap}>
                <img
                  src={archivos.imagenUrl}
                  alt={anuncio.titulo}
                  className={s.modalImagen}
                />
              </div>
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
          {!cargandoArchivos && archivos.documentoUrl && (
            <div className={s.modalSeccion}>
              <span className={s.modalEtiqueta}>Documento adjunto</span>
              <button
                type="button" // Cambiamos <a> por <button> para que sea igual que en Editar
                onClick={() => setDocumentoAbierto(archivos.documentoUrl)}
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