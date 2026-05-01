import React from 'react';
import SelectCustom from './SelectCustom';

const OPCIONES_TIPO = [
  { value: 'general',      label: 'General'      },
  { value: 'evento',       label: 'Evento'        },
  { value: 'convocatoria', label: 'Convocatoria'  },
  { value: 'votacion',     label: 'Votación'      },
  { value: 'resultado',    label: 'Resultado'     },
];

const OPCIONES_PRIORIDAD = [
  { value: '1', label: 'Baja'  },
  { value: '2', label: 'Media' },
  { value: '3', label: 'Alta'  },
];

const FormInfo = ({ formData, errores, onChange, modoEdicion = false }) => {
  const contTitulo = (formData.titulo || '').length;
  const contdescripcion_corta = (formData.descripcion_corta || '').length;

  return (
    <section className="tarjeta-referencia">
      <header className="tarjeta-header-referencia">
        <div className="tarjeta-header-icono" style={{ backgroundColor: '#e6f4ea' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <h2>Información Principal</h2>
      </header>

      <div className="tarjeta-cuerpo-referencia">

        {/* Título */}
        <div className="campo-referencia">
          <label htmlFor="titulo">
            Título del anuncio <span className="campo-req">*</span>
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ej. Inscripciones Abiertas 2026"
            value={formData.titulo}
            onChange={onChange}
            maxLength={150}
            className={errores.titulo ? 'input-error' : ''}
          />
          <span className={`campo-contador${contTitulo >= 120 ? ' campo-contador-warn' : ''}`}>
            {contTitulo} / 150
          </span>
          {errores.titulo && <span className="campo-error-msg">Este campo es obligatorio</span>}
        </div>

        {/* Tipo + Prioridad */}
        <div className="fila-doble-referencia">
          <div className="campo-referencia">
            <label htmlFor="tipo">
              Tipo <span className="campo-req">*</span>
            </label>
            <SelectCustom
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={onChange}
              options={OPCIONES_TIPO}
              placeholder="Selecciona un tipo"
              className={errores.tipo ? 'input-error' : ''}
            />
            {errores.tipo && <span className="campo-error-msg">Selecciona un tipo</span>}
          </div>

          <div className="campo-referencia">
            <label htmlFor="prioridad">
              Prioridad <span className="campo-req">*</span>
            </label>
            <SelectCustom
              id="prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={onChange}
              options={OPCIONES_PRIORIDAD}
              placeholder="Selecciona prioridad"
              className={errores.prioridad ? 'input-error' : ''}
            />
            {errores.prioridad && <span className="campo-error-msg">Selecciona prioridad</span>}
          </div>
        </div>

        {/* Subtítulo */}
        <div className="campo-referencia">
          <label htmlFor="descripcion_corta">Subtítulo</label>
          <input
            id="descripcion_corta"
            name="descripcion_corta"
            type="text"
            placeholder="Descripción breve del anuncio"
            value={formData.descripcion_corta}
            onChange={onChange}
            maxLength={150}
            className={errores.descripcion_corta ? 'input-error' : ''}
          />
          <span className={`campo-contador${contdescripcion_corta >= 120 ? ' campo-contador-warn' : ''}`}>
            {contdescripcion_corta} / 150
          </span>
          {errores.descripcion_corta && <span className="campo-error-msg">Este campo es obligatorio</span>}
        </div>

        {/* Contenido */}
        <div className="campo-referencia">
          <label htmlFor="contenido">
            Contenido <span className="campo-req">*</span>
          </label>
          <textarea
            id="contenido"
            name="contenido"
            placeholder="Describe el anuncio con detalle…"
            value={formData.contenido}
            onChange={onChange}
            className={errores.contenido ? 'input-error' : ''}
          />
          {errores.contenido && <span className="campo-error-msg">El contenido es obligatorio</span>}
        </div>

        {/* Switch — Anuncio Permanente */}
        <div className="switch-container">
          <div className="switch-info">
            <span className="switch-label">Anuncio permanente</span>
            <span className="switch-desc">Sin fecha de expiración</span>
          </div>
          <label className="switch">
            <input
              name="esPermanente"
              type="checkbox"
              checked={formData.esPermanente}
              onChange={onChange}
            />
            <span className="slider-toggle" />
          </label>
        </div>

        {formData.esPermanente && (
          <div className="alerta-info alerta-azul">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>Los anuncios permanentes comparten el carrusel en formato reducido. Evita mantener demasiados activos simultáneamente.</span>
          </div>
        )}

        {/* Switch — Estado solo esta disponible para editar */}
        {modoEdicion && (
          <div className="switch-container">
            <div className="switch-info">
              <span className="switch-label">Estado del anuncio</span>
              <span className={`switch-desc ${formData.estado ? 'switch-desc-activo' : 'switch-desc-inactivo'}`}>
                {formData.estado ? 'Activo — visible en pantallas' : 'Inactivo — oculto'}
              </span>
            </div>
            <label className="switch">
              <input
                name="estado"
                type="checkbox"
                checked={formData.estado}
                onChange={onChange}
              />
              <span className="slider-toggle" />
            </label>
          </div>
        )}

      </div>
    </section>
  );
};

export default FormInfo;