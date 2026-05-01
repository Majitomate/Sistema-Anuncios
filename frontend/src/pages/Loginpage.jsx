import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import s from '../styles/LoginPage.module.css';

// admin, editor, revisor → dashboard | visualizador → /display
const rutaPorRol = (rol) =>
    rol === 'visualizador' ? '/display' : '/dashboard';

const LoginPage = () => {
    const navigate           = useNavigate();
    const { login, loading } = useAuth();

    const [email,      setEmail]      = useState('');
    const [password,   setPassword]   = useState('');
    const [verPass,    setVerPass]    = useState(false);
    const [errores,    setErrores]    = useState({});

    // Si ya hay sesión activa, redirigir
    useEffect(() => {
        const token = localStorage.getItem('sutus_token');
        const rol   = localStorage.getItem('sutus_rol');
        if (token && rol) navigate(rutaPorRol(rol), { replace: true });
    }, [navigate]);

    useEffect(() => { document.title = 'Iniciar sesión — SUTUS'; }, []);

    const validar = () => {
        const errs = {};
        if (!email.trim())    errs.email    = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            errs.email = 'Ingresa un correo válido';
        if (!password.trim()) errs.password = 'La contraseña es obligatoria';
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        try {
            const rol = await login(email.trim(), password);
            navigate(rutaPorRol(rol), { replace: true });
        } catch (err) {
            Swal.fire({
                icon:               'error',
                title:              'Error al iniciar sesión',
                text:               err.message,
                confirmButtonText:  'Intentar de nuevo',
                confirmButtonColor: '#1b5e20',
            });
        }
    };

    const limpiarError = (campo) => (e) => {
        if (campo === 'email')    setEmail(e.target.value);
        if (campo === 'password') setPassword(e.target.value);
        if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
    };

    return (
        <div className={s.pagina}>

            {/* Círculos decorativos de fondo */}
            <div className={s.fondo}>
                <div className={s.fondoCirculo1} />
                <div className={s.fondoCirculo2} />
                <div className={s.fondoCirculo3} />
            </div>

            <main className={s.tarjeta}>

                {/* Logo + título */}
                <header className={s.encabezado}>
                    <div className={s.logoWrap}>
                        <img
                            src="/logo-sutus.svg"
                            alt="SUTUS"
                            className={s.logo}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <h1 className={s.titulo}>SUTUS</h1>
                    <p className={s.descripcion_corta}>Sistema de Anuncios</p>
                    <span className={s.divider} />
                </header>

                {/* Formulario */}
                <form className={s.form} onSubmit={handleLogin} noValidate>

                    {/* Email */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="email">Correo electrónico</label>
                        <div className={s.inputWrap}>
              <span className={s.inputIcono}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={`${s.input} ${errores.email ? s.inputError : ''}`}
                                placeholder="correo@unisierra.edu.mx"
                                value={email}
                                onChange={limpiarError('email')}
                                disabled={loading}
                            />
                        </div>
                        {errores.email && <span className={s.mensajeError}>{errores.email}</span>}
                    </div>

                    {/* Contraseña */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="password">Contraseña</label>
                        <div className={s.inputWrap}>
              <span className={s.inputIcono}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
                            <input
                                id="password"
                                name="password"
                                type={verPass ? 'text' : 'password'}
                                autoComplete="current-password"
                                className={`${s.input} ${errores.password ? s.inputError : ''}`}
                                placeholder="Tu contraseña"
                                value={password}
                                onChange={limpiarError('password')}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={s.botonVerPass}
                                onClick={() => setVerPass((v) => !v)}
                                aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {verPass ? (
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
                        </div>
                        {errores.password && <span className={s.mensajeError}>{errores.password}</span>}
                    </div>

                    {/* Botón submit */}
                    <button type="submit" className={s.botonLogin} disabled={loading}>
                        {loading ? (
                            <span className={s.spinnerWrap}>
                <span className={s.spinner} />
                Ingresando...
              </span>
                        ) : 'Ingresar'}
                    </button>

                </form>

                <footer className={s.pie}>
                    <p>Sindicato Único de Trabajadores de la Universidad de la Sierra</p>
                </footer>

            </main>
        </div>
    );
};

export default LoginPage;