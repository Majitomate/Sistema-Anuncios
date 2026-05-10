import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import s from '../styles/NuevoAnuncio.module.css';
import { IconoRegresar } from '../components/NuevoAnuncio/Icons.jsx';
import FormInfo from '../components/NuevoAnuncio/FormInfo.jsx';
import FormFechas from '../components/NuevoAnuncio/FormFechas.jsx';
import Archivos from '../components/NuevoAnuncio/Archivos.jsx';
import ModalDocumento from '../components/ModalDocumento.jsx';
import { useAnuncios } from '../hooks/useAnuncios';
import { obtenerAnuncioPorId } from '../services/anuncios.services';
import { validarRegla3Dias } from '../utils/validarRegla3Dias';

const splitDateTime = (timestamp) => {
  if (!timestamp) return { date: '', time: '' };
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
  };
};

const mapErroresToFields = (erroresArray) => {
  const fieldMap = {
    'título': 'titulo',
    'descripción corta': 'descripcion_corta',
    'contenido': 'contenido',
    'prioridad': 'prioridad',
    'tipo': 'tipo',
    'fecha de inicio': ['fechaInicio', 'horaInicio'],
    'fecha de fin': ['fechaFin', 'horaFin'],
  };
  const erroresObj = {};
  erroresArray.forEach(msg => {
    const lowerMsg = msg.toLowerCase();
    for (const [key, fields] of Object.entries(fieldMap)) {
      if (lowerMsg.includes(key)) {
        if (Array.isArray(fields)) {
          fields.forEach(field => erroresObj[field] = true);
        } else {
          erroresObj[fields] = true;
        }
        break;
      }
    }
  });
  return erroresObj;
};

