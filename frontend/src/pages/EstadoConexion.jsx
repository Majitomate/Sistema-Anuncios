import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EstadoDispositivos from '../components/EstadoDispositivos';
import NavbarDashboard from '../components/NavbarDashboard';
import styles from '../styles/dashboard.module.css';

const EstadoConexion = () => {
  const navigate = useNavigate();
  const rol = localStorage.getItem('sutus_rol');
  const puedeEditar = rol === 'admin' || rol === 'editor';
  const [vistaActual, setVistaActual] = useState('cuadricula');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Si no es admin, lo sacamos de esta pantalla
    if (rol !== 'admin') {
      navigate('/dashboard');
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, rol]);

  const handleCrearAnuncio = () => {
    navigate('/dashboard'); // Lo regresamos al dashboard para crear
  };

  const handleGestionUsuarios = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.dashboardLayout}>

      <NavbarDashboard
        puedeEditar={puedeEditar}
        vistaActual={vistaActual}
        onCambiarVista={(v) => { if (!isMobile || v === 'cuadricula') setVistaActual(v); }}
        onCrearAnuncio={handleCrearAnuncio}
        onGestionUsuarios={handleGestionUsuarios}
      />

      {/* ── Contenido ── */}
      <EstadoDispositivos />
    </div>
  );
};

export default EstadoConexion;