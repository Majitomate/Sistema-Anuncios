import React, { useState, useEffect } from 'react';
import styles from '../styles/dashboard.module.css';
import { obtenerAnuncioPorId } from '../services/anuncios.services';

const PRIORIDAD_ESTILOS = {
  1: { bg: 'rgba(56,142,60,0.09)', color: '#388e3c', border: 'rgba(56,142,60,0.3)', label: 'Baja' },
  2: { bg: 'rgba(245,124,0,0.09)', color: '#f57c00', border: 'rgba(245,124,0,0.3)', label: 'Media' },
  3: { bg: 'rgba(183,28,28,0.09)', color: '#b71c1c', border: 'rgba(183,28,28,0.3)', label: 'Urgente' },
};

// Helper optimizado usando Blob
const bufferToUrl = (bufferObj, mimeType) => {
  if (!bufferObj || !bufferObj.data) return null;
  const bytes = new Uint8Array(bufferObj.data);
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
};

const TarjetaAnuncio = ({ id, titulo, tipo, subtitulo, prioridad, estado, onAbrirDocumento }) => {
  const estilo = PRIORIDAD_ESTILOS[prioridad] ?? PRIORIDAD_ESTILOS[2];
  const [archivos, setArchivos] = useState({ imagenUrl: null, documentoUrl: null });

  useEffect(() => {
    const cargarArchivos = async () => {
      try {
        const data = await obtenerAnuncioPorId(id);
        setArchivos({
          imagenUrl: data.imagen ? bufferToUrl(data.imagen, data.imagen_tipo) : null,
          documentoUrl: data.documento ? bufferToUrl(data.documento, data.documento_tipo) : null
        });
      } catch (error) {
        console.error(`Error al cargar archivos:`, error);
      }
    };
    cargarArchivos();
  }, [id]);

  return (
    <div className={styles.announcementCard}>
      {/* Miniatura */}
      <div 
        /* CORRECCIÓN: Combinamos la clase base con la nueva clase estática si hay imagen */
        className={`${styles.cardThumbnail} ${archivos.imagenUrl ? styles.thumbnailWithImage : ''}`}
        /* Mantenemos SOLO el backgroundImage en línea porque es dinámico */
        style={archivos.imagenUrl ? { backgroundImage: `url(${archivos.imagenUrl})` } : {}}
      >
        <span className={`${styles.status} ${estado ? styles.activo : styles.inactivo}`}>
          {estado ? 'Activo' : 'Inactivo'}
        </span>
        {!archivos.imagenUrl && <span className={styles.cardThumbnailLabel}>{titulo}</span>}
      </div>

      {/* Cuerpo */}
      <div className={styles.cardBody}>
        <span className={styles.categoria}>{tipo}</span>
        <h3>{titulo}</h3>
        <p className={styles.descripcion}>{subtitulo}</p>

        <div className={styles.cardFooter}>
          <span className={styles.prioridad} style={{ backgroundColor: estilo.bg, color: estilo.color, borderColor: estilo.border }}>
            {estilo.label}
          </span>

          <div className={styles.acciones}>
            {archivos.documentoUrl && (
              <button 
                type="button" 
                /* CORRECCIÓN: Usamos las clases del módulo combinadas */
                className={`${styles.editButton} ${styles.viewDocButton}`} 
                onClick={() => onAbrirDocumento(archivos.documentoUrl)}
              >
                📄 Ver Doc
              </button>
            )}
            <button type="button" className={styles.editButton}>✎ Editar</button>
            <button type="button" className={styles.deleteButton}>🗑 Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaAnuncio;