import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const navigate   = useNavigate();


    const [anuncios, setAnuncios] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [indice, setIndice]     = useState(0);
    const [animando, setAnimando] = useState(false);
    const timerRef = useRef(null);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token   = localStorage.getItem('sutus_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res     = await fetch(`${API}/anuncios`, { headers });
            if (!res.ok) throw new Error('No se pudieron cargar los anuncios');
            const data = await res.json();
            // Ordenar: prioridad alta (3) primero, luego media (2), luego baja (1)
            const ordenados = data
                .filter((a) => a.estado)
                .sort((a, b) => b.prioridad - a.prioridad);
            setAnuncios(ordenados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnuncios(); }, [fetchAnuncios]);
    useEffect(() => { document.title = 'Anuncios — SUTUS'; }, []);

    // ── Auto-avance cada 8s ──────────────────────────────────────────────────
    useEffect(() => {
        if (anuncios.length <= 1) return;
        timerRef.current = setInterval(() => {
            cambiarCon((i) => (i + 1) % anuncios.length);
        }, 8000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anuncios.length]);

    const cambiarCon = (fn) => {
        if (animando) return;
        setAnimando(true);
        setTimeout(() => { setIndice(fn); setAnimando(false); }, 300);
    };

    const ir = (idx) => { clearInterval(timerRef.current); cambiarCon(() => idx); };
    const anterior = () => { clearInterval(timerRef.current); cambiarCon((i) => (i - 1 + anuncios.length) % anuncios.length); };
    const siguiente = () => { clearInterval(timerRef.current); cambiarCon((i) => (i + 1) % anuncios.length); };
    const handleVolver = () => {
        const rol = localStorage.getItem('sutus_rol');
        const esDashboard = ['admin', 'editor', 'revisor'].includes(rol);
        navigate(esDashboard ? '/dashboard' : '/login', { replace: true });
    };

    // ── Datos del slide actual ───────────────────────────────────────────────
    const actual    = anuncios[indice];
    const imagenUrl = actual?.imagenes && actual.imagenes.length > 0 ? `${API}/anuncios/imagen/${actual.imagenes[0].id}` : null;
    const prioConf  = actual ? (PRIO_CONFIG[actual.prioridad] ?? PRIO_CONFIG[1]) : null;

    // Todos los demás anuncios activos excepto el actual
    const proximosDestacados = anuncios.filter((_, i) => i !== indice);

    // ── Estados de carga ─────────────────────────────────────────────────────
    if (loading) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}><div className={s.spinner} /><p>Cargando anuncios...</p></div>
        </div>
    );

    if (error) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}>
                <span>⚠️</span><p>{error}</p>
                <button type="button" className={s.botonReintentar} onClick={fetchAnuncios}>Reintentar</button>
            </div>
        </div>
    );

    if (anuncios.length === 0) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}><span>📋</span><p>No hay anuncios activos en este momento.</p></div>
        </div>
    );

    return (
        <div className={s.pantalla}>

            {/* ── Fondo imagen con blur ── */}
            <div
                className={`${s.fondo} ${animando ? s.fondoSaliendo : ''}`}
                style={imagenUrl ? { backgroundImage: `url(${imagenUrl})` } : undefined}
            />
            <div className={s.overlay} />

            {/* ── Header ── */}
            <header className={s.header}>
                <div className={s.headerIzq}>
                    <button type="button" className={s.botonVolver} onClick={handleVolver}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Volver
                    </button>
                    <div className={s.marca}>
                        <span className={s.marcaNombre}>SUTUS</span>
                        <span className={s.marcaSub}>SEÑALIZACIÓN DIGITAL</span>
                    </div>
                </div>

                {prioConf?.label && (
                    <span className={`${s.badgePrio} ${s[prioConf.clase]}`}>
            <span className={s.badgeDot} />
                        {prioConf.label}
          </span>
                )}
            </header>

            {/* ── Contenido central (clickeable para ir al detalle) ── */}
            <button
                type="button"
                className={`${s.contenido} ${animando ? s.contenidoSaliendo : ''}`}
                onClick={() => navigate(`/display/${actual.id}`)}
            >
                <h1 className={s.titulo}>{actual.titulo}</h1>
                {actual.descripcion_corta && <p className={s.descripcion_corta}>{actual.descripcion_corta}</p>}
            </button>

            {/* ── Flechas de navegación ── */}
            {anuncios.length > 1 && (
                <>
                    <button type="button" className={`${s.flecha} ${s.flechaIzq}`} onClick={anterior} aria-label="Anterior">‹</button>
                    <button type="button" className={`${s.flecha} ${s.flechaDer}`} onClick={siguiente} aria-label="Siguiente">›</button>
                </>
            )}

            {/* ── Footer ── */}
            <footer className={s.footer}>
                <div className={s.footerIzq}>

                    {/* Chips de fecha */}
                    <div className={s.fechasRow}>
                        {formatFechaCorta(actual.fecha_inicio) && (
                            <div className={s.fechaChip}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <div>
                                    <span className={s.fechaLabel}>INICIO</span>
                                    <span className={s.fechaValor}>{formatFechaCorta(actual.fecha_inicio)}</span>
                                </div>
                            </div>
                        )}
                        {formatFechaCorta(actual.fecha_fin) && (
                            <div className={s.fechaChip}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <div>
                                    <span className={s.fechaLabel}>FIN</span>
                                    <span className={s.fechaValor}>{formatFechaCorta(actual.fecha_fin)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cards próximos urgentes/alta */}
                    {proximosDestacados.length > 0 && (
                        <div className={s.proximosWrap}>
                            {proximosDestacados.map((dest) => (
                                <button
                                    key={dest.id}
                                    type="button"
                                    className={`${s.cardProximo} ${dest.prioridad === 3 ? s.esUrgente : dest.prioridad === 2 ? s.esAlta : s.esNormal}`}
                                    onClick={() => ir(anuncios.findIndex((a) => a.id === dest.id))}
                                >
                  <span className={`${s.cardProximoLabel} ${dest.prioridad === 3 ? s.labelUrgente : dest.prioridad === 2 ? s.labelAlta : s.labelNormal}`}>
                    ● {dest.prioridad === 3 ? 'URGENTE' : dest.prioridad === 2 ? 'ALTA' : 'PRÓXIMO'}
                  </span>
                                    <span className={s.cardProximoTitulo}>{dest.titulo}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dots */}
                {anuncios.length > 1 && (
                    <div className={s.dots}>
                        {anuncios.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`${s.dot} ${i === indice ? s.dotActivo : ''}`}
                                onClick={() => ir(i)}
                                aria-label={`Anuncio ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </footer>

        </div>
    );
};

export default KioscoLista;