import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFullscreen } from '../components/FullscreenContext';
import ModalDocumento from '../components/ModalDocumento';
import MiniaturaPDF from '../components/MiniaturaPDF';
import s from '../styles/KioscoDetalle.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
                const response = await fetch(`${API}/anuncios/${id}`);
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
                <ModalDocumento
                    urlDocumento={documentoUrl}
                    alCerrar={() => setVisorDoc(false)}
                />
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

                    <div className={s.mediaGrid}>
                        {/* ── Galería de imágenes ── */}
                        {imagenActual && (
                            <div className={s.galeriaBloque}>
                                <button
                                    type="button"
                                    className={s.galeriaImgPrincipal}
                                    onClick={() => setLightboxImg(true)}
                                >
                                    <img src={imagenActual} alt={anuncio.titulo} onError={(e) => { e.target.src = IMAGEN_DEFAULT; }} />
                                    <div className={s.galeriaZoomHint}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                                        </svg>
                                        Ampliar
                                    </div>
                                </button>

                                {imagenesUrls.length > 1 && (
                                    <div className={s.galeriaTira}>
                                        {imagenesUrls.map((url, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className={`${s.galeriaMiniBtn} ${i === indiceImagen ? s.galeriaMiniActiva : ''}`}
                                                onClick={() => setIndiceImagen(i)}
                                            >
                                                <img src={url} alt={`Imagen ${i + 1}`} onError={(e) => { e.target.src = IMAGEN_DEFAULT; }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Documento adjunto ── */}
                        {documentoUrl && (
                            <div className={s.docBloque}>
                                <div className={s.docBloqueHeader}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10 9 9 9 8 9"/>
                                    </svg>
                                    <span>Documento adjunto</span>
                                    <span className={s.docTipoBadge}>{anuncio.documento_tipo?.toUpperCase() ?? 'PDF'}</span>
                                </div>
                                <div className={s.docBloquePreview}>
                                    <MiniaturaPDF url={documentoUrl} />
                                    <div className={s.docPreviewMask} />
                                </div>
                                <button type="button" className={s.docBotonVer} onClick={() => setVisorDoc(true)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    Ver documento
                                </button>
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