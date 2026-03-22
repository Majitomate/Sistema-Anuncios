import React, { useState, useRef, useEffect } from 'react';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const DIAS_SEMANA = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

const InputFechaCustom = ({ name, value, onChange, disabled = false, className = '', id }) => {
  const hoy = new Date();
  const fechaActual = value ? new Date(value + 'T12:00:00') : null;

  const [abierto, setAbierto] = useState(false);
  const [mes, setMes] = useState(fechaActual ? fechaActual.getMonth() : hoy.getMonth());
  const [anio, setAnio] = useState(fechaActual ? fechaActual.getFullYear() : hoy.getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Sincronizar mes/año si cambia el valor externo */
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00');
      setMes(d.getMonth());
      setAnio(d.getFullYear());
    }
  }, [value]);

  const formatDisplay = (val) => {
    if (!val) return '';
    const d = new Date(val + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const seleccionarDia = (dia) => {
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    onChange({ target: { name, value: `${anio}-${mm}-${dd}` } });
    setAbierto(false);
  };

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio((a) => a - 1); }
    else setMes((m) => m - 1);
  };

  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio((a) => a + 1); }
    else setMes((m) => m + 1);
  };

  /* Calcular días del mes con offset del primer día */
  const primerDia = new Date(anio, mes, 1).getDay();
  const offsetLunes = primerDia === 0 ? 6 : primerDia - 1;
  const diasEnMes  = new Date(anio, mes + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < offsetLunes; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const esDiaSeleccionado = (dia) => {
    if (!dia || !value) return false;
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    return value === `${anio}-${mm}-${dd}`;
  };

  const esHoy = (dia) => {
    if (!dia) return false;
    return dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
  };

  return (
    <div
      ref={ref}
      className={`input-fecha-custom-wrap ${disabled ? 'input-custom-disabled' : ''}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Trigger */}
      <div
        id={id}
        className={`input-fecha-custom-trigger ${abierto ? 'input-custom-open' : ''} ${!value ? 'input-custom-placeholder' : ''} ${className}`}
        onClick={() => !disabled && setAbierto((p) => !p)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && setAbierto((p) => !p); } }}
        role="button"
        aria-label="Seleccionar fecha"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-custom-icono">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{value ? formatDisplay(value) : 'dd / mm / aaaa'}</span>
      </div>

      {/* Calendario */}
      {abierto && (
        <div className="input-custom-panel fecha-panel">
          {/* Navegación mes/año */}
          <div className="fecha-nav">
            <button type="button" className="fecha-nav-btn" onClick={mesAnterior}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="fecha-nav-titulo">{MESES[mes]} {anio}</span>
            <button type="button" className="fecha-nav-btn" onClick={mesSiguiente}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="fecha-grid-semana">
            {DIAS_SEMANA.map((d) => <span key={d} className="fecha-dia-semana">{d}</span>)}
          </div>

          {/* Celdas de días */}
          <div className="fecha-grid-dias">
            {celdas.map((dia, i) => (
              <button
                key={i}
                type="button"
                className={`fecha-dia-btn
                  ${!dia ? 'fecha-dia-vacio' : ''}
                  ${esDiaSeleccionado(dia) ? 'fecha-dia-seleccionado' : ''}
                  ${esHoy(dia) && !esDiaSeleccionado(dia) ? 'fecha-dia-hoy' : ''}
                `}
                onClick={() => dia && seleccionarDia(dia)}
                disabled={!dia}
              >
                {dia || ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputFechaCustom;