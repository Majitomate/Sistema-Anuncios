import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import styles from '../styles/modal.module.css'; 

// Configuración del motor de renderizado con Vite
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const ModalDocumento = ({ urlDocumento, alCerrar }) => {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (!urlDocumento) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <div className={styles.modalHeader}>
          <h3>Visor de Documento</h3>
          <button onClick={alCerrar} className={styles.modalCloseBtn}>
            Cerrar X
          </button>
        </div>
        
        {/* Renderizado real del PDF en lugar de un iframe */}
        <div 
          className={styles.modalIframe} 
          style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f0f0f0' }}
        >
          <Document
            file={urlDocumento}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p style={{ padding: '20px' }}>Cargando documento...</p>}
            error={<p style={{ padding: '20px', color: 'red' }}>Error al cargar el PDF.</p>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} style={{ marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Page 
                  pageNumber={index + 1} 
                  width={600} // Tamaño ideal para la tablet
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        </div>
        
      </div>
    </div>
  );
};

export default ModalDocumento;