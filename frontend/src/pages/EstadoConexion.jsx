import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import EstadoDispositivos from '../components/EstadoDispositivos';
import s from '../styles/dashboard.module.css';

const EstadoConexion = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar que es admin
    const rol = localStorage.getItem('sutus_rol');
    if (rol !== 'admin') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleVolver = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <header className={s.header}>
        <div className={s.headerContent}>
          <button className={s.botonVolver} onClick={handleVolver}>
            ← Volver
          </button>
          <h1>Panel de Control - Estado de Conexión</h1>
        </div>
      </header>
      <EstadoDispositivos />
    </div>
  );
};

export default EstadoConexion;
