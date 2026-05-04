import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from '../styles/dashboard.module.css';

const NavbarDashboard = ({ puedeEditar, vistaActual, onCambiarVista, onCrearAnuncio }) => {
    const navigate = useNavigate();
    const nombre   = localStorage.getItem('sutus_nombre') || localStorage.getItem('sutus_rol') || 'Usuario';

    const handleLogout = async () => {
        const result = await Swal.fire({
            title:              '¿Cerrar sesión?',
            icon:               'question',
            showCancelButton:   true,
            confirmButtonColor: '#1b5e20',
            cancelButtonColor:  '#94a3b8',
            confirmButtonText:  'Sí, salir',
            cancelButtonText:   'Cancelar',
        });
        if (result.isConfirmed) {
            localStorage.clear(); // Borra todo de golpe de forma segura
            navigate('/login', { replace: true });
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarTitleGroup}>
                <img src="/logo-sutus.svg" alt="SUTUS" className={styles.navbarLogo} />
                <span className={styles.navbarTitle}>Dashboard</span>
            </div>

            <div className={styles.navbarActions}>
                {puedeEditar && (
                    <button type="button" className={styles.navbarActionButton} onClick={onCrearAnuncio} title="Nuevo Anuncio">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span className={styles.textoMovilOculto}>Nuevo</span>
                    </button>
                )}

                <div className={styles.viewSwitcher}>
                    <button
                        className={`${styles.switchBtn} ${vistaActual === 'cuadricula' ? styles.active : ''}`}
                        onClick={() => onCambiarVista('cuadricula')}
                        title="Vista de Tarjetas"
                    >
                        🔲 <span className={styles.textoMovilOculto}>Tarjetas</span>
                    </button>
                    <button
                        className={`${styles.switchBtn} ${vistaActual === 'lista' ? styles.active : ''}`}
                        onClick={() => onCambiarVista('lista')}
                        title="Vista de Lista"
                    >
                        📄 <span className={styles.textoMovilOculto}>Lista</span>
                    </button>
                </div>

                <div className={styles.navbarUsuarioWrap}>
                    <span className={styles.navbarUsuarioNombre}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                        <span className={styles.textoMovilOculto}>{nombre}</span>
                    </span>

                    <button type="button" className={styles.botonKiosco} onClick={() => navigate('/display')} title="Ver Kiosco Público">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                            <path d="M8 21h8M12 17v4"/>
                        </svg>
                        <span className={styles.textoMovilOculto}>Kiosco</span>
                    </button>

                    <button type="button" className={styles.botonSalir} onClick={handleLogout} title="Cerrar sesión">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span className={styles.textoMovilOculto}>Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavbarDashboard;