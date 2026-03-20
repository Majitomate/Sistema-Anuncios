import React, { useState, useCallback, useMemo } from 'react';
import Encabezado from '../components/Encabezado.jsx';
import CuadriculaTarjetas from '../components/CuadriculaTarjetas.jsx';
import CrearAnuncio from '../pages/CrearAnuncio.jsx';
import styles from '../styles/dashboard.module.css';

const bufferToUrl = (bufferObj, mimeType) => {
    if (!bufferObj || !bufferObj.data) return null;
    const bytes = new Uint8Array(bufferObj.data);
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
};

const DashboardLayout = ({ anuncios, onAnuncioCreado }) => {
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [anuncioAEditar, setAnuncioAEditar] = useState(null);
    const [vistaActual, setVistaActual] = useState('cuadricula');
    const [indiceCarrusel, setIndiceCarrusel] = useState(0);

    const handleAnuncioCreado = useCallback(() => {
        setMostrarCrear(false);
        setAnuncioAEditar(null);
        onAnuncioCreado();
    }, [onAnuncioCreado]);

    const handleEditarClick = (anuncio) => {
        setAnuncioAEditar(anuncio);
        setMostrarCrear(true);
    };

    const anunciosCarrusel = useMemo(() => {
        return anuncios.filter(a => a.estado).slice(0, 5);
    }, [anuncios]);

    const sigAnuncio = () => {
        setIndiceCarrusel((prev) => (prev + 1) % anunciosCarrusel.length);
    };

    const antAnuncio = () => {
        setIndiceCarrusel((prev) => (prev - 1 + anunciosCarrusel.length) % anunciosCarrusel.length);
    };

    if (mostrarCrear) {
        return (
            <CrearAnuncio
                anuncioInicial={anuncioAEditar} // Pasamos el anuncio si existe
                alCerrar={() => {
                    setMostrarCrear(false);
                    setAnuncioAEditar(null);
                }}
                alCrear={handleAnuncioCreado}
            />
        );
    }

    const anunciosActivos = anuncios.filter((a) => a.estado);

    return (
        <div className={styles.dashboardLayout}>
            <nav className={styles.navbar}>
                <span className={styles.navbarTitle}>Dashboard de Anuncios SUTUS</span>
                <div className={styles.navbarActions}>
                    <button
                        type="button"
                        className={styles.navbarActionButton}
                        onClick={() => setMostrarCrear(true)}
                    >
                        + Nuevo Anuncio
                    </button>
                    <div className={styles.viewSwitcher}>
                        <button
                            className={`${styles.switchBtn} ${vistaActual === 'cuadricula' ? styles.active : ''}`}
                            onClick={() => setVistaActual('cuadricula')}
                        >
                            🔲 Grid
                        </button>
                        <button
                            className={`${styles.switchBtn} ${vistaActual === 'lista' ? styles.active : ''}`}
                            onClick={() => setVistaActual('lista')}
                        >
                            📄 Lista
                        </button>
                    </div>
                </div>
            </nav>

            <main className={styles.mainContent}>
                {anunciosCarrusel.length > 0 && (
                    <section className={styles.carouselContainer}>
                        <button className={styles.carouselNavBtnAnt} onClick={antAnuncio}>‹</button>
                        <div className={styles.carouselContent}>
                            <div className={styles.carouselItem} key={anunciosCarrusel[indiceCarrusel].id}>
                                <div className={styles.carouselText}>
                                    <span className={styles.previsualizacionLabel}>PREVISUALIZACIÓN DE ANUNCIOS</span>
                                    <h2>{anunciosCarrusel[indiceCarrusel].titulo}</h2>
                                    <p>{anunciosCarrusel[indiceCarrusel].subtitulo}</p>
                                </div>
                                <div className={styles.carouselImageArea}>
                                    {anunciosCarrusel[indiceCarrusel].imagen ? (
                                        <img
                                            src={bufferToUrl(anunciosCarrusel[indiceCarrusel].imagen, anunciosCarrusel[indiceCarrusel].imagen_tipo)}
                                            alt=""
                                            className={styles.carouselPreImage}
                                        />
                                    ) : (
                                        <div className={styles.noImagePlaceholder}>Sin Imagen</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className={styles.carouselNavBtnSig} onClick={sigAnuncio}>›</button>
                        <div className={styles.carouselDots}>
                            {anunciosCarrusel.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.carouselDot} ${index === indiceCarrusel ? styles.carouselDotActive : ''}`}
                                    onClick={() => setIndiceCarrusel(index)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <Encabezado
                    activos={anunciosActivos.length}
                    total={anuncios.length}
                    pantallas={1}
                    ultimaActualizacion={new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                />

                <div style={{ marginTop: '24px' }}>
                    {vistaActual === 'cuadricula' ? (
                        <CuadriculaTarjetas anuncios={anuncios} />
                    ) : (
                        <div className={styles.announcementsTableContainer}>
                            <h3 className={styles.listaTitle}>Gestión Detallada de Anuncios</h3>
                            <table className={styles.announcementsTable}>
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Tipo</th>
                                        <th>Prioridad</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {anuncios.map(anuncio => (
                                        <tr key={anuncio.id}>
                                            <td className={styles.tdTitulo}>{anuncio.titulo}</td>
                                            <td><span className={styles.badgeTipoTable}>{anuncio.tipo}</span></td>
                                            <td>{anuncio.prioridad}</td>
                                            <td className={anuncio.estado ? styles.statusOnTable : styles.statusOffTable}>
                                                {anuncio.estado ? 'Activo' : 'Inactivo'}
                                            </td>
                                            <td className={styles.accionesGroupTable}>
                                                <button 
                                                    className={styles.btnEditTable}
                                                    onClick={() => handleEditarClick(anuncio)}
                                                >
                                                    ✎ Editar
                                                </button>
                                                <button className={styles.btnDeleteTable}>🗑 Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;