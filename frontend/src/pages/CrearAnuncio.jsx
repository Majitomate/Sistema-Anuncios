import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import s from '../styles/NuevoAnuncio.module.css';
import { IconoRegresar } from '../components/NuevoAnuncio/Icons';
import FormInfo from '../components/NuevoAnuncio/FormInfo';
import FormFechas from '../components/NuevoAnuncio/FormFechas';
import Archivos from '../components/NuevoAnuncio/Archivos';
import { useAnuncios } from '../hooks/useAnuncios';

const FORM_INICIAL = {
  titulo: '', tipo: '', prioridad: '', subtitulo: '',
  contenido: '', fechaInicio: '', fechaFin: '',
  horaInicio: '', horaFin: '', esPermanente: false,
};

const mapErroresToFields = (erroresArray) => {
  const fieldMap = {
    'título': 'titulo',
    'descripción corta': 'subtitulo',
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

const CrearAnuncio = ({ alCerrar, onActualizado }) => {
  const { addAnuncio } = useAnuncios();
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = 'Crear Anuncio — SUTUS';
    return () => { document.title = tituloAnterior; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: false }));
  };

  const agregarArchivos = (nuevos) => setArchivos((prev) => [...prev, ...Array.from(nuevos)]);
  const eliminarArchivo = (index) => setArchivos((prev) => prev.filter((_, i) => i !== index));

  const handleCrearAnuncio = async () => {
    try {
      const payload = new FormData();

      const inicio = formData.fechaInicio && formData.horaInicio
        ? `${formData.fechaInicio}T${formData.horaInicio}`
        : formData.fechaInicio || null;
      const fin = formData.fechaFin && formData.horaFin
        ? `${formData.fechaFin}T${formData.horaFin}`
        : formData.fechaFin || null;

      if (!formData.esPermanente) {
        if (inicio) payload.append('fechaInicio', inicio);
        if (fin) payload.append('fechaFin', fin);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (!['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin'].includes(key)) {
          payload.append(key, value);
        }
      });

      archivos.forEach((archivo) => {
        payload.append(archivo.type.includes('image') ? 'imagen' : 'documento', archivo);
      });

      await addAnuncio(payload);

      Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: '¡Anuncio creado con éxito!',
        showConfirmButton: false, timer: 3000, timerProgressBar: true,
      });

      if (onActualizado) onActualizado();
      alCerrar();
    } catch (err) {
      const erroresArray = err.message.split('\n').filter(msg => msg.trim());
      const erroresObj = mapErroresToFields(erroresArray);
      setErrores(erroresObj);

      const htmlErrores = erroresArray.length > 0
        ? `<ul style="text-align: left; margin: 0; padding-left: 20px;">${erroresArray.map(msg => `<li>${msg}</li>`).join('')}</ul>`
        : 'Verifica los datos obligatorios.';

      Swal.fire({
        icon: 'error',
        title: 'Error al crear anuncio',
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
          <h1 className={s.tituloHeaderBlanco}>Nuevo Anuncio</h1>
          <p className={s.subtituloHeaderBlanco}>Los campos marcados con * son obligatorios</p>
        </div>
      </header>

      <main className={s.contenidoFormularioReferencia}>
        <div className={s.gridLayoutReferencia}>
          <div>
            <FormInfo formData={formData} errores={errores} onChange={handleChange} />
          </div>

          <div className={s.columnaDerecha}>
            <FormFechas formData={formData} esPermanente={formData.esPermanente} onChange={handleChange} errores={errores} />
            <Archivos archivos={archivos} onAgregar={agregarArchivos} onEliminar={eliminarArchivo} />

            {/* Footer integrado en columna derecha */}
            <div className={s.footerAcciones}>
              <button type="button" className={s.botonCancelar} onClick={alCerrar}>
                Cancelar
              </button>
              <button type="button" className={s.botonCrearNaranja} onClick={handleCrearAnuncio}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Crear Anuncio
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrearAnuncio;