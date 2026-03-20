import React, { useState, useEffect } from 'react';
import '../styles/NuevoAnuncio.css';
import { IconoRegresar } from '../components/NuevoAnuncio/Icons.jsx';
import FormInfo from '../components/NuevoAnuncio/FormInfo.jsx';
import FormFechas from '../components/NuevoAnuncio/FormFechas.jsx';
import Archivos from '../components/NuevoAnuncio/Archivos.jsx';
import ModalDocumento from '../components/ModalDocumento.jsx'; // Asegúrate de ajustar esta ruta si guardaste el archivo en otra carpeta
import { useAnuncios } from '../hooks/useAnuncios';
import { obtenerAnuncioPorId } from '../services/anuncios.services';

// Helper para dividir un timestamp en fecha y hora sin problemas de zona horaria
const splitDateTime = (timestamp) => {
  if (!timestamp) return { date: '', time: '' };
  
  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) return { date: '', time: '' };
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return { 
    date: `${year}-${month}-${day}`, 
    time: `${hours}:${minutes}`      
  };
};

// Helper optimizado usando Blob para renderizar archivos (consume menos memoria)
const bufferToUrl = (bufferObj, mimeType) => {
  if (!bufferObj || !bufferObj.data) return null;
  const bytes = new Uint8Array(bufferObj.data);
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
};

