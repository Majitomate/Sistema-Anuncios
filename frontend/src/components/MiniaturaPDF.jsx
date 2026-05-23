import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const MiniaturaPDF = ({ url }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#fff' }}>
      <Document
        file={url}
        loading={<p style={{ fontSize: '12px', color: '#666' }}>Cargando...</p>}
        error={<p style={{ fontSize: '14px', color: '#ff3333' }}>📄 PDF</p>}
      >
        {/* Solo renderiza la página 1 en tamaño pequeño */}
        <Page 
          pageNumber={1} 
          width={160} // Ajusta este ancho para que llene bien tu recuadro de miniatura
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};

export default MiniaturaPDF;