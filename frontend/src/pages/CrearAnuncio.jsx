import React, { useState } from 'react';
import '../styles/NuevoAnuncio.css';
import { IconoRegresar } from '../components/NuevoAnuncio/Icons';
import FormInfo from '../components/NuevoAnuncio/FormInfo';
import FormFechas from '../components/NuevoAnuncio/FormFechas';
import Archivos from '../components/NuevoAnuncio/Archivos';
import { useAnuncios } from '../hooks/useAnuncios';

const FORM_INICIAL = {
  titulo: '',
  tipo: '',
  prioridad: '',
  subtitulo: '',
  contenido: '',
  fechaInicio: '',
  fechaFin: '',
  horaInicio: '',
  horaFin: '',
  esPermanente: false,
};

const CrearAnuncio = ({ alCerrar }) => {
  const { addAnuncio } = useAnuncios();
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [archivos, setArchivos] = useState([]);

  /* ── Handlers de formulario ── */
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

  /* ── Handlers de archivos ── */
  const agregarArchivos = (nuevos) => {
    setArchivos((prev) => [...prev, ...Array.from(nuevos)]);
  };

  const eliminarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Envío al backend ── */

const handleCrearAnuncio = async () => {
  try {
    const payload = new FormData();

    // 1. Combinar fecha y hora (ej: "2024-05-20T14:30")
    const inicio = formData.fechaInicio && formData.horaInicio
      ? `${formData.fechaInicio}T${formData.horaInicio}`
      : formData.fechaInicio || null;

    const fin = formData.fechaFin && formData.horaFin
      ? `${formData.fechaFin}T${formData.horaFin}`
      : formData.fechaFin || null;

    if (inicio) payload.append('fechaInicio', inicio);
    if (fin) payload.append('fechaFin', fin);

    // 2. Agregar el resto de los campos excluyendo los de fecha y hora sueltos
    Object.entries(formData).forEach(([key, value]) => {
      if (!['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin'].includes(key)) {
        payload.append(key, value);
      }
    });

    // 3. Agregar los archivos
    archivos.forEach((archivo) => {
      payload.append(
        archivo.type.includes('image') ? 'imagen' : 'documento',
        archivo,
      );
    });

    // Llamar a tu hook
    await addAnuncio(payload);
    alert('¡Anuncio creado con éxito!');
    alCerrar(); // Si tu alCerrar ya detona el onActualizar desde PanelControl
  } catch (err) {
    console.error('Error en la petición:', err);
    alert('Error al crear anuncio');
  }
};

  /* ── Render ── */
  return (
    <div className="pagina-nuevo-anuncio">
      {/* Navbar */}
      <header className="header-principal-verde">
        <button
          type="button"
          className="boton-regresar-blanco"
          onClick={alCerrar}
        >
          <IconoRegresar />
        </button>
        <h1 className="titulo-header-blanco">Nuevo Anuncio</h1>
      </header>

      {/* Grid */}
      <main className="contenido-formulario-referencia">
        <div className="grid-layout-referencia">
          {/* Columna izquierda — información principal */}
          <div className="seccion-principal">
            <FormInfo
              formData={formData}
              errores={errores}
              onChange={handleChange}
            />
          </div>

          {/* Columna derecha — programación + archivos */}
          <div className="columna-derecha-grid">
            <FormFechas
              formData={formData}
              esPermanente={formData.esPermanente}
              onChange={handleChange}
            />
            <Archivos
              archivos={archivos}
              onAgregar={agregarArchivos}
              onEliminar={eliminarArchivo}
            />
          </div>
        </div>
      </main>

      {/* Footer fijo */}
      <footer className="footer-acciones-fijo">
        <button type="button" className="boton-cancelar" onClick={alCerrar}>
          Cancelar
        </button>
        <button
          type="button"
          className="boton-crear-naranja"
          onClick={handleCrearAnuncio}
        >
          Crear Anuncio
        </button>
      </footer>
    </div>
  );
};

export default CrearAnuncio;