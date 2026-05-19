import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '../components/FullscreenContext';
import s from '../styles/KioscoLista.module.css';

const API = 'http://localhost:3001';
const IMAGEN_DEFAULT = '/imagen_default.jpg';

const PRIO_CONFIG = {
    3: { label: 'URGENTE', clase: 'badgeUrgente' },
    2: { label: 'ALTA', clase: 'badgeAlta' },
    1: { label: null, clase: null },
};

const formatFechaCorta = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

/**
 * Verifica si un anuncio está vigente (dentro de su rango de fechas)
 * @param {Object} anuncio - Anuncio a validar
 * @returns {boolean} true si el anuncio está vigente
 */
const esAnuncioVigente = (anuncio) => {
    if (!anuncio) return false;

    const ahora = new Date();
    
    // Si tiene fecha de inicio, validar que ya haya comenzado
    if (anuncio.fecha_inicio) {
        const fechaInicio = new Date(anuncio.fecha_inicio);
        if (!isNaN(fechaInicio.getTime()) && ahora < fechaInicio) {
            return false;
        }
    }
    
    // Si tiene fecha de fin, validar que no haya vencido
    if (anuncio.fecha_fin) {
        const fechaFin = new Date(anuncio.fecha_fin);
        if (!isNaN(fechaFin.getTime()) && ahora > fechaFin) {
            return false;
        }
    }
    
    // Si no tiene fechas definidas, considerarlo vigente
    return true;
};

/**
 * Filtra anuncios vencidos y los ordena por prioridad
 * @param {Array} anuncios - Array de anuncios
 * @returns {Array} Anuncios vigentes ordenados por prioridad
 */
const filtrarAnunciosVigentes = (anuncios) => {
    return anuncios
        .filter(esAnuncioVigente)
        .sort((a, b) => b.prioridad - a.prioridad);
};

