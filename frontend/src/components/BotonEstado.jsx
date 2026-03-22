import React, { useState } from 'react';
import s from '../styles/PanelControl.module.css';

const BotonEstado = ({ id, estado, onToggle }) => {
  const [cargando, setCargando] = useState(false);

  const handleClick = async () => {
    if (cargando) return;
    setCargando(true);
    try {
      await onToggle(id, !estado);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cargando}
      className={`${s.botonEstado} ${estado ? s.botonEstadoActivo : s.botonEstadoInactivo}`}
      title={estado ? 'Haz clic para desactivar' : 'Haz clic para activar'}
    >
      <span className={s.botonEstadoPunto} />
      {cargando ? 'Guardando...' : estado ? 'Activo' : 'Inactivo'}
    </button>
  );
};

export default BotonEstado;