const EditarAnuncio = ({ anuncio, alCerrar, onActualizado }) => {
  const { updateAnuncio } = useAnuncios();
  const inicio = splitDateTime(anuncio.fecha_inicio);
  const fin    = splitDateTime(anuncio.fecha_fin);

  const [formData, setFormData] = useState({
    titulo: anuncio.titulo || '', tipo: anuncio.tipo || '',
    prioridad: anuncio.prioridad || '', descripcion_corta: anuncio.descripcion_corta || '',
    contenido: anuncio.contenido || '',
    fechaInicio: inicio.date, horaInicio: inicio.time,
    fechaFin: fin.date,     horaFin: fin.time,
    esPermanente: anuncio.es_permanente || false,
    estado: anuncio.estado || false,
  });

  const [errores, setErrores] = useState({});
  const [archivos, setArchivos] = useState([]);
  const [archivosActuales, setArchivosActuales] = useState({ imagenes: [], documento: null });
  const [documentoAbierto, setDocumentoAbierto] = useState(null);

  useEffect(() => {
    const cargarDatosBD = async () => {
      try {
        const data = await obtenerAnuncioPorId(anuncio.id);
        setArchivosActuales({
          imagenes: data.imagenes || [],
          documento: data.tiene_documento ? { tipo: data.documento_tipo, url: `http://localhost:3001/anuncios/${data.id}/documento` } : null,
        });
      } catch (err) {
        console.error('Error al cargar archivos:', err);
      }
    };
    cargarDatosBD();
  }, [anuncio.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: false }));
  };

  const agregarArchivos = (nuevos) => {
    const arr = Array.from(nuevos);
    const totalImg = archivos.filter(a => a.type.includes('image')).length + arr.filter(a => a.type.includes('image')).length;
    const totalDoc = archivos.filter(a => !a.type.includes('image')).length + arr.filter(a => !a.type.includes('image')).length;
    if (totalImg > 1) return Swal.fire({ icon: 'warning', title: 'Atención', text: 'Solo puedes subir una imagen por anuncio.' });
    if (totalDoc > 1) return Swal.fire({ icon: 'warning', title: 'Atención', text: 'Solo puedes subir un documento por anuncio.' });
    setArchivos((prev) => [...prev, ...arr]);
  };

  const eliminarArchivo = (index) => setArchivos((prev) => prev.filter((_, i) => i !== index));

  const handleEditarAnuncio = async () => {
    /* Validación de 10 días hábiles en el frontend */
    const errorRegla = validarRegla3Dias(formData);
    if (errorRegla) {
      return Swal.fire({
        icon: 'warning',
        title: 'Regla del Sindicato',
        text: errorRegla,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e65100',
      });
    }

    try {
      const payload = new FormData();
      const inicioVal = formData.fechaInicio && formData.horaInicio
        ? `${formData.fechaInicio}T${formData.horaInicio}` : formData.fechaInicio || null;
      const finVal = formData.fechaFin && formData.horaFin
        ? `${formData.fechaFin}T${formData.horaFin}` : formData.fechaFin || null;

      if (!formData.esPermanente) {
        if (inicioVal) payload.append('fechaInicio', inicioVal);
        if (finVal)    payload.append('fechaFin', finVal);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (!['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin'].includes(key)) {
          payload.append(key, value);
        }
      });

      archivos.forEach((archivo) => {
        payload.append(archivo.type.includes('image') ? 'imagen' : 'documento', archivo);
      });

      await updateAnuncio(anuncio.id, payload);

      Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: 'Cambios guardados', showConfirmButton: false,
        timer: 3000, timerProgressBar: true,
      });

      if (onActualizado) onActualizado();
      alCerrar();
    } catch (err) {
      const erroresArray = err.message.split('\n').filter(msg => msg.trim());
      const erroresObj = mapErroresToFields(erroresArray);
      setErrores(erroresObj);

      const htmlErrores = erroresArray.length > 0
        ? `<ul style="text-align: left; margin: 0; padding-left: 20px;">${erroresArray.map(msg => `<li>${msg}</li>`).join('')}</ul>`
        : 'Verifica los campos obligatorios.';

      Swal.fire({
        icon: 'error',
        title: 'No se pudieron guardar los cambios',
        html: htmlErrores,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className={s.paginaNuevoAnuncio}>
      <header className={s.headerPrincipalVerde}>
        <button type="button" className={s.botonRegresarBlanco} onClick={alCerrar}>
          <IconoRegresar />
        </button>
        <div className={s.headerInfo}>
          <h1 className={s.tituloHeaderBlanco}>Editar Anuncio</h1>
          <p className={s.descripcion_cortaHeaderBlanco}>{anuncio.titulo}</p>
        </div>
      </header>

      <main className={s.contenidoFormularioReferencia}>
        <div className={s.gridLayoutReferencia}>
          <div>
            <FormInfo formData={formData} errores={errores} onChange={handleChange} modoEdicion />
          </div>

          <div className={s.columnaDerecha}>
            <FormFechas formData={formData} esPermanente={formData.esPermanente} onChange={handleChange} errores={errores} />

            {/* Archivos actualmente guardados */}
            {(archivosActuales.imagenes.length > 0 || archivosActuales.documento) && (
              <section className="tarjeta-referencia">
                <div className="archivos-actuales-header">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <h3>Archivos guardados</h3>
                </div>
                <div className="archivos-actuales-cuerpo">
                  {archivosActuales.imagenes.length > 0 && (
                    <div>
                      <span className="archivo-actual-label">Imágenes actuales</span>
                      <div className="imagenes-lista">
                        {archivosActuales.imagenes.map(img => (
                          <img key={img.id} src={`http://localhost:3001/anuncios/imagen/${img.id}`} alt="Imagen" className="archivo-actual-imagen" />
                        ))}
                      </div>
                    </div>
                  )}
                  {archivosActuales.documento && (
                    <div>
                      <span className="archivo-actual-label">Documento actual</span>
                      <button
                        type="button"
                        className="archivo-actual-doc"
                        onClick={() => setDocumentoAbierto(archivosActuales.documento.url)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Ver documento ({archivosActuales.documento.tipo})
                      </button>
                    </div>
                  )}
                </div>
                <p className="archivos-actuales-aviso">
                  Al subir nuevas imágenes, se agregarán a la galería. Si subes un nuevo documento, reemplazará al actual.
                </p>
              </section>
            )}

            <Archivos archivos={archivos} onAgregar={agregarArchivos} onEliminar={eliminarArchivo} />

            {/* Footer integrado */}
            <div className={s.footerAcciones}>
              <button type="button" className={s.botonCancelar} onClick={alCerrar}>
                Cancelar
              </button>
              <button type="button" className={s.botonCrearNaranja} onClick={handleEditarAnuncio}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </main>

      <ModalDocumento urlDocumento={documentoAbierto} alCerrar={() => setDocumentoAbierto(null)} />
    </div>
  );
};

export default EditarAnuncio;