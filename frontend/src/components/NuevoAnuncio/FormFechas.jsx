import React from 'react';
import { IconoCalendario, IconoReloj } from './Icons';
import InputFechaCustom from './InputFechaCustom';
import InputHoraCustom from './InputHoraCustom';

const FormFechas = ({ formData, esPermanente, onChange, errores = {} }) => {
  const requiere3Dias =
    !esPermanente &&
    (String(formData.tipo).toLowerCase() === 'votacion' ||
      String(formData.tipo).toLowerCase() === 'votación' ||
      String(formData.prioridad).toLowerCase() === 'alta' ||
      String(formData.prioridad) === '3');

  return (
    <section className="tarjeta-referencia">
      <header className="tarjeta-header-referencia">
        <div className="tarjeta-header-icono" style={{ backgroundColor: '#fff3e0' }}>
          <IconoCalendario />
        </div>
        <h2>Programación</h2>
      </header>

      <div className={`tarjeta-cuerpo-referencia ${esPermanente ? 'seccion-deshabilitada' : ''}`}>

        {esPermanente && (
          <div className="alerta-info alerta-verde">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5H5z"/>
              <path d="M15 3v5h5M9 17v-5M12 17v-8M15 17v-3"/>
            </svg>
            <span><strong>Anuncio permanente:</strong> la configuración de fechas se ignorará. Este anuncio no caducará.</span>
          </div>
        )}

        {requiere3Dias && (
          <div className="alerta-info alerta-naranja">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span><strong>Regla del Sindicato:</strong> anuncios de votación o prioridad alta requieren al menos <strong>3 días hábiles</strong> de vigencia.</span>
          </div>
        )}

        <div className="subencabezado">Período de publicación</div>

        <div className="fila-doble-referencia">
          <div className="campo-referencia">
            <label htmlFor="fechaInicio">Fecha inicio</label>
            <InputFechaCustom
              id="fechaInicio"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={onChange}
              disabled={esPermanente}
              className={errores.fechaInicio ? 'input-error' : ''}
            />
            {errores.fechaInicio && <span className="campo-error-msg">La fecha de inicio es obligatoria</span>}
          </div>
          <div className="campo-referencia">
            <label htmlFor="fechaFin">Fecha fin</label>
            <InputFechaCustom
              id="fechaFin"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={onChange}
              disabled={esPermanente}
              className={errores.fechaFin ? 'input-error' : ''}
            />
            {errores.fechaFin && <span className="campo-error-msg">La fecha de fin es obligatoria</span>}
          </div>
        </div>

        <div className="subencabezado">Horario</div>

        <div className="fila-doble-referencia">
          <div className="campo-referencia">
            <label htmlFor="horaInicio">Hora inicio</label>
            <InputHoraCustom
              id="horaInicio"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={onChange}
              disabled={esPermanente}
              className={errores.horaInicio ? 'input-error' : ''}
            />
          </div>
          <div className="campo-referencia">
            <label htmlFor="horaFin">Hora fin</label>
            <InputHoraCustom
              id="horaFin"
              name="horaFin"
              value={formData.horaFin}
              onChange={onChange}
              disabled={esPermanente}
              className={errores.horaFin ? 'input-error' : ''}
            />
          </div>
        </div>

        <p className="campo-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          El anuncio se ocultará automáticamente al llegar a la fecha de fin
        </p>

      </div>
    </section>
  );
};

export default FormFechas;