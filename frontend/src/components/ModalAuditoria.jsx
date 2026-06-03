// componentes/ModalAuditoria.jsx
import React from 'react';
import styles from '../styles/modalAuditoria.module.css';

const ModalAuditoria = ({ isOpen, data, loading, error, onClose }) => {
  if (!isOpen) return null;

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaStr).toLocaleDateString('es-MX', opciones);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h3>Historial y Registro de Cambios</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>×</button>
        </header>

        <main className={styles.modalBody}>
          {loading && <div className={styles.loader}>Cargando historial de cambios...</div>}
          {error && <div className={styles.errorMessage}>⚠️ Error: {error}</div>}

          {!loading && !error && data && (
            <div className={styles.auditoriaGrid}>
              <h4 className={styles.anuncioTitulo}>{data.titulo}</h4>
              
              {/* BLOQUE DE CREACIÓN */}
              <div className={styles.logCard}>
                <div className={styles.logIcon}>✨</div>
                <div className={styles.logDetails}>
                  <h5>Creación del Anuncio</h5>
                  <p><strong>Por:</strong> {data.creado_por_nombre} <span>({data.creado_por_email})</span></p>
                  <p className={styles.fechaText}>📅 {formatearFecha(data.fecha_creacion)}</p>
                </div>
              </div>

              {/* BLOQUE DE ÚLTIMA MODIFICACIÓN */}
              <div className={styles.logCard}>
                <div className={styles.logIcon}>✏️</div>
                <div className={styles.logDetails}>
                  <h5>Última Modificación</h5>
                  <p><strong>Por:</strong> {data.modificado_por_nombre || 'N/A'} <span>{data.modificado_por_email ? `(${data.modificado_por_email})` : ''}</span></p>
                  <p className={styles.fechaText}>📅 {data.fueModificado ? formatearFecha(data.fecha_actualizacion) : 'Sin modificaciones históricas'}</p>
                </div>
              </div>

              {/* NUEVO: DETALLE TÉCNICO DE CAMBIOS DETECTADOS */}
              <div className={styles.detalleCambiosSeccion}>
                <h5>Bitácora de Ajustes en la última actualización:</h5>
                <ul className={styles.listaCambios}>
                  {data.cambiosDetectados?.map((cambio, index) => (
                    <li key={`cambio-${index}`} className={styles.itemCambio}>
                      {cambio}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModalAuditoria;