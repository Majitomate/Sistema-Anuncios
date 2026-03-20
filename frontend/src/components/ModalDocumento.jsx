import React from 'react';
// IMPORTANTE: Importamos como módulo
import styles from '../styles/modal.module.css'; 

const ModalDocumento = ({ urlDocumento, alCerrar }) => {
  if (!urlDocumento) return null;

  return (
    // Usamos styles.nombreDeLaClase
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <div className={styles.modalHeader}>
          <h3>Visor de Documento</h3>
          <button 
            onClick={alCerrar}
            className={styles.modalCloseBtn}
          >
            Cerrar X
          </button>
        </div>
        
        <iframe 
          src={urlDocumento} 
          className={styles.modalIframe}
          title="Visor de Documentos"
        />
        
      </div>
    </div>
  );
};

export default ModalDocumento;