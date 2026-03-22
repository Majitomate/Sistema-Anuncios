import React, { useState, useRef, useEffect } from 'react';

const SelectCustom = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción',
  disabled = false,
  className = '',
  id,
}) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const opcionSeleccionada = options.find((o) => String(o.value) === String(value));

  /* Cerrar al hacer clic fuera */
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const seleccionar = (opcion) => {
    if (disabled) return;
    onChange({ target: { name, value: opcion.value } });
    setAbierto(false);
  };

  const toggleAbierto = () => {
    if (!disabled) setAbierto((p) => !p);
  };

  /* Navegación por teclado */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAbierto(); }
    if (e.key === 'Escape') setAbierto(false);
    if (e.key === 'ArrowDown' && abierto) {
      const idx = options.findIndex((o) => String(o.value) === String(value));
      if (idx < options.length - 1) seleccionar(options[idx + 1]);
    }
    if (e.key === 'ArrowUp' && abierto) {
      const idx = options.findIndex((o) => String(o.value) === String(value));
      if (idx > 0) seleccionar(options[idx - 1]);
    }
  };

  return (
    <div
      ref={ref}
      className={`select-custom-wrap ${disabled ? 'select-custom-disabled' : ''} ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Trigger */}
      <div
        id={id}
        role="combobox"
        aria-expanded={abierto}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        className={`select-custom-trigger ${abierto ? 'select-custom-trigger-open' : ''} ${!value ? 'select-custom-placeholder' : ''}`}
        onClick={toggleAbierto}
        onKeyDown={handleKeyDown}
      >
        <span className="select-custom-valor">
          {opcionSeleccionada ? opcionSeleccionada.label : placeholder}
        </span>
        <svg
          className={`select-custom-chevron ${abierto ? 'select-custom-chevron-open' : ''}`}
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {abierto && (
        <ul
          role="listbox"
          className="select-custom-lista"
        >
          {options.map((opcion) => {
            const activa = String(opcion.value) === String(value);
            return (
              <li
                key={opcion.value}
                role="option"
                aria-selected={activa}
                className={`select-custom-opcion ${activa ? 'select-custom-opcion-activa' : ''}`}
                onClick={() => seleccionar(opcion)}
              >
                {activa && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                <span>{opcion.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelectCustom;