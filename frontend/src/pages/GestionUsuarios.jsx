import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import s from '../styles/GestionUsuarios.module.css';

const API = 'http://localhost:3001';

const ROLES = [
    { value: 'admin',        label: 'Administrador', desc: 'Acceso total al sistema',    color: '#e53935' },
    { value: 'editor',       label: 'Editor',        desc: 'Crear, editar y eliminar',   color: '#43a047' },
    { value: 'revisor',      label: 'Revisor',       desc: 'Editar y visualizar',         color: '#fb8c00' },
    { value: 'visualizador', label: 'Visualizador',  desc: 'Solo visualizar',             color: '#1e88e5' },
];

const ROL_CONFIG = {
    admin:        { color: '#fde8e8', text: '#c62828', border: '#f5c6c6' },
    editor:       { color: '#e8f5e9', text: '#2e7d32', border: '#c8e6c9' },
    revisor:      { color: '#fff3e0', text: '#e65100', border: '#ffe0b2' },
    visualizador: { color: '#e3f2fd', text: '#1565c0', border: '#bbdefb' },
};

const FORM_INICIAL = { nombre: '', email: '', password: '', rol: 'visualizador' };

const GestionUsuarios = ({ onVolver }) => {
    const [usuarios,     setUsuarios]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [vista,        setVista]        = useState('lista');
    const [usuarioEdit,  setUsuarioEdit]  = useState(null);
    const [form,         setForm]         = useState(FORM_INICIAL);
    const [errores,      setErrores]      = useState({});
    const [guardando,    setGuardando]    = useState(false);
    const [verPass,      setVerPass]      = useState(false);

    const token = localStorage.getItem('sutus_token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/usuarios`, { headers });
            const data = await res.json();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch {
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);
    useEffect(() => { document.title = 'Gestión de Usuarios — SUTUS'; }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (errores[name]) setErrores((p) => ({ ...p, [name]: undefined }));
    };

    const validar = () => {
        const errs = {};
        if (!form.nombre.trim())  errs.nombre = 'El nombre es obligatorio';
        if (!form.email.trim())   errs.email  = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido';
        if (vista === 'crear' && !form.password.trim()) errs.password = 'La contraseña es obligatoria';
        if (vista === 'crear' && form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
        if (!form.rol) errs.rol = 'Selecciona un rol';
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCrear = async () => {
        if (!validar()) return;
        setGuardando(true);
        try {
            const res = await fetch(`${API}/usuarios`, {
                method:  'POST',
                headers,
                body:    JSON.stringify({ nombre: form.nombre, email: form.email, password: form.password, rol: form.rol }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message ?? 'Error al crear usuario');
            }
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Usuario creado', showConfirmButton: false, timer: 2500, timerProgressBar: true });
            setVista('lista');
            setForm(FORM_INICIAL);
            fetchUsuarios();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#1b5e20' });
        } finally {
            setGuardando(false);
        }
    };

    const handleEditar = async () => {
        if (!validar()) return;
        setGuardando(true);
        try {
            const body = { nombre: form.nombre, email: form.email, rol: form.rol };
            if (form.password.trim()) body.password = form.password;
            const res = await fetch(`${API}/usuarios/${usuarioEdit.id}`, {
                method:  'PUT',
                headers,
                body:    JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message ?? 'Error al actualizar');
            }
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cambios guardados', showConfirmButton: false, timer: 2500, timerProgressBar: true });
            setVista('lista');
            setForm(FORM_INICIAL);
            setUsuarioEdit(null);
            fetchUsuarios();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#1b5e20' });
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (usuario) => {
        const result = await Swal.fire({
            title:              `¿Eliminar a ${usuario.nombre}?`,
            text:               'Esta acción no se puede deshacer.',
            icon:               'warning',
            showCancelButton:   true,
            confirmButtonColor: '#d33',
            cancelButtonColor:  '#94a3b8',
            confirmButtonText:  'Sí, eliminar',
            cancelButtonText:   'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            const res = await fetch(`${API}/usuarios/${usuario.id}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error('Error al eliminar');
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Usuario eliminado', showConfirmButton: false, timer: 2000 });
            fetchUsuarios();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el usuario.' });
        }
    };

    const abrirEditar = (u) => {
        setUsuarioEdit(u);
        setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
        setErrores({});
        setVista('editar');
    };

    const abrirCrear = () => {
        setForm(FORM_INICIAL);
        setErrores({});
        setVista('crear');
    };

    const handleCancelar = () => {
        setVista('lista');
        setForm(FORM_INICIAL);
        setUsuarioEdit(null);
        setErrores({});
    };

    const esCrear = vista === 'crear';

    // ── Render lista ─────────────────────────────────────────────────────────
    const renderLista = () => (
        <div className={s.pagina}>
            <div className={s.topBar}>
                <div className={s.topBarIzq}>
                    <button type="button" className={s.botonVolver} onClick={onVolver}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div>
                        <h1 className={s.pageTitle}>Gestión de Usuarios</h1>
                        <p className={s.pageSubtitle}>Administra los usuarios del sistema SUTUS</p>
                    </div>
                </div>
                <button type="button" className={s.botonNuevo} onClick={abrirCrear}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Nuevo Usuario
                </button>
            </div>

            <div className={s.card}>
                <div className={s.cardHeader}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                        <path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    <h2 className={s.cardTitle}>Usuarios Registrados</h2>
                    <span className={s.contador}>({usuarios.length})</span>
                </div>

                {loading ? (
                    <div className={s.estadoCentro}><div className={s.spinner}/><p>Cargando usuarios...</p></div>
                ) : usuarios.length === 0 ? (
                    <div className={s.estadoCentro}>
                        <p>No hay usuarios registrados.</p>
                    </div>
                ) : (
                    <table className={s.tabla}>
                        <thead>
                        <tr>
                            <th>USUARIO</th>
                            <th>CORREO</th>
                            <th>ROL</th>
                            <th>ID</th>
                            <th>ACCIONES</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usuarios.map((u, i) => {
                            const rc = ROL_CONFIG[u.rol] ?? ROL_CONFIG.visualizador;
                            return (
                                <tr key={u.id}>
                                    <td>
                                        <div className={s.usuarioCell}>
                                            <div className={s.avatar} style={{ background: rc.color, color: rc.text }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                            </div>
                                            <span className={s.nombreUsuario}>{u.nombre}</span>
                                        </div>
                                    </td>
                                    <td className={s.emailCell}>{u.email}</td>
                                    <td>
                                            <span className={s.badgeRol} style={{ background: rc.color, color: rc.text, borderColor: rc.border }}>
                                                <span className={s.badgeDot} style={{ background: rc.text }} />
                                                {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                                            </span>
                                    </td>
                                    <td className={s.idCell}>#{i}</td>
                                    <td>
                                        <div className={s.acciones}>
                                            <button type="button" className={s.btnEditar} onClick={() => abrirEditar(u)} title="Editar">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            {u.rol !== 'admin' && (
                                                <button type="button" className={s.btnEliminar} onClick={() => handleEliminar(u)} title="Eliminar">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                                        <path d="M10 11v6M14 11v6"/>
                                                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    // ── Render formulario ────────────────────────────────────────────────────
    const renderForm = () => (
        <div className={s.pagina}>
            {/* Top bar */}
            <div className={s.topBar}>
                <div className={s.topBarIzq}>
                    <button type="button" className={s.botonVolver} onClick={handleCancelar}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div>
                        <h1 className={s.pageTitle}>Gestión de Usuarios</h1>
                        <p className={s.pageSubtitle}>Administra los usuarios del sistema SUTUS</p>
                    </div>
                </div>
                <button type="button" className={s.botonCancelarTop} onClick={handleCancelar}>
                    Cancelar
                </button>
            </div>

            {/* Formulario centrado */}
            <div className={s.formCentrado}>
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <h2 className={s.cardTitle}>
                            {esCrear ? 'Agregar Nuevo Usuario' : `Editar — ${usuarioEdit?.nombre}`}
                        </h2>
                    </div>

                    <div className={s.formGrid}>
                        {/* Nombre */}
                        <div className={s.campo}>
                            <label className={s.label}>NOMBRE</label>
                            <div className={s.inputWrap}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={s.inputIcon} width="15" height="15">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <input
                                    name="nombre"
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    className={`${s.input} ${errores.nombre ? s.inputError : ''}`}
                                />
                            </div>
                            {errores.nombre && <span className={s.errorMsg}>{errores.nombre}</span>}
                        </div>

                        {/* Email */}
                        <div className={s.campo}>
                            <label className={s.label}>CORREO ELECTRÓNICO</label>
                            <div className={s.inputWrap}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={s.inputIcon} width="15" height="15">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="usuario@unisierra.edu.mx"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`${s.input} ${errores.email ? s.inputError : ''}`}
                                />
                            </div>
                            {errores.email && <span className={s.errorMsg}>{errores.email}</span>}
                        </div>

                        {/* Contraseña — ocupa toda la fila */}
                        <div className={`${s.campo} ${s.campoFull}`}>
                            <label className={s.label}>
                                CONTRASEÑA{' '}
                                {!esCrear && <span className={s.labelHint}>(dejar vacío para no cambiar)</span>}
                            </label>
                            <div className={s.inputWrap}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={s.inputIcon} width="15" height="15">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                                <input
                                    name="password"
                                    type={verPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`${s.input} ${errores.password ? s.inputError : ''}`}
                                />
                                <button type="button" className={s.togglePass} onClick={() => setVerPass((v) => !v)}>
                                    {verPass ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errores.password && <span className={s.errorMsg}>{errores.password}</span>}
                        </div>
                    </div>

                    {/* Tipo de permiso */}
                    <div className={s.rolesSection}>
                        <label className={s.label}>TIPO DE PERMISO</label>
                        <div className={s.rolesGrid}>
                            {ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    className={`${s.rolCard} ${form.rol === r.value ? s.rolCardActivo : ''}`}
                                    onClick={() => { setForm((p) => ({ ...p, rol: r.value })); setErrores((p) => ({ ...p, rol: undefined })); }}
                                    style={form.rol === r.value ? { borderColor: r.color, background: `${r.color}18` } : {}}
                                >
                                    <div className={s.rolIcono} style={{ background: `${r.color}20`, color: r.color }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        </svg>
                                    </div>
                                    <span className={s.rolNombre}>{r.label}</span>
                                    <span className={s.rolDesc}>{r.desc}</span>
                                </button>
                            ))}
                        </div>
                        {errores.rol && <span className={s.errorMsg}>{errores.rol}</span>}
                    </div>

                    {/* Footer */}
                    <div className={s.formFooter}>
                        <button type="button" className={s.btnCancelar} onClick={handleCancelar}>Cancelar</button>
                        <button
                            type="button"
                            className={s.btnGuardar}
                            onClick={esCrear ? handleCrear : handleEditar}
                            disabled={guardando}
                        >
                            {guardando ? (
                                <><span className={s.spinnerBtn}/>{esCrear ? 'Creando...' : 'Guardando...'}</>
                            ) : (
                                esCrear ? 'CREAR USUARIO' : 'GUARDAR CAMBIOS'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return vista === 'lista' ? renderLista() : renderForm();
};

export default GestionUsuarios;