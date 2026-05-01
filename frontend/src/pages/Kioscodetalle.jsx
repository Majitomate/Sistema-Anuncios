import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import s from '../styles/KioscoDetalle.module.css';

const API = 'http://localhost:3001';

const TIPO_LABEL = {
    general:      'General',
    evento:       'Evento',
    convocatoria: 'Convocatoria',
    votacion:     'Votación',
    resultado:    'Resultado',
};

const formatFechaLarga = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

const KioscoDetalle = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [anuncio,       setAnuncio]       = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState(null);
    const [lightboxImg,   setLightboxImg]   = useState(false);
    const [visorDoc,      setVisorDoc]      = useState(false);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError(null);
            try {
                const token   = localStorage.getItem('sutus_token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res     = await fetch(`${API}/anuncios/${id}`, { headers });
                if (!res.ok) throw new Error('No se encontró el anuncio');
                const data = await res.json();
                setAnuncio(data);
                document.title = `${data.titulo} — SUTUS`;
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    // Cerrar lightbox/visor con Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') { setLightboxImg(false); setVisorDoc(false); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleVolver = () => navigate('/display');

    if (loading) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}><div className={s.spinner} /><p>Cargando...</p></div>
        </div>
    );

    if (error || !anuncio) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}>
                <span>⚠️</span>
                <p>{error ?? 'Anuncio no encontrado'}</p>
                <button type="button" className={s.botonVolver} onClick={handleVolver}>← Volver</button>
            </div>
        </div>
    );

    const imagenUrl    = anuncio.imagen_tipo    ? `${API}/anuncios/${anuncio.id}/imagen`    : null;
    const documentoUrl = anuncio.documento_tipo ? `${API}/anuncios/${anuncio.id}/documento` : null;
    const fechaInicio  = formatFechaLarga(anuncio.fecha_inicio);
    const fechaFin     = formatFechaLarga(anuncio.fecha_fin);

    return (
        <div className={s.pantalla}>

            {/* ── Lightbox imagen ── */}
            {lightboxImg && imagenUrl && (
                <div className={s.lightboxOverlay} onClick={() => setLightboxImg(false)}>
                    <button type="button" className={s.lightboxCerrar} onClick={() => setLightboxImg(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <img
                        src={imagenUrl}
                        alt={anuncio.titulo}
                        className={s.lightboxImg}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* ── Visor documento (iframe) ── */}
            {visorDoc && documentoUrl && (
                <div className={`${s.lightboxOverlay} ${s.soloDoc}`}>
                    <div className={s.visorDocWrap}>
                        {/* Botón cerrar flotante */}
                        <button
                            type="button"
                            className={s.visorDocCerrarFlotante}
                            onClick={() => setVisorDoc(false)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Cerrar
                        </button>
                        <iframe
                            src={documentoUrl}
                            className={s.visorDocIframe}
                            title="Documento adjunto"
                        />
                    </div>
                </div>
            )}

            {/* ── Panel izquierdo ── */}
            <aside className={s.panelIzq}>
                {imagenUrl && (
                    <div className={s.imagenFondo} style={{ backgroundImage: `url(${imagenUrl})` }} />
                )}
                <div className={s.imagenOverlay} />

                <button type="button" className={s.botonCerrar} onClick={handleVolver}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Cerrar detalle
                </button>

                <div className={s.imagenTexto}>
                    {anuncio.tipo && (
                        <span className={s.imagenTipo}>{TIPO_LABEL[anuncio.tipo] ?? anuncio.tipo}</span>
                    )}
                    <h1 className={s.imagenTitulo}>{anuncio.titulo}</h1>
                    {anuncio.descripcion_corta && (
                        <p className={s.imagendescripcion_corta}>{anuncio.descripcion_corta}</p>
                    )}
                </div>
            </aside>

            {/* ── Panel derecho ── */}
            <main className={s.panelDer}>

                {(fechaInicio || fechaFin) && (
                    <div className={s.fechasRow}>
                        {fechaInicio && (
                            <div className={s.fechaItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <div>
                                    <span className={s.fechaLabel}>Inicio</span>
                                    <span className={s.fechaValor}>{fechaInicio}</span>
                                </div>
                            </div>
                        )}
                        {fechaFin && (
                            <div className={s.fechaItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <div>
                                    <span className={s.fechaLabel}>Fin</span>
                                    <span className={s.fechaValor}>{fechaFin}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className={s.cuerpo}>
                    <p>{anuncio.contenido}</p>
                </div>

                {(imagenUrl || documentoUrl) && (
                    <section className={s.archivos}>
                        <h3 className={s.archivosTitulo}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            ARCHIVOS ADJUNTOS Y GALERÍA
                        </h3>

                        <div className={s.archivosGrid}>

                            {/* ── Imagen con lightbox ── */}
                            {imagenUrl && (
                                <button
                                    type="button"
                                    className={s.imagenThumb}
                                    onClick={() => setLightboxImg(true)}
                                    title="Clic para ampliar"
                                >
                                    <img src={imagenUrl} alt={anuncio.titulo} />
                                    <div className={s.imagenThumbOverlay}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
                                            <circle cx="11" cy="11" r="8"/>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                            <line x1="11" y1="8" x2="11" y2="14"/>
                                            <line x1="8" y1="11" x2="14" y2="11"/>
                                        </svg>
                                        Ampliar
                                    </div>
                                </button>
                            )}

                            {/* ── Documento con preview + visor ── */}
                            {documentoUrl && (
                                <div className={s.docCard}>
                                    <div className={s.docPreview}>
                                        <iframe
                                            src={documentoUrl}
                                            className={s.docPreviewIframe}
                                            title="Vista previa"
                                            scrolling="no"
                                        />
                                        <div className={s.docPreviewMask} />
                                    </div>
                                    <div className={s.docAcciones}>
                                        <button
                                            type="button"
                                            className={s.docBotonVer}
                                            onClick={() => setVisorDoc(true)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            Ver documento
                                        </button>
                                        <a
                                            href={documentoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={s.docBotonAbrir}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                                                <polyline points="15 3 21 3 21 9"/>
                                                <line x1="10" y1="14" x2="21" y2="3"/>
                                            </svg>
                                            Abrir
                                        </a>
                                    </div>
                                </div>
                            )}

                        </div>
                    </section>
                )}

                <button type="button" className={s.botonHelp} onClick={handleVolver} aria-label="Volver">?</button>
            </main>
        </div>
    );
};

export default KioscoDetalle;