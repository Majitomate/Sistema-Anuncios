import { useState, useEffect } from 'react';
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

    const [anuncio, setAnuncio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

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

    const handleVolver = () => navigate('/display');

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className={s.pantalla}>
            <div className={s.estadoCentro}><div className={s.spinner} /><p>Cargando...</p></div>
        </div>
    );

    // ── Error ────────────────────────────────────────────────────────────────
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

            {/* ── Panel izquierdo: imagen hero ── */}
            <aside className={s.panelIzq}>
                {/* Imagen de fondo con blur */}
                {imagenUrl && (
                    <div
                        className={s.imagenFondo}
                        style={{ backgroundImage: `url(${imagenUrl})` }}
                    />
                )}
                <div className={s.imagenOverlay} />

                {/* Botón cerrar detalle */}
                <button type="button" className={s.botonCerrar} onClick={handleVolver}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Cerrar detalle
                </button>

                {/* Texto sobre la imagen */}
                <div className={s.imagenTexto}>
                    {anuncio.tipo && (
                        <span className={s.imagenTipo}>{TIPO_LABEL[anuncio.tipo] ?? anuncio.tipo}</span>
                    )}
                    <h1 className={s.imagenTitulo}>{anuncio.titulo}</h1>
                    {anuncio.subtitulo && (
                        <p className={s.imagenSubtitulo}>{anuncio.subtitulo}</p>
                    )}
                </div>
            </aside>

            {/* ── Panel derecho: contenido ── */}
            <main className={s.panelDer}>

                {/* Fechas */}
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

                {/* Cuerpo del anuncio */}
                <div className={s.cuerpo}>
                    <p>{anuncio.contenido}</p>
                </div>

                {/* Archivos adjuntos y galería */}
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
                            {/* Imagen */}
                            {imagenUrl && (
                                <div className={s.imagenThumb}>
                                    <img src={imagenUrl} alt={anuncio.titulo} />
                                </div>
                            )}

                            {/* Documento */}
                            {documentoUrl && (
                                <a
                                    href={documentoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={s.docBoton}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    Ver documento adjunto
                                </a>
                            )}
                        </div>
                    </section>
                )}

                {/* Botón de ayuda / volver en móvil */}
                <button type="button" className={s.botonHelp} onClick={handleVolver} aria-label="Volver">?</button>

            </main>
        </div>
    );
};

export default KioscoDetalle;