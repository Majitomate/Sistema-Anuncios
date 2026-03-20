import React from 'react';
import { IconoCalendario, IconoReloj } from './Icons';

const FormFechas = ({ formData, esPermanente, onChange }) => (
  <section className="tarjeta-referencia">
    <header className="tarjeta-header-referencia">
      <IconoCalendario />
      <h2>Programación</h2>
    </header>

    <div
      className={`tarjeta-cuerpo-referencia ${
        esPermanente ? 'seccion-deshabilitada' : ''
      }`}
    >
      <div className="subencabezado">Período de Publicación</div>

      <div className="fila-doble-referencia">
        <div className="campo-referencia">
          <label htmlFor="fechaInicio">Fecha de Inicio</label>
          <div className="input-with-icon">
            <IconoCalendario />
            <input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              value={formData.fechaInicio}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="campo-referencia">
          <label htmlFor="fechaFin">Fecha de Fin</label>
          <div className="input-with-icon">
            <IconoCalendario />
            <input
              id="fechaFin"
              name="fechaFin"
              type="date"
              value={formData.fechaFin}
              onChange={onChange}
            />
          </div>
        </div>
      </div>

      <div className="subencabezado" style={{ marginTop: '10px' }}>
        Horario
      </div>

      <div className="fila-doble-referencia">
        <div className="campo-referencia">
          <label htmlFor="horaInicio">Hora Inicio</label>
          <div className="input-with-icon">
            <IconoReloj />
            <input
              id="horaInicio"
              name="horaInicio"
              type="time"
              value={formData.horaInicio}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="campo-referencia">
          <label htmlFor="horaFin">Hora Fin</label>
          <div className="input-with-icon">
            <IconoReloj />
            <input
              id="horaFin"
              name="horaFin"
              type="time"
              value={formData.horaFin}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FormFechas;
