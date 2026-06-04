import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from '../styles/dashboard.module.css';
import UserProfilePanel from '../pages/UserProfilePanel';
import { obtenerUsuarioActivo } from '../services/usuarios.services';

// 👇 Agregamos mostrarSelectorVista = true por defecto
const NavbarDashboard = ({ puedeEditar, vistaActual, onCambiarVista, onCrearAnuncio, onGestionUsuarios, mostrarSelectorVista = true }) => {
    const navigate = useNavigate();

    // 🛡️ FUNCIONES SEGURAS:
    const safeCambiarVista = onCambiarVista || (() => navigate('/dashboard'));
    const safeCrearAnuncio = onCrearAnuncio || (() => navigate('/dashboard', { state: { vista: 'crear' } }));
    const safeGestionUsuarios = onGestionUsuarios || (() => navigate('/dashboard'));

    const [usuarioActivo, setUsuarioActivo] = useState({
        nombre: localStorage.getItem('sutus_nombre') || 'Usuario',
        email: localStorage.getItem('sutus_email') || '',
        rol: localStorage.getItem('sutus_rol') || 'visualizador',
    });

    const { nombre, rol } = usuarioActivo;

    const [panelAbierto,  setPanelAbierto]  = useState(false);
    const [menuAbierto,   setMenuAbierto]   = useState(false);
    const [isMobile,      setIsMobile]      = useState(() => window.innerWidth < 768);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('sutus_token');
        if (!token) return;

        const fetchUsuario = async () => {
            try {
                const usuario = await obtenerUsuarioActivo();
                setUsuarioActivo(usuario);
                localStorage.setItem('sutus_nombre', usuario.nombre);
                localStorage.setItem('sutus_email', usuario.email);
                localStorage.setItem('sutus_rol', usuario.rol);
            } catch (err) {
                console.error('[Error obtener usuario activo]:', err);
            }
        };

        fetchUsuario();
    }, []);

    const accion = (fn) => () => { setMenuAbierto(false); fn && fn(); };

    const handleLogout = async () => {
        setMenuAbierto(false);
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
                <div className={styles.navbarTitleGroup}>
                    <img 
                    src="/logo-sutus.svg" 
                    alt="SUTUS" 
                    className={styles.navbarLogo}
                    onClick={() => navigate('/')} 
                    style={{ cursor: 'pointer' }}
                     />
                    <span className={styles.navbarTitle}>Dashboard de Anuncios SUTUS</span>
                    <span className={styles.navbarTitleCorto}>SUTUS</span>
                </div>

                <div className={styles.navbarActions}>
                    <div className={styles.navbarGrupo}>
                        {puedeEditar && (
                            // 👇 Botón Desktop - usa safeCrearAnuncio
                            <button type="button" className={`${styles.navBtn} ${styles.navBtnNaranja}`} onClick={safeCrearAnuncio}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                <span className={styles.navBtnText}>Nuevo Anuncio</span>
                            </button>
                        )}

                        {rol === 'admin' && (
                            // 👇 Botón Desktop - usa safeGestionUsuarios
                            <button type="button" className={`${styles.navBtn} ${styles.navBtnGhost}`} onClick={safeGestionUsuarios}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 010 7.75"/>
                                </svg>
                                <span className={styles.navBtnText}>Usuarios</span>
                            </button>
                        )}

                        {rol === 'admin' && (
                            <button type="button" className={`${styles.navBtn} ${styles.navBtnGhost}`} onClick={() => navigate('/estado-conexion')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                    <circle cx="12" cy="12" r="10"/>
                                    <circle cx="12" cy="12" r="6" fill="currentColor"/>
                                </svg>
                                <span className={styles.navBtnText}>Conexión</span>
                            </button>
                        )}

                        <button type="button" className={`${styles.navBtn} ${styles.navBtnGhost}`} onClick={() => navigate('/display')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <path d="M8 21h8M12 17v4"/>
                            </svg>
                            <span className={styles.navBtnText}>Visualización</span>
                        </button>
                    </div>

                    {/* 👇 Ocultar el selector si mostrarSelectorVista es false */}
                    {!isMobile && mostrarSelectorVista && <>
                        <div className={`${styles.navSeparador} ${styles.navSeparadorDesktop}`} />
                        <div className={`${styles.viewSwitcher} ${styles.viewSwitcherDesktop}`}>
                            <button
                                className={`${styles.switchBtn} ${vistaActual === 'cuadricula' ? styles.active : ''}`}
                                onClick={() => safeCambiarVista('cuadricula')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                                </svg>
                                <span className={styles.navBtnText}>Tarjetas</span>
                            </button>
                            <button
                                className={`${styles.switchBtn} ${vistaActual === 'lista' ? styles.active : ''}`}
                                onClick={() => safeCambiarVista('lista')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
                                </svg>
                                <span className={styles.navBtnText}>Lista</span>
                            </button>
                        </div>
                        <div className={`${styles.navSeparador} ${styles.navSeparadorDesktop}`} />
                    </>}

                    <div className={styles.navbarUsuarioWrap}>
                        <button type="button" className={styles.navbarUsuarioBtn} onClick={() => setPanelAbierto(true)}>
                            <span className={styles.navbarAvatar}>{nombre.charAt(0).toUpperCase()}</span>
                            <span className={styles.navbarUsuarioNombre}>{nombre}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12" style={{ opacity: 0.5 }}>
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <button type="button" className={`${styles.navBtn} ${styles.navBtnSalir} ${styles.btnSalirDesktop}`} onClick={handleLogout}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span className={styles.navBtnText}>Salir</span>
                        </button>
                    </div>
                </div>

                <div className={styles.navbarMobile} ref={menuRef}>
                    {/* 👇 Ocultar el selector en móvil si mostrarSelectorVista es false */}
                    {!isMobile && mostrarSelectorVista && (
                        <div className={styles.viewSwitcherMobile}>
                            <button className={`${styles.switchBtnMobile} ${vistaActual === 'cuadricula' ? styles.active : ''}`} onClick={() => safeCambiarVista('cuadricula')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                                </svg>
                            </button>
                            <button className={`${styles.switchBtnMobile} ${vistaActual === 'lista' ? styles.active : ''}`} onClick={() => safeCambiarVista('lista')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    )}

                    <button type="button" className={styles.navbarAvatarBtn} onClick={() => { setMenuAbierto(false); setPanelAbierto(true); }}>
                        <span className={styles.navbarAvatar}>{nombre.charAt(0).toUpperCase()}</span>
                    </button>

                    <button type="button" className={`${styles.hamburger} ${menuAbierto ? styles.hamburgerOpen : ''}`} onClick={() => setMenuAbierto(v => !v)}>
                        <span /><span /><span />
                    </button>

                    {menuAbierto && (
                        <div className={styles.mobileMenu}>
                            {puedeEditar && (
                                // 👇 Botón Móvil - usa safeCrearAnuncio
                                <button className={`${styles.mobileMenuItem} ${styles.mobileMenuItemNaranja}`} onClick={accion(safeCrearAnuncio)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="15" height="15">
                                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    Nuevo Anuncio
                                </button>
                            )}

                            {rol === 'admin' && (
                                // 👇 Botón Móvil - usa safeGestionUsuarios
                                <button className={styles.mobileMenuItem} onClick={accion(safeGestionUsuarios)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 010 7.75"/>
                                    </svg>
                                    Gestión de Usuarios
                                </button>
                            )}

                            {rol === 'admin' && (
                                <button className={styles.mobileMenuItem} onClick={accion(() => navigate('/estado-conexion'))}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15">
                                        <circle cx="12" cy="12" r="10"/>
                                        <circle cx="12" cy="12" r="6" fill="currentColor"/>
                                    </svg>
                                    Estado de Conexión
                                </button>
                            )}

                            <button className={styles.mobileMenuItem} onClick={accion(() => navigate('/display'))}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15">
                                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                                    <path d="M8 21h8M12 17v4"/>
                                </svg>
                                Modo Visualización
                            </button>

                            <div className={styles.mobileMenuDivider} />

                            <button className={`${styles.mobileMenuItem} ${styles.mobileMenuItemSalir}`} onClick={handleLogout}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <UserProfilePanel open={panelAbierto} onClose={() => setPanelAbierto(false)} />
        </>
    );
};

export default NavbarDashboard;