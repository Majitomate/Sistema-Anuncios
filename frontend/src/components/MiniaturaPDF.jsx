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
        <Page
          pageNumber={1}
          width={160}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          devicePixelRatio={1}
        />
      </Document>
    </div>
  );
};

export default MiniaturaPDF;