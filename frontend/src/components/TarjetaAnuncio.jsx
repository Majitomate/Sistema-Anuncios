import React from 'react';
import styles from '../styles/dashboard.module.css';
import { useAnuncioDetalle } from '../hooks/useAnuncioDetalle';

const PRIORIDAD_ESTILOS = {
  1: { bg: 'rgba(56,142,60,0.09)', color: '#388e3c', border: 'rgba(56,142,60,0.3)', label: 'Baja' },
  2: { bg: 'rgba(245,124,0,0.09)', color: '#f57c00', border: 'rgba(245,124,0,0.3)', label: 'Media' },
  3: { bg: 'rgba(183,28,28,0.09)', color: '#b71c1c', border: 'rgba(183,28,28,0.3)', label: 'Alta' },
};

const IMAGEN_DEFAULT = '/imagen_default.jpg';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TarjetaAnuncio = ({ id, titulo, tipo, id_imagen_principal, prioridad, estado, onEditar, onEliminar, onAbrirDocumento, onVerAuditoria, puedeEditar }) => {
  const estilo = PRIORIDAD_ESTILOS[prioridad] ?? PRIORIDAD_ESTILOS[2];
  const { anuncio, loading } = useAnuncioDetalle(id);

  const imagenUrl = anuncio?.imagenes && anuncio.imagenes.length > 0
    ? `${API}/anuncios/imagen/${anuncio.imagenes[0].id}`
    : IMAGEN_DEFAULT;
  const documentoUrl = anuncio?.documento_tipo ? `${API}/anuncios/${anuncio.id}/documento` : null;

  return (
    <div className={styles.announcementCard}>

      <div className={`${styles.cardThumbnail} ${imagenUrl ? styles.thumbnailWithImage : ''}`} style={imagenUrl ? { backgroundImage: `url(${imagenUrl})` } : {}}>
        <span className={`${styles.status} ${estado ? styles.activo : styles.inactivo}`}>
          {estado ? 'Activo' : 'Inactivo'}
        </span>
        <div className={styles.cardThumbnailGradient} />
        {imagenUrl ? (
          <span className={styles.cardThumbnailTitle}>{titulo}</span>
        ) : (
          <div className={styles.cardThumbnailEmpty}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0bfb0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span>{titulo}</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <span className={styles.categoria}>{tipo}</span>
        <h3>{titulo}</h3>

        <div className={styles.cardFooter}>
          <span className={styles.prioridad} style={{ backgroundColor: estilo.bg, color: estilo.color, borderColor: estilo.border }}>
            {estilo.label}
          </span>

          <div className={styles.acciones}>
            {documentoUrl && (
              <button type="button" className={`${styles.editButton} ${styles.viewDocButton}`} onClick={() => onAbrirDocumento?.(documentoUrl)}>
                Doc
              </button>
            )}
            <button type="button" className={styles.auditoriaButton} onClick={() => onVerAuditoria(id)} title="Ver registro de cambios">
              Cambios
            </button>
            {puedeEditar && (
              <>
                <button type="button" className={styles.editButton} onClick={onEditar}>
                  Editar
                </button>
                <button type="button" className={styles.deleteButton} onClick={onEliminar}>
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TarjetaAnuncio;