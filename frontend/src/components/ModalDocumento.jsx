import React from 'react';
import styles from '../styles/modal.module.css'; 

const ModalDocumento = ({ urlDocumento, alCerrar }) => {
  if (!urlDocumento) return null;
  const urlOptimizadaParaTablet = `https://docs.google.com/gview?url=${encodeURIComponent(urlDocumento)}&embedded=true`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ width: '85%', height: '85%', display: 'flex', flexDirection: 'column' }}>
        
        <div className={styles.modalHeader}>
          <h3>Visor de Documento</h3>
          <button onClick={alCerrar} className={styles.modalCloseBtn}>
            Cerrar X
          </button>
        </div>
        
        <div className={styles.modalIframe} style={{ flex: 1, width: '100%', overflow: 'hidden', padding: 0, backgroundColor: '#f0f0f0' }}>
          <iframe
            src={urlOptimizadaParaTablet}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Visor de Documento PDF"
          />
        </div>
        
      </div>
    </div>
  );
};

export default ModalDocumento;