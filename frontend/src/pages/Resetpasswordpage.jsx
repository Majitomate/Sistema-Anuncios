import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import s from '../styles/LoginPage.module.css';

const API = 'http://localhost:3001';

const ResetPasswordPage = () => {
    const navigate               = useNavigate();
    const [searchParams]         = useSearchParams();
    const token                  = searchParams.get('token');

    const [password,  setPassword]  = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [verPass,   setVerPass]   = useState(false);
    const [verConf,   setVerConf]   = useState(false);
    const [errores,   setErrores]   = useState({});
    const [loading,   setLoading]   = useState(false);

    useEffect(() => { document.title = 'Nueva contraseña — SUTUS'; }, []);

    // Si no hay token en la URL, avisar y redirigir
    useEffect(() => {
        if (!token) {
            Swal.fire({
                icon:               'error',
                title:              'Enlace inválido',
                text:               'Este enlace no es válido o ha expirado. Solicita uno nuevo.',
                confirmButtonColor: '#1b5e20',
                allowOutsideClick:  false,
            }).then(() => navigate('/forgot-password'));
        }
    }, [token, navigate]);

    const validar = () => {
        const errs = {};
        if (!password)                errs.password  = 'La contraseña es obligatoria';
        else if (password.length < 8) errs.password  = 'Mínimo 8 caracteres';
        if (!confirmar)               errs.confirmar = 'Confirma tu contraseña';
        else if (password !== confirmar) errs.confirmar = 'Las contraseñas no coinciden';
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);
        try {
            const res  = await fetch(`${API}/reset-password`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje ?? data.message ?? 'Error al restablecer la contraseña');

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
                confirmButtonColor: '#1b5e20',
            });
        } finally {
            setLoading(false);
        }
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
                    <p className={s.descripcion_corta}>Nueva contraseña</p>
                    <span className={s.divider} />
                </header>

                <p className={s.textoAyuda}>
                    Elige una contraseña segura de al menos 8 caracteres.
                </p>

                <form className={s.form} onSubmit={handleSubmit} noValidate>

                    {/* Nueva contraseña */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="password">Nueva contraseña</label>
                        <div className={s.inputWrap}>
                            <span className={s.inputIcono}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                            </span>
                            <input
                                id="password"
                                type={verPass ? 'text' : 'password'}
                                className={`${s.input} ${errores.password ? s.inputError : ''}`}
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrores(p => ({ ...p, password: undefined })); }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={s.botonVerPass}
                                onClick={() => setVerPass(v => !v)}
                                aria-label={verPass ? 'Ocultar' : 'Mostrar'}
                            >
                                <EyeIcon visible={verPass} />
                            </button>
                        </div>
                        {errores.password && <span className={s.mensajeError}>{errores.password}</span>}
                    </div>

                    {/* Confirmar contraseña */}
                    <div className={s.campo}>
                        <label className={s.label} htmlFor="confirmar">Confirmar contraseña</label>
                        <div className={s.inputWrap}>
                            <span className={s.inputIcono}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                            </span>
                            <input
                                id="confirmar"
                                type={verConf ? 'text' : 'password'}
                                className={`${s.input} ${errores.confirmar ? s.inputError : ''}`}
                                placeholder="Repite tu contraseña"
                                value={confirmar}
                                onChange={(e) => { setConfirmar(e.target.value); setErrores(p => ({ ...p, confirmar: undefined })); }}
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
                        ) : 'Guardar contraseña'}
                    </button>

                </form>

                <footer className={s.pie}>
                    <p>Sindicato Único de Trabajadores de la Universidad de la Sierra</p>
                </footer>

            </main>
        </div>
    );
};

export default ResetPasswordPage;