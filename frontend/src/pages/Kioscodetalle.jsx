import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFullscreen } from '../components/FullscreenContext';
import s from '../styles/KioscoDetalle.module.css';

const API = 'http://localhost:3001';
const IMAGEN_DEFAULT = '/imagen_default.jpg';

const TIPO_LABEL = {
    general: 'General',
    evento: 'Evento',
    convocatoria: 'Convocatoria',
    votacion: 'Votación',
    resultado: 'Resultado',
};

const formatFechaLarga = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

const KioscoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isFullscreen } = useFullscreen();

    const [anuncio, setAnuncio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxImg, setLightboxImg] = useState(false);
    const [visorDoc, setVisorDoc] = useState(false);
    const [indiceImagen, setIndiceImagen] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        let activo = true;

        const cargarAnuncio = async () => {
            try {
                setLoading(true);
                // 1. Intentamos consultar al servidor remoto
                const response = await fetch(`${API}/api/anuncios/${id}`);
                if (!response.ok) throw new Error('Error de conexión');

                const data = await response.json();

                if (activo) {
                    setAnuncio(data);
                    setIsOffline(false);
                    setError(null);
                }
            } catch (err) {
                console.warn(`Sin red para el anuncio ${id}. Buscando en caché...`);

                if (activo) {
                    setIsOffline(true);
                    const cache = localStorage.getItem('kiosco_cache_unisierra');

                    if (cache) {
                        const anunciosGuardados = JSON.parse(cache);
                        // Buscamos el anuncio específico
                        const anuncioEncontrado = anunciosGuardados.find(a => String(a.id) === String(id));

                        if (anuncioEncontrado) {
                            setAnuncio(anuncioEncontrado);
                            setError(null);
                        } else {
                            setError('El anuncio no se encuentra en la memoria de la tablet.');
                        }
                    } else {
                        setError('Sin conexión y sin historial en la tablet.');
                    }
                }
            } finally {
                if (activo) setLoading(false);
            }
        };

        cargarAnuncio();

        return () => {
            activo = false;
        };
    }, [id]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setLightboxImg(false);
                setVisorDoc(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleVoz = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!anuncio) return;

        const tipoLabel = TIPO_LABEL[anuncio.tipo] || anuncio.tipo;

        const textoALeer = `
            ${anuncio.titulo}. 
            ${anuncio.descripcion_corta || ''}. 
            ${anuncio.contenido}
        `;

        const utterance = new SpeechSynthesisUtterance(textoALeer);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const handleVolver = () => {
        window.speechSynthesis.cancel();
        navigate('/display');
    };

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

    const imagenesUrls = anuncio?.imagenes && anuncio.imagenes.length > 0
        ? anuncio.imagenes.map(img => `${API}/anuncios/imagen/${img.id}`)
        : [IMAGEN_DEFAULT]; // Si no hay imágenes, creamos un array con la default
    const documentoUrl = anuncio?.documento_tipo ? `${API}/anuncios/${anuncio.id}/documento` : null;
    const fechaInicio = formatFechaLarga(anuncio?.fecha_inicio);
    const fechaFin = formatFechaLarga(anuncio?.fecha_fin);
    const imagenActual = imagenesUrls[indiceImagen];

    return (
        <div className={s.pantalla}>

            {/* Lightbox Imagen */}
            {lightboxImg && imagenActual && (
                <div className={s.lightboxOverlay} onClick={() => setLightboxImg(false)}>
                    <button type="button" className={s.lightboxCerrar} onClick={() => setLightboxImg(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <img
                        src={imagenActual}
                        alt={anuncio.titulo}
                        className={s.lightboxImg}
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => { e.target.src = IMAGEN_DEFAULT; }}
                    />
                </div>
            )}

            {/* Visor Documento */}
            {visorDoc && documentoUrl && (
                <div className={`${s.lightboxOverlay} ${s.soloDoc}`}>
                    <div className={s.visorDocWrap}>
                        <button type="button" className={s.visorDocCerrarFlotante} onClick={() => setVisorDoc(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Cerrar
                        </button>
                        <iframe src={documentoUrl} className={s.visorDocIframe} title="Documento adjunto" />
                    </div>
                </div>
            )}

            <aside className={s.panelIzq}>
                {/* Imagen de fondo (Blur) */}
                <div
                    className={s.imagenFondo}
                    style={{ backgroundImage: `url(${imagenActual})` }}
                />

                <div className={s.imagenOverlay} />

                <button type="button" className={s.botonCerrar} onClick={handleVolver}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Cerrar detalle
                </button>
                {isOffline && (
                    <div className={s.offlineBadge} style={{ backgroundColor: '#ff9800', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', marginRight: '20px' }}>
                        ⚠️ Sin Conexión (Modo Local)
                    </div>
                )}
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

            <main className={s.panelDer}>
                {(fechaInicio || fechaFin) && (
                    <div className={s.fechasRow}>
                        {fechaInicio && (
                            <div className={s.fechaItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <div><span className={s.fechaLabel}>Inicio</span><span className={s.fechaValor}>{fechaInicio}</span></div>
                            </div>
                        )}
                        {fechaFin && (
                            <div className={s.fechaItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                <div><span className={s.fechaLabel}>Fin</span><span className={s.fechaValor}>{fechaFin}</span></div>
                            </div>
                        )}
                    </div>
                )}

                <div className={s.cuerpo}>
                    <p>{anuncio.contenido}</p>
                </div>

                <section className={s.archivos}>
                    <h3 className={s.archivosTitulo}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        ARCHIVOS ADJUNTOS Y GALERÍA
                    </h3>
                    <div className={s.archivosGrid}>
                        {imagenActual && (
                            <button type="button" className={s.imagenThumb} onClick={() => setLightboxImg(true)}>
                                <img src={imagenActual} alt={anuncio.titulo} />
                                <div className={s.imagenThumbOverlay}>Ampliar</div>
                            </button>
                        )}
                        {imagenesUrls.length > 1 && (
                            <div className={s.imagenNavegacion}>
                                <button type="button" onClick={() => setIndiceImagen((i) => (i - 1 + imagenesUrls.length) % imagenesUrls.length)} className={s.navBoton}>‹ Anterior</button>
                                <span className={s.navIndicador}>{indiceImagen + 1} de {imagenesUrls.length}</span>
                                <button type="button" onClick={() => setIndiceImagen((i) => (i + 1) % imagenesUrls.length)} className={s.navBoton}>Siguiente ›</button>
                            </div>
                        )}
                        {documentoUrl && (
                            <div className={s.docCard}>
                                <div className={s.docPreview}>
                                    <iframe src={documentoUrl} className={s.docPreviewIframe} title="Vista previa" scrolling="no" />
                                    <div className={s.docPreviewMask} />
                                </div>
                                <div className={s.docAcciones}>
                                    <button type="button" className={s.docBotonVer} onClick={() => setVisorDoc(true)}>Ver documento</button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <button
                    type="button"
                    className={`${s.botonHelp} ${isSpeaking ? s.botonSpeaking : ''}`}
                    onClick={handleVoz}
                    title={isSpeaking ? "Detener lectura" : "Escuchar anuncio"}
                >
                    {isSpeaking ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                    )}
                </button>
            </main>
        </div>
    );
};

export default KioscoDetalle;