import React, { useRef, useState } from 'react';
import { IconoArchivo, IconoSubir } from './Icons';

const Archivos = ({ archivos, onAgregar, onEliminar }) => {
  const fileInputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);

  const handleClickSubir = () => fileInputRef.current.click();

  const handleCambioArchivo = (e) => {
    if (e.target.files.length > 0) {
      onAgregar(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setArrastrando(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (e.dataTransfer.files.length > 0) {
      onAgregar(e.dataTransfer.files);
    }
  };

  return (
    <section className="tarjeta-referencia">
      <header
        className="tarjeta-header-referencia"
        style={{ justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconoArchivo />
          <h2>Archivos Adjuntos</h2>
        </div>

        {/* Input oculto */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleCambioArchivo}
          multiple
          accept="image/*,.pdf"
        />
        <button
          type="button"
          className="boton-subir-archivo"
          onClick={handleClickSubir}
        >
          Subir
        </button>
      </header>

      <div className="tarjeta-cuerpo-referencia">
        {/* Zona de arrastre */}
        <div
          className="area-carga-referencia"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickSubir}
          style={{
            backgroundColor: arrastrando ? '#f0f4f0' : '#fcfcfc',
            borderColor: arrastrando ? '#1b5e20' : '#d1d9e0',
          }}
        >
          <IconoSubir />
          <p>Haz clic o arrastra para subir</p>
        </div>

        {/* Lista de archivos */}
        <div className="lista-archivos-contenedor">
          {archivos.map((file, index) => (
            <div key={file.name} className="item-archivo">
              <span>
                📄{' '}
                {file.name.length > 25
                  ? `${file.name.substring(0, 25)}...`
                  : file.name}
              </span>
              <button
                type="button"
                className="boton-eliminar-file"
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminar(index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Archivos;
