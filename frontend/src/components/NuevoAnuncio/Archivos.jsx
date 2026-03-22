import React, { useRef, useState } from 'react';

const IconoSubirMejorado = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const Archivos = ({ archivos, onAgregar, onEliminar }) => {
  const fileInputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);

  const handleClickSubir = () => fileInputRef.current.click();

  const handleCambioArchivo = (e) => {
    if (e.target.files.length > 0) onAgregar(e.target.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setArrastrando(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setArrastrando(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (e.dataTransfer.files.length > 0) onAgregar(e.dataTransfer.files);
  };

  return (
    <section className="tarjeta-referencia">
      <header className="tarjeta-header-referencia" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="tarjeta-header-icono" style={{ backgroundColor: '#e8f0fe' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a56b0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h2>Archivos adjuntos</h2>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleCambioArchivo}
          multiple
          accept="image/*,.pdf"
        />
        <button type="button" className="boton-subir-archivo" onClick={handleClickSubir}>
          Subir archivo
        </button>
      </header>

      <div className="tarjeta-cuerpo-referencia">
        <div
          className="area-carga-referencia"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickSubir}
          style={{
            borderColor: arrastrando ? '#1b5e20' : undefined,
            backgroundColor: arrastrando ? '#f0f6f0' : undefined,
          }}
        >
          <div className="area-carga-icono">
            <IconoSubirMejorado />
          </div>
          <p className="area-carga-titulo">Arrastra o haz clic para subir</p>
          <p className="area-carga-sub">Imagen o documento del anuncio</p>
          <span className="area-carga-tipos">JPG · PNG · PDF · máx. 5 MB</span>
        </div>

        {archivos.length > 0 && (
          <div className="lista-archivos-contenedor">
            {archivos.map((file, index) => (
              <div key={file.name} className="item-archivo">
                <span>
                  {file.type.includes('image') ? '🖼 ' : '📄 '}
                  {file.name.length > 28 ? `${file.name.substring(0, 28)}…` : file.name}
                </span>
                <button
                  type="button"
                  className="boton-eliminar-file"
                  onClick={(e) => { e.stopPropagation(); onEliminar(index); }}
                  title="Quitar archivo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Archivos;