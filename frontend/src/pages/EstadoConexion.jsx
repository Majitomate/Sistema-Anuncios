import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import EstadoDispositivos from '../components/EstadoDispositivos';
import styles from '../styles/dashboard.module.css';

const EstadoConexion = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem('sutus_rol');
    if (rol !== 'admin') navigate('/dashboard');
  }, [navigate]);

  return (
    <div className={styles.dashboardLayout}>

      {/* ── Navbar reutilizando los estilos del dashboard ── */}
      <nav className={styles.navbar}>
        <div className={styles.navbarTitleGroup}>
          <img src="/logo-sutus.svg" alt="SUTUS" className={styles.navbarLogo} />
          <span className={styles.navbarTitle}>Estado de Conexión</span>
        </div>

        <div className={styles.navbarActions}>
          <div className={styles.navbarGrupo}>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnGhost}`}
              onClick={() => navigate('/dashboard')}
            >
              {/* Flecha izquierda */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                   strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className={styles.navBtnText}>Volver al Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Contenido ── */}
      <EstadoDispositivos />
    </div>
  );
};

export default EstadoConexion;