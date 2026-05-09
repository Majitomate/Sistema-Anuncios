import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '../components/FullscreenContext';
import s from '../styles/KioscoLista.module.css';

const API = 'http://localhost:3001';

const PRIO_CONFIG = {
    3: { label: 'URGENTE', clase: 'badgeUrgente' },
    2: { label: 'ALTA',    clase: 'badgeAlta'    },
    1: { label: null,      clase: null            },
};

const formatFechaCorta = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

const KioscoLista = () => {
    const navigate = useNavigate();
    const { isFullscreen, toggleFullscreen, salirDePantallaCompleta } = useFullscreen();

    const [anuncios, setAnuncios] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [indice,   setIndice]   = useState(0);
    const [animando, setAnimando] = useState(false);
    const [pausado,  setPausado]  = useState(false);
    const timerRef = useRef(null);

    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token   = localStorage.getItem('sutus_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res     = await fetch(`${API}/anuncios/kiosco`, { headers });
            if (!res.ok) throw new Error('No se pudieron cargar los anuncios');
            const data = await res.json();
            const ordenados = data
                .sort((a, b) => b.prioridad - a.prioridad);
            setAnuncios(ordenados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnuncios(); }, [fetchAnuncios]);

    useEffect(() => {
        if (anuncios.length <= 1 || pausado) return;
        const actual = anuncios[indice];
        let tiempoEspera = 8000;
        if (actual.prioridad === 3) tiempoEspera = 15000;
        if (actual.prioridad === 2) tiempoEspera = 12000;

        timerRef.current = setTimeout(() => {
            ir((indice + 1) % anuncios.length);
        }, tiempoEspera);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [anuncios, indice, pausado]);

    const cambiarCon = (fn) => {
        if (animando) return;
        setAnimando(true);
        setTimeout(() => { setIndice(fn); setAnimando(false); }, 300);
    };

    const ir = (idx) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        cambiarCon(() => idx);
    };

    const anterior = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        cambiarCon((i) => (i - 1 + anuncios.length) % anuncios.length);
    };

    const siguiente = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        cambiarCon((i) => (i + 1) % anuncios.length);
    };

    const handleVolver = () => {
        salirDePantallaCompleta();
        const rol = localStorage.getItem('sutus_rol');
        navigate(rol === 'visualizador' ? '/login' : '/dashboard');
    };

    if (loading) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}><div className={s.spinner} /></div>
        </div>
    );

    if (error) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}>
                <p>{error}</p>
                <button className={s.botonReintentar} onClick={fetchAnuncios}>Reintentar</button>
            </div>
        </div>
    );

    if (!anuncios.length) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}><p>No hay anuncios disponibles.</p></div>
        </div>
    );

    const actual    = anuncios[indice];
    const imagenUrl = actual?.imagenes?.length > 0
        ? `${API}/anuncios/imagen/${actual.imagenes[0].id}`
        : null;
    const prioConf  = actual ? (PRIO_CONFIG[actual.prioridad] ?? PRIO_CONFIG[1]) : null;

    const fechaInicio = formatFechaCorta(actual?.fecha_inicio);
    const fechaFin    = formatFechaCorta(actual?.fecha_fin);

    // Anuncios proximos: todos menos el actual, max 3
    const proximos = anuncios
        .filter((_, i) => i !== indice)
        .slice(0, 3);

    return (
        <div
            className={s.pantalla}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            <div
                className={`${s.fondo} ${animando ? s.fondoSaliendo : ''}`}
                style={imagenUrl ? { backgroundImage: `url(${imagenUrl})` } : {}}
            />
            <div className={s.overlay} />

            {/* Header */}
            <header className={s.header}>
                <div className={s.headerIzq}>
                    <button className={s.botonVolver} onClick={handleVolver}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                        </svg>
                        Volver
                    </button>
                    <div className={s.marca}>
                        <span className={s.marcaNombre}>SUTUS</span>
                        <span className={s.marcaSub}>SEÑALIZACIÓN DIGITAL</span>
                    </div>
                </div>
                <div className={s.headerDer}>
                    {prioConf?.label && (
                        <span className={`${s.badgePrio} ${s[prioConf.clase]}`}>
                            <span className={s.badgeDot} />
                            {prioConf.label}
                        </span>
                    )}
                    <button className={s.botonFullscreen} onClick={toggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                        {isFullscreen ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="8 3 3 3 3 8"/>
                                <polyline points="21 8 21 3 16 3"/>
                                <polyline points="3 16 3 21 8 21"/>
                                <polyline points="16 21 21 21 21 16"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="15 3 21 3 21 9"/>
                                <polyline points="9 21 3 21 3 15"/>
                                <line x1="21" y1="3" x2="14" y2="10"/>
                                <line x1="3" y1="21" x2="10" y2="14"/>
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            {/* Contenido central */}
            <div className={`${s.contenido} ${animando ? s.contenidoSaliendo : ''}`}>
                <h1 className={s.titulo}>{actual?.titulo}</h1>
                <p className={s.descripcion_corta}>{actual?.descripcion_corta}</p>
                <div className={s.verDetalleWrap}>
                    <button className={s.botonVerDetalle} onClick={() => navigate(`/display/${actual.id}`)}>
                        VER DETALLE COMPLETO
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Flechas */}
            {anuncios.length > 1 && (
                <>
                    <button className={`${s.flecha} ${s.flechaIzq}`} onClick={anterior}>&#8249;</button>
                    <button className={`${s.flecha} ${s.flechaDer}`} onClick={siguiente}>&#8250;</button>
                </>
            )}

            {/* Footer */}
            <footer className={s.footer}>
                <div className={s.footerIzq}>

                    {/* Fechas del anuncio actual */}
                    {(fechaInicio || fechaFin) && (
                        <div className={s.fechasRow}>
                            {fechaInicio && (
                                <div className={s.fechaChip}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8"  y1="2" x2="8"  y2="6"/>
                                        <line x1="3"  y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <div>
                                        <span className={s.fechaLabel}>INICIO</span>
                                        <span className={s.fechaValor}>{fechaInicio}</span>
                                    </div>
                                </div>
                            )}
                            {fechaFin && (
                                <div className={s.fechaChip}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <div>
                                        <span className={s.fechaLabel}>FIN</span>
                                        <span className={s.fechaValor}>{fechaFin}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cards de proximos anuncios */}
                    {proximos.length > 0 && (
                        <div className={s.proximosWrap}>
                            {proximos.map((a) => {
                                const pc        = PRIO_CONFIG[a.prioridad] ?? PRIO_CONFIG[1];
                                const esUrgente = a.prioridad === 3;
                                const esAlta    = a.prioridad === 2;
                                return (
                                    <button
                                        key={a.id}
                                        className={`${s.cardProximo} ${esUrgente ? s.esUrgente : esAlta ? s.esAlta : s.esNormal}`}
                                        onClick={() => ir(anuncios.findIndex(x => x.id === a.id))}
                                    >
                                        <span className={`${s.cardProximoLabel} ${esUrgente ? s.labelUrgente : esAlta ? s.labelAlta : s.labelNormal}`}>
                                            {pc.label ? `\u2022 ${pc.label}` : '\u2022 PRÓXIMO'}
                                        </span>
                                        <span className={s.cardProximoTitulo}>{a.titulo}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dots */}
                {anuncios.length > 1 && (
                    <div className={s.dots}>
                        {anuncios.map((_, i) => (
                            <button
                                key={i}
                                className={`${s.dot} ${i === indice ? s.dotActivo : ''}`}
                                onClick={() => ir(i)}
                            />
                        ))}
                    </div>
                )}
            </footer>
        </div>
    );
};

export default KioscoLista;