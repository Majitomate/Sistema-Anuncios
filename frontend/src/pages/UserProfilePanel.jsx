import { useState } from 'react';
import Swal from 'sweetalert2';
import s from '../styles/LoginPage.module.css';
import sp from '../styles/UserProfilePanel.module.css';
import { actualizarPassword } from '../services/usuarios.services';

const UserProfilePanel = ({ open, onClose }) => {
    const nombre = localStorage.getItem('sutus_nombre') || '—';
    const email  = localStorage.getItem('sutus_email')  || '—';
    const rol    = localStorage.getItem('sutus_rol')     || '—';
    const token  = localStorage.getItem('sutus_token');

    const [modo, setModo] = useState('perfil'); // 'perfil' | 'cambiar'
    const [actual, setActual] = useState('');
    const [nueva, setNueva] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [verActual, setVerActual] = useState(false);
    const [verNueva, setVerNueva] = useState(false);
    const [verConf, setVerConf] = useState(false);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);

    const rolesLabel = {
        admin:        'Administrador',
        editor:       'Editor',
        revisor:      'Revisor',
        visualizador: 'Visualizador',
    };

    const resetForm = () => {
        setActual(''); setNueva(''); setConfirmar('');
        setErrores({}); setVerActual(false); setVerNueva(false); setVerConf(false);
    };

    const handleClose = () => {
        resetForm();
        setModo('perfil');
        onClose();
    };

    const validar = () => {
        const errs = {};
        if (!actual)               errs.actual    = 'Ingresa tu contraseña actual';
        if (!nueva)                errs.nueva     = 'Ingresa la nueva contraseña';
        else if (nueva.length < 8) errs.nueva     = 'Mínimo 8 caracteres';
        if (!confirmar)            errs.confirmar = 'Confirma la nueva contraseña';
        else if (nueva !== confirmar) errs.confirmar = 'Las contraseñas no coinciden';
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

const handleCambiar = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);
        try {
            // Usamos nuestro servicio abstraído (Arquitectura Limpia)
            await actualizarPassword(actual, nueva);

            await Swal.fire({
                icon:               'success',
                title:              'Contraseña actualizada',
                text:               'Tu contraseña ha sido cambiada correctamente.',
                confirmButtonColor: '#1b5e20',
                confirmButtonText:  'Listo',
            });
            
            resetForm();
            setModo('perfil');
            
        } catch (err) {
            Swal.fire({
                icon:               'error',
                title:              'Error',
                text:               err.message, // Mostrará "La contraseña actual es incorrecta" si falla
                confirmButtonColor: '#1b5e20',
            });
        } finally {
            setLoading(false);
        }
    };

    const EyeBtn = ({ visible, toggle, label }) => (
        <button type="button" className={sp.eyeBtn} onClick={toggle} aria-label={label}>
            {visible ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            )}
        </button>
    );

    return (
        <>
            {/* Overlay */}
            <div
                className={`${sp.overlay} ${open ? sp.overlayOpen : ''}`}
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Panel lateral */}
            <aside className={`${sp.panel} ${open ? sp.panelOpen : ''}`} role="dialog" aria-label="Perfil de usuario">

                {/* Header del panel */}
                <div className={sp.panelHeader}>
                    <div className={sp.panelHeaderLeft}>
                        <div className={sp.avatar}>
                            {nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className={sp.panelNombre}>{nombre}</p>
                            <span className={sp.rolBadge}>{rolesLabel[rol] ?? rol}</span>
                        </div>
                    </div>
                    <button className={sp.cerrarBtn} onClick={handleClose} aria-label="Cerrar panel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className={sp.tabs}>
                    <button
                        className={`${sp.tab} ${modo === 'perfil' ? sp.tabActivo : ''}`}
                        onClick={() => { resetForm(); setModo('perfil'); }}
                    >
                        Mi perfil
                    </button>
                    <button
                        className={`${sp.tab} ${modo === 'cambiar' ? sp.tabActivo : ''}`}
                        onClick={() => { resetForm(); setModo('cambiar'); }}
                    >
                        Cambiar contraseña
                    </button>
                </div>

                <div className={sp.panelBody}>

                    {/* ── Vista: Perfil ── */}
                    {modo === 'perfil' && (
                        <div className={sp.perfilInfo}>
                            <div className={sp.infoFila}>
                                <span className={sp.infoLabel}>Nombre</span>
                                <span className={sp.infoValor}>{nombre}</span>
                            </div>
                            <div className={sp.infoFila}>
                                <span className={sp.infoLabel}>Correo</span>
                                <span className={sp.infoValor}>{email}</span>
                            </div>
                            <div className={sp.infoFila}>
                                <span className={sp.infoLabel}>Rol</span>
                                <span className={sp.infoValor}>{rolesLabel[rol] ?? rol}</span>
                            </div>
                            <button
                                className={sp.botonCambiarPass}
                                onClick={() => setModo('cambiar')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                                Cambiar contraseña
                            </button>
                        </div>
                    )}

                    {/* ── Vista: Cambiar contraseña ── */}
                    {modo === 'cambiar' && (
                        <form className={sp.formCambio} onSubmit={handleCambiar} noValidate>

                            {/* Contraseña actual */}
                            <div className={s.campo}>
                                <label className={s.label} htmlFor="cp-actual">Contraseña actual</label>
                                <div className={s.inputWrap}>
                                    <span className={s.inputIcono}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="cp-actual"
                                        type={verActual ? 'text' : 'password'}
                                        className={`${s.input} ${errores.actual ? s.inputError : ''}`}
                                        placeholder="Tu contraseña actual"
                                        value={actual}
                                        onChange={(e) => { setActual(e.target.value); setErrores(p => ({ ...p, actual: undefined })); }}
                                        disabled={loading}
                                    />
                                    <EyeBtn visible={verActual} toggle={() => setVerActual(v => !v)} label="Ver contraseña actual" />
                                </div>
                                {errores.actual && <span className={s.mensajeError}>{errores.actual}</span>}
                            </div>

                            {/* Nueva contraseña */}
                            <div className={s.campo}>
                                <label className={s.label} htmlFor="cp-nueva">Nueva contraseña</label>
                                <div className={s.inputWrap}>
                                    <span className={s.inputIcono}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="cp-nueva"
                                        type={verNueva ? 'text' : 'password'}
                                        className={`${s.input} ${errores.nueva ? s.inputError : ''}`}
                                        placeholder="Mínimo 8 caracteres"
                                        value={nueva}
                                        onChange={(e) => { setNueva(e.target.value); setErrores(p => ({ ...p, nueva: undefined })); }}
                                        disabled={loading}
                                    />
                                    <EyeBtn visible={verNueva} toggle={() => setVerNueva(v => !v)} label="Ver nueva contraseña" />
                                </div>
                                {errores.nueva && <span className={s.mensajeError}>{errores.nueva}</span>}
                            </div>

                            {/* Confirmar */}
                            <div className={s.campo}>
                                <label className={s.label} htmlFor="cp-conf">Confirmar contraseña</label>
                                <div className={s.inputWrap}>
                                    <span className={s.inputIcono}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="cp-conf"
                                        type={verConf ? 'text' : 'password'}
                                        className={`${s.input} ${errores.confirmar ? s.inputError : ''}`}
                                        placeholder="Repite tu nueva contraseña"
                                        value={confirmar}
                                        onChange={(e) => { setConfirmar(e.target.value); setErrores(p => ({ ...p, confirmar: undefined })); }}
                                        disabled={loading}
                                    />
                                    <EyeBtn visible={verConf} toggle={() => setVerConf(v => !v)} label="Ver confirmación" />
                                </div>
                                {errores.confirmar && <span className={s.mensajeError}>{errores.confirmar}</span>}
                            </div>

                            <button type="submit" className={s.botonLogin} disabled={loading}>
                                {loading ? (
                                    <span className={s.spinnerWrap}>
                                        <span className={s.spinner} />
                                        Guardando...
                                    </span>
                                ) : 'Guardar contraseña'}
                            </button>

                            <button
                                type="button"
                                className={s.botonSecundario}
                                onClick={() => { resetForm(); setModo('perfil'); }}
                                disabled={loading}
                            >
                                Cancelar
                            </button>

                        </form>
                    )}

                </div>
            </aside>
        </>
    );
};

export default UserProfilePanel;