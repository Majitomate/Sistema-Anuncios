import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from '../styles/dashboard.module.css';
import UserProfilePanel from '../pages/UserProfilePanel';

const NavbarDashboard = ({ puedeEditar, vistaActual, onCambiarVista, onCrearAnuncio, onGestionUsuarios }) => {
    const navigate = useNavigate();
    const nombre   = localStorage.getItem('sutus_nombre') || localStorage.getItem('sutus_rol') || 'Usuario';
    const rol      = localStorage.getItem('sutus_rol');

    const [panelAbierto, setPanelAbierto] = useState(false);

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
            localStorage.removeItem('sutus_token');
            localStorage.removeItem('sutus_rol');
            localStorage.removeItem('sutus_nombre');
            localStorage.removeItem('sutus_email');
            navigate('/login', { replace: true });
        }
    };

    return (
        <>
            <nav className={styles.navbar}>
                {/* ── Logo + Título ── */}
                <div className={styles.navbarTitleGroup}>
                    <img src="/logo-sutus.svg" alt="SUTUS" className={styles.navbarLogo} />
                    <span className={styles.navbarTitle}>Dashboard de Anuncios SUTUS</span>
                </div>

                {/* ── Acciones ── */}
                <div className={styles.navbarActions}>

                    {/* Grupo izquierdo: acciones primarias */}
                    <div className={styles.navbarGrupo}>
                        {puedeEditar && (
                            <button type="button" className={styles.navBtn + ' ' + styles.navBtnNaranja} onClick={onCrearAnuncio}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                <span className={styles.navBtnText}>Nuevo Anuncio</span>
                            </button>
                        )}

                        {rol === 'admin' && (
                            <button type="button" className={styles.navBtn + ' ' + styles.navBtnGhost} onClick={onGestionUsuarios}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 010 7.75"/>
                                </svg>
                                <span className={styles.navBtnText}>Usuarios</span>
                            </button>
                        )}

                        <button type="button" className={styles.navBtn + ' ' + styles.navBtnGhost} onClick={() => navigate('/display')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <path d="M8 21h8M12 17v4"/>
                            </svg>
                            <span className={styles.navBtnText}>Modo Visualización</span>
                        </button>
                    </div>

                    {/* Separador */}
                    <div className={styles.navSeparador} />

                    {/* Selector de vista */}
                    <div className={styles.viewSwitcher}>
                        <button
                            className={`${styles.switchBtn} ${vistaActual === 'cuadricula' ? styles.active : ''}`}
                            onClick={() => onCambiarVista('cuadricula')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                            <span className={styles.navBtnText}>Tarjetas</span>
                        </button>
                        <button
                            className={`${styles.switchBtn} ${vistaActual === 'lista' ? styles.active : ''}`}
                            onClick={() => onCambiarVista('lista')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                                <line x1="8" y1="18" x2="21" y2="18"/>
                                <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
                            </svg>
                            <span className={styles.navBtnText}>Lista</span>
                        </button>
                    </div>

                    {/* Separador */}
                    <div className={styles.navSeparador} />

                    {/* Usuario + Salir */}
                    <div className={styles.navbarUsuarioWrap}>
                        {/* Botón de perfil — abre el panel lateral */}
                        <button
                            type="button"
                            className={styles.navbarUsuarioBtn}
                            onClick={() => setPanelAbierto(true)}
                            title="Ver mi perfil"
                        >
                            <span className={styles.navbarAvatar}>
                                {nombre.charAt(0).toUpperCase()}
                            </span>
                            <span className={styles.navbarUsuarioNombre}>{nombre}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12" style={{ opacity: 0.5 }}>
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>

                        <button type="button" className={styles.navBtn + ' ' + styles.navBtnSalir} onClick={handleLogout}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span className={styles.navBtnText}>Salir</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Panel de perfil */}
            <UserProfilePanel
                open={panelAbierto}
                onClose={() => setPanelAbierto(false)}
            />
        </>
    );
};

export default NavbarDashboard;