const KioscoLista = () => {
    const navigate = useNavigate();
    const { isFullscreen, toggleFullscreen, salirDePantallaCompleta } = useFullscreen();
    const [anuncios, setAnuncios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [indice, setIndice] = useState(0);
    const [animando, setAnimando] = useState(false);
    const [pausado, setPausado] = useState(false);
    const timerRef = useRef(null);
    const [isOffline, setIsOffline] = useState(false);
    const heartbeatTimerRef = useRef(null);
    const dispositivoIdRef = useRef(null);

    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('sutus_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API}/anuncios/kiosco`, { headers });
            if (!res.ok) throw new Error('No se pudieron cargar los anuncios');
            const data = await res.json();
            const filtrados = filtrarAnunciosVigentes(data);
            setAnuncios(filtrados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Genera o recupera identificador único del dispositivo
     */
    const generarObtenerIdDispositivo = useCallback(() => {
        let id = localStorage.getItem('sutus_dispositivo_id');
        if (!id) {
            id = `dispositivo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('sutus_dispositivo_id', id);
        }
        return id;
    }, []);

    /**
     * Envía heartbeat al servidor
     */
    const enviarHeartbeat = useCallback(async () => {
        try {
            const dispositivoId = generarObtenerIdDispositivo();
            await fetch(`${API}/dispositivos/heartbeat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identificador: dispositivoId,
                    nombre: `Kiosco - ${dispositivoId.slice(-8)}`,
                    ubicacion: 'Unisierra Campus'
                })
            });
        } catch (err) {
            console.warn('[Heartbeat] Error enviando heartbeat:', err.message);
        }
    }, [generarObtenerIdDispositivo]);

    useEffect(() => {
        let activo = true;

        const cargarAnuncios = async () => {
            try {
                const response = await fetch(`${API}/anuncios/kiosco`);

                if (!response.ok) throw new Error('Error de conexión');

                const data = await response.json();

                if (activo) {
                    const filtrados = filtrarAnunciosVigentes(data);
                    setAnuncios(filtrados);
                    setIsOffline(false);
                    setError(null);
                    // GUARDAMOS LA CACHÉ Y LA FECHA EXACTA
                    localStorage.setItem('kiosco_cache_unisierra', JSON.stringify(data));
                    localStorage.setItem('kiosco_ultima_sync', new Date().toISOString());
                }
            } catch (err) {
                console.warn('Sin conexión al servidor. Cargando caché local...');

                if (activo) {
                    setIsOffline(true);
                    const cache = localStorage.getItem('kiosco_cache_unisierra');

                    if (cache) {
                        const datosEnCache = JSON.parse(cache);
                        const filtrados = filtrarAnunciosVigentes(datosEnCache);
                        setAnuncios(filtrados);
                        setError(null);
                    } else {
                        setError('No hay conexión a internet y no hay anuncios guardados en esta tablet.');
                        setAnuncios([]);
                    }
                }
            } finally {
                if (activo) setLoading(false);
            }
        };

        cargarAnuncios();

        const intervalo = setInterval(cargarAnuncios, 5 * 60 * 1000);

        // INICIAR HEARTBEAT - Se envía cada 2 minutos
        dispositivoIdRef.current = generarObtenerIdDispositivo();
        enviarHeartbeat(); // Enviar inmediatamente al cargar
        heartbeatTimerRef.current = setInterval(enviarHeartbeat, 2 * 60 * 1000);

        return () => {
            activo = false;
            clearInterval(intervalo);
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        };
    }, [generarObtenerIdDispositivo, enviarHeartbeat]);

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
        <div className={`${s.pantalla} ${s.pantallaCargando}`}>
            <div className={s.estadoCentro}><div className={s.spinner} /></div>
        </div>
    );

    if (!anuncios.length) {
        const ultimaSync = localStorage.getItem('kiosco_ultima_sync');
        const cacheOriginal = localStorage.getItem('kiosco_cache_unisierra');
        const hayAnunciosEnCache = cacheOriginal ? JSON.parse(cacheOriginal).length > 0 : false;
        const mensajeVacio = hayAnunciosEnCache 
            ? 'Todos los anuncios han vencido o aún no están vigentes.'
            : 'No hay anuncios disponibles en este momento.';
        
        return (
            <div className={`${s.pantalla} ${s.pantallaVacia}`}>
                <img src={IMAGEN_DEFAULT} alt="Logo SUTUS" className={s.logoGrande} />
                
                {isOffline && (
                    <div className={s.offlineBanner}>
                        ⚠️ Sin conexión. Mostrando datos locales (Última sync: {ultimaSync ? new Date(ultimaSync).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Desconocida'})
                    </div>
                )}
                
                <h1 className={s.vacioTitulo}>{mensajeVacio}</h1>
                <p className={s.vacioTexto}>
                    {error || "Esperando sincronización con el servidor..."}
                </p>
                {error && (
                    <button className={s.botonReintentar} onClick={fetchAnuncios}>
                        Reintentar conexión
                    </button>
                )}
            </div>
        );
    }

    const actual = anuncios[indice];
    const imagenUrl = actual?.imagenes?.length > 0
        ? `${API}/anuncios/imagen/${actual.imagenes[0].id}`
        : IMAGEN_DEFAULT;
    const prioConf = actual ? (PRIO_CONFIG[actual.prioridad] ?? PRIO_CONFIG[1]) : null;

    const fechaInicio = formatFechaCorta(actual?.fecha_inicio);
    const fechaFin = formatFechaCorta(actual?.fecha_fin);

    const proximos = anuncios
        .filter((_, i) => i !== indice)
        .slice(0, 3);

    return (
        <div
            className={s.pantalla}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            <img 
                key={actual?.id || indice}
                src={imagenUrl}
                alt="Fondo Anuncio"
                className={`${s.fondo} ${s.imagenResponsive} ${animando ? s.fondoSaliendo : ''}`}
                onError={(e) => {
                    if (!e.target.src.includes(IMAGEN_DEFAULT)) {
                        e.target.src = IMAGEN_DEFAULT;
                    } else {
                        e.target.style.display = 'none';
                    }
                }}
            />
            
            <div className={s.overlay} />

            {/* Header */}
            <header className={s.header}>
                <div className={s.headerIzq}>
                    <button className={s.botonVolver} onClick={handleVolver}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Volver
                    </button>
                    <div className={s.marca}>
                        <span className={s.marcaNombre}>SUTUS</span>
                        <span className={s.marcaSub}>SEÑALIZACIÓN DIGITAL</span>
                    </div>
                </div>
                {isOffline && (
                    <div className={s.offlineBadge}>
                        ⚠️ Sin Conexión (Modo Local)
                    </div>
                )}
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
                                <polyline points="8 3 3 3 3 8" />
                                <polyline points="21 8 21 3 16 3" />
                                <polyline points="3 16 3 21 8 21" />
                                <polyline points="16 21 21 21 21 16" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="15 3 21 3 21 9" />
                                <polyline points="9 21 3 21 3 15" />
                                <line x1="21" y1="3" x2="14" y2="10" />
                                <line x1="3" y1="21" x2="10" y2="14" />
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
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
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
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
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
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
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
                                const pc = PRIO_CONFIG[a.prioridad] ?? PRIO_CONFIG[1];
                                const esUrgente = a.prioridad === 3;
                                const esAlta = a.prioridad === 2;
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