const EditarAnuncio = ({ anuncio, alCerrar, onActualizado }) => {
  const { updateAnuncio } = useAnuncios();

  // Dividir fecha_inicio y fecha_fin en fecha + hora
  const inicio = splitDateTime(anuncio.fecha_inicio);
  const fin = splitDateTime(anuncio.fecha_fin);

  const [formData, setFormData] = useState({
    titulo: anuncio.titulo || '',
    tipo: anuncio.tipo || '',
    prioridad: anuncio.prioridad || '',
    subtitulo: anuncio.subtitulo || '',
    contenido: anuncio.contenido || '',
    fechaInicio: inicio.date,
    horaInicio: inicio.time,
    fechaFin: fin.date,
    horaFin: fin.time,
    esPermanente: anuncio.es_permanente || false,
  });

  const [errores, setErrores] = useState({});
  const [archivos, setArchivos] = useState([]);
  
  // Estado para guardar las URLs de los archivos que ya están en la Base de Datos
  const [archivosActuales, setArchivosActuales] = useState({
    imagenUrl: null,
    documentoUrl: null
  });

  // Estado para controlar qué documento se abre en el Modal
  const [documentoAbierto, setDocumentoAbierto] = useState(null);

  // Cargar los archivos desde la base de datos al abrir el modo edición
  useEffect(() => {
    const cargarArchivosBD = async () => {
      try {
        const anuncioCompleto = await obtenerAnuncioPorId(anuncio.id);
        
        setArchivosActuales({
          imagenUrl: anuncioCompleto.imagen 
            ? bufferToUrl(anuncioCompleto.imagen, anuncioCompleto.imagen_tipo) 
            : null,
          documentoUrl: anuncioCompleto.documento 
            ? bufferToUrl(anuncioCompleto.documento, anuncioCompleto.documento_tipo) 
            : null
        });
      } catch (error) {
        console.error("Error al cargar archivos de la BD:", error);
      }
    };

    cargarArchivosBD();
  }, [anuncio.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: false }));
    }
  };

  const agregarArchivos = (nuevos) => {
    const archivosNuevos = Array.from(nuevos);
    
    // Validación para no permitir más de 1 imagen y 1 documento a la vez
    const totalImagenes = archivos.filter(a => a.type.includes('image')).length + archivosNuevos.filter(a => a.type.includes('image')).length;
    const totalDocumentos = archivos.filter(a => !a.type.includes('image')).length + archivosNuevos.filter(a => !a.type.includes('image')).length;

    if (totalImagenes > 1) return alert('Solo puedes subir una imagen por anuncio.');
    if (totalDocumentos > 1) return alert('Solo puedes subir un documento por anuncio.');

    setArchivos((prev) => [...prev, ...archivosNuevos]);
  };

  const eliminarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditarAnuncio = async () => {
    try {
      const payload = new FormData();

      // Combinar fecha y hora para enviarlo en formato ISO
      const inicio = formData.fechaInicio && formData.horaInicio
        ? `${formData.fechaInicio}T${formData.horaInicio}`
        : formData.fechaInicio || null;

      const fin = formData.fechaFin && formData.horaFin
        ? `${formData.fechaFin}T${formData.horaFin}`
        : formData.fechaFin || null;

      if (inicio) payload.append('fechaInicio', inicio);
      if (fin) payload.append('fechaFin', fin);

      // Agregar el resto de campos, excluyendo las fechas sueltas
      Object.entries(formData).forEach(([key, value]) => {
        if (!['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin'].includes(key)) {
          payload.append(key, value);
        }
      });

      // Agregar los archivos nuevos
      archivos.forEach((archivo) => {
        payload.append(
          archivo.type.includes('image') ? 'imagen' : 'documento',
          archivo,
        );
      });

      await updateAnuncio(anuncio.id, payload);
      alert('¡Anuncio actualizado con éxito!');
      if (onActualizado) onActualizado();
      alCerrar();
    } catch (err) {
      console.error('Error en la petición:', err);
      alert('Error al actualizar anuncio');
    }
  };

  return (
    <div className="pagina-nuevo-anuncio">
      <header className="header-principal-verde">
        <button type="button" className="boton-regresar-blanco" onClick={alCerrar}>
          <IconoRegresar />
        </button>
        <h1 className="titulo-header-blanco">Editar Anuncio</h1>
      </header>

      <main className="contenido-formulario-referencia">
        <div className="grid-layout-referencia">
          <div className="seccion-principal">
            <FormInfo
              formData={formData}
              errores={errores}
              onChange={handleChange}
            />
          </div>

          <div className="columna-derecha-grid">
            <FormFechas
              formData={formData}
              esPermanente={formData.esPermanente}
              onChange={handleChange}
            />
            
            {/* Contenedor de Previsualización de archivos existentes */}
            {(archivosActuales.imagenUrl || archivosActuales.documentoUrl) && (
              <div className="archivos-actuales" style={{ padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}>Archivos Actualmente Guardados</h3>
                
                {archivosActuales.imagenUrl && (
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Imagen:</span>
                    <img 
                      src={archivosActuales.imagenUrl} 
                      alt="Actual" 
                      style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px' }} 
                    />
                  </div>
                )}

                {archivosActuales.documentoUrl && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', marginRight: '8px' }}>Documento:</span>
                    <button 
                      type="button"
                      onClick={() => setDocumentoAbierto(archivosActuales.documentoUrl)}
                      style={{ 
                        background: 'none', border: 'none', color: '#0ea5e9', 
                        textDecoration: 'underline', fontSize: '13px', 
                        fontWeight: 'bold', cursor: 'pointer', padding: 0 
                      }}
                    >
                      Ver documento 👁️
                    </button>
                  </div>
                )}
                
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>
                  * Si subes un nuevo archivo abajo, reemplazará al actual. Si lo dejas vacío, se conservará.
                </p>
              </div>
            )}

            <Archivos
              archivos={archivos}
              onAgregar={agregarArchivos}
              onEliminar={eliminarArchivo}
            />
          </div>
        </div>
      </main>

      <footer className="footer-acciones-fijo">
        <button type="button" className="boton-cancelar" onClick={alCerrar}>
          Cancelar
        </button>
        <button type="button" className="boton-crear-naranja" onClick={handleEditarAnuncio}>
          Guardar Cambios
        </button>
      </footer>

      {/* Uso del nuevo componente ModalDocumento */}
      <ModalDocumento 
        urlDocumento={documentoAbierto} 
        alCerrar={() => setDocumentoAbierto(null)} 
      />
    </div>
  );
};

export default EditarAnuncio;