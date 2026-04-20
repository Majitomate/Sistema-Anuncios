import React, { useState, useRef, useEffect } from 'react';

const HORAS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const InputHoraCustom = ({ name, value, onChange, disabled = false, className = '', id }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const hora    = value ? value.split(':')[0] : '';
  const minutos = value ? value.split(':')[1] : '';

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const seleccionarHora = (h) => {
    const m = minutos || '00';
    onChange({ target: { name, value: `${h}:${m}` } });
  };

  const seleccionarMinuto = (m) => {
    const h = hora || '08';
    onChange({ target: { name, value: `${h}:${m}` } });
  };

  /* Scroll al elemento seleccionado al abrir */
  const horaRef    = useRef(null);
  const minutoRef  = useRef(null);

  useEffect(() => {
    if (abierto) {
      setTimeout(() => {
        if (horaRef.current) {
          const sel = horaRef.current.querySelector('.hora-opcion-activa');
          if (sel) sel.scrollIntoView({ block: 'center' });
        }
        if (minutoRef.current) {
          const sel = minutoRef.current.querySelector('.hora-opcion-activa');
          if (sel) sel.scrollIntoView({ block: 'center' });
        }
      }, 50);
    }
  }, [abierto]);

  return (
    <div
      ref={ref}
      className={`input-hora-custom-wrap ${disabled ? 'input-custom-disabled' : ''}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Trigger */}
      <div
        id={id}
        className={`input-hora-custom-trigger ${abierto ? 'input-custom-open' : ''} ${!value ? 'input-custom-placeholder' : ''} ${className}`}
        onClick={() => !disabled && setAbierto((p) => !p)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && setAbierto((p) => !p); } }}
        role="button"
        aria-label="Seleccionar hora"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-custom-icono">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{value ? `${hora}:${minutos}` : 'hh : mm'}</span>
      </div>

      {/* Panel hora */}
      {abierto && (
        <div className="input-custom-panel hora-panel">
          <div className="hora-columnas">
            {/* Horas */}
            <div className="hora-columna-wrap">
              <span className="hora-columna-label">Hora</span>
              <div className="hora-columna" ref={horaRef}>
                {HORAS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`hora-opcion ${hora === h ? 'hora-opcion-activa' : ''}`}
                    onClick={() => seleccionarHora(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <span className="hora-separador">:</span>

            {/* Minutos */}
            <div className="hora-columna-wrap">
              <span className="hora-columna-label">Min</span>
              <div className="hora-columna" ref={minutoRef}>
                {MINUTOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`hora-opcion ${minutos === m ? 'hora-opcion-activa' : ''}`}
                    onClick={() => seleccionarMinuto(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputHoraCustom;