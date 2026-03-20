import React from 'react';

const estiloError = {
  color: '#d32f2f',
  fontSize: '11px',
  fontWeight: '600',
  marginTop: '4px',
};

const FormInfo = ({ formData, errores, onChange }) => (
  <section className="tarjeta-referencia">
    <header className="tarjeta-header-referencia">
      <h2>Información Principal</h2>
    </header>

    <div className="tarjeta-cuerpo-referencia">
      {/* Título */}
      <div className="campo-referencia">
        <label htmlFor="titulo">Título del Anuncio</label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          placeholder="Ingrese un titulo"
          value={formData.titulo}
          onChange={onChange}
          className={errores.titulo ? 'input-error' : ''}
        />
        {errores.titulo && (
          <span style={estiloError}>Este campo es obligatorio</span>
        )}
      </div>

      {/* Tipo + Prioridad */}
      <div className="fila-doble-referencia">
        <div className="campo-referencia">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={onChange}
            className={errores.tipo ? 'input-error' : ''}
          >
            <option value="">Seleccione una opcion</option>
            <option value="general">General</option>
            <option value="evento">Evento</option>
            <option value="convocatoria">Convocatoria</option>
            <option value="votacion">Votación</option>
            <option value="resultado">Resultado</option>
          </select>
          {errores.tipo && (
            <span style={estiloError}>Selecciona un tipo</span>
          )}
        </div>

        <div className="campo-referencia">
          <label htmlFor="prioridad">Prioridad</label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={onChange}
            className={errores.prioridad ? 'input-error' : ''}
          >
            <option value="">Seleccione una opcion</option>
            <option value="1">Baja</option>
            <option value="2">Media</option>
            <option value="3">Alta</option>
          </select>
          {errores.prioridad && (
            <span style={estiloError}>Selecciona prioridad</span>
          )}
        </div>
      </div>

      {/* Subtítulo */}
      <div className="campo-referencia">
        <label htmlFor="subtitulo">Subtítulo</label>
        <input
          id="subtitulo"
          name="subtitulo"
          type="text"
          placeholder="Subtitulo"
          value={formData.subtitulo}
          onChange={onChange}
          className={errores.subtitulo ? 'input-error' : ''}
        />
        {errores.subtitulo && (
          <span style={estiloError}>Este campo es obligatorio</span>
        )}
      </div>

      {/* Contenido */}
      <div className="campo-referencia">
        <label htmlFor="contenido">Contenido</label>
        <textarea
          id="contenido"
          name="contenido"
          placeholder="Descripción..."
          value={formData.contenido}
          onChange={onChange}
          className={errores.contenido ? 'input-error' : ''}
        />
        {errores.contenido && (
          <span style={estiloError}>El contenido es obligatorio</span>
        )}
      </div>

      {/* Switch permanente */}
      <div className="switch-container">
        <label className="switch">
          <input
            name="esPermanente"
            type="checkbox"
            checked={formData.esPermanente}
            onChange={onChange}
          />
          <span className="slider-toggle" />
        </label>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#1b5e20',
          }}
        >
          Anuncio Permanente
        </span>
      </div>
    </div>
  </section>
);

export default FormInfo;
