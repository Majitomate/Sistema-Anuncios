import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import s from '../styles/LoginPage.module.css';

const API = 'http://localhost:3001';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [email,     setEmail]     = useState('');
    const [nueva,     setNueva]     = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [verNueva,  setVerNueva]  = useState(false);
    const [verConf,   setVerConf]   = useState(false);
    const [errores,   setErrores]   = useState({});
    const [loading,   setLoading]   = useState(false);

    useEffect(() => { document.title = 'Recuperar contraseña — SUTUS'; }, []);

    const validar = () => {
        const errs = {};
        if (!email.trim())
            errs.email = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            errs.email = 'Ingresa un correo válido';
        if (!nueva)
            errs.nueva = 'La nueva contraseña es obligatoria';
        else if (nueva.length < 8)
            errs.nueva = 'Mínimo 8 caracteres';
        if (!confirmar)
            errs.confirmar = 'Confirma tu contraseña';
        else if (nueva !== confirmar)
            errs.confirmar = 'Las contraseñas no coinciden';
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);
        try {
            const res  = await fetch(`${API}/recuperar-password`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: email.trim(), passwordNueva: nueva }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? data.mensaje ?? 'Error al cambiar la contraseña');

            await Swal.fire({
                icon:               'success',
                title:              'Contraseña actualizada',
                text:               'Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión.',
                confirmButtonText:  'Iniciar sesión',
                confirmButtonColor: '#1b5e20',
            });
            navigate('/login');
        } catch (err) {
            Swal.fire({
                icon:               'error',
                title:              'Error',
                text:               err.message,
                confirmButtonText:  'Intentar de nuevo',
                confirmButtonColor: '#1b5e20',
            });
        } finally {
            setLoading(false);
        }
    };

    const limpiar = (campo) => (e) => {
        const val = e.target.value;
        if (campo === 'email')     setEmail(val);
        if (campo === 'nueva')     setNueva(val);
        if (campo === 'confirmar') setConfirmar(val);
        if (errores[campo]) setErrores(p => ({ ...p, [campo]: undefined }));
    };

    const EyeIcon = ({ visible }) => visible ? (
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
    );

    return (
        <div className={s.pagina}>

            <div className={s.fondo}>
                <div className={s.fondoCirculo1} />
                <div className={s.fondoCirculo2} />
                <div className={s.fondoCirculo3} />
            </div>

            <main className={s.tarjeta}>

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
                    <p className={s.descripcion_corta}>Recuperar contraseña</p>
                    <span className={s.divider} />
                </header>

                <p className={s.textoAyuda}>
                    Ingresa tu correo y elige una nueva contraseña.
                </p>

                <form className={s.form} onSubmit={handleSubmit} noValidate>

                    {/* Correo */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="fp-email">Correo electrónico</label>
                        <div className={s.inputWrap}>
                            <span className={s.inputIcono}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </span>
                            <input
                                id="fp-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={`${s.input} ${errores.email ? s.inputError : ''}`}
                                placeholder="correo@unisierra.edu.mx"
                                value={email}
                                onChange={limpiar('email')}
                                disabled={loading}
                            />
                        </div>
                        {errores.email && <span className={s.mensajeError}>{errores.email}</span>}
                    </div>

                    {/* Nueva contraseña */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="fp-nueva">Nueva contraseña</label>
                        <div className={s.inputWrap}>
                            <span className={s.inputIcono}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                            </span>
                            <input
                                id="fp-nueva"
                                type={verNueva ? 'text' : 'password'}
                                className={`${s.input} ${errores.nueva ? s.inputError : ''}`}
                                placeholder="Mínimo 8 caracteres"
                                value={nueva}
                                onChange={limpiar('nueva')}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={s.botonVerPass}
                                onClick={() => setVerNueva(v => !v)}
                                aria-label={verNueva ? 'Ocultar' : 'Mostrar'}
                            >
                                <EyeIcon visible={verNueva} />
                            </button>
                        </div>
                        {errores.nueva && <span className={s.mensajeError}>{errores.nueva}</span>}
                    </div>

                    {/* Confirmar contraseña */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="fp-confirmar">Confirmar contraseña</label>
                        <div className={s.inputWrap}>
                            <span className={s.inputIcono}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                            </span>
                            <input
                                id="fp-confirmar"
                                type={verConf ? 'text' : 'password'}
                                className={`${s.input} ${errores.confirmar ? s.inputError : ''}`}
                                placeholder="Repite tu contraseña"
                                value={confirmar}
                                onChange={limpiar('confirmar')}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={s.botonVerPass}
                                onClick={() => setVerConf(v => !v)}
                                aria-label={verConf ? 'Ocultar' : 'Mostrar'}
                            >
                                <EyeIcon visible={verConf} />
                            </button>
                        </div>
                        {errores.confirmar && <span className={s.mensajeError}>{errores.confirmar}</span>}
                    </div>

                    <button type="submit" className={s.botonLogin} disabled={loading}>
                        {loading ? (
                            <span className={s.spinnerWrap}>
                                <span className={s.spinner} />
                                Guardando...
                            </span>
                        ) : 'Cambiar contraseña'}
                    </button>

                    <button
                        type="button"
                        className={s.botonSecundario}
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        ← Volver al inicio de sesión
                    </button>

                </form>

                <footer className={s.pie}>
                    <p>Sindicato Único de Trabajadores de la Universidad de la Sierra</p>
                </footer>

            </main>
        </div>
    );
};

export default ForgotPasswordPage;