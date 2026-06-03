import React from 'react';
import styles from '../styles/dashboard.module.css';

const CarruselAnuncios = ({
    anuncios,
    indice,
    onAnterior,
    onSiguiente,
    onIrA,
    obtenerUrlImagen,
}) => {
    const item = anuncios[indice];
    if (!item) return null;

    const IMAGEN_DEFAULT = '/imagen_default.jpg';

    const tieneImagenes = item.imagenes && item.imagenes.length > 0;
    const urlFinal = tieneImagenes ? obtenerUrlImagen(item) : IMAGEN_DEFAULT;


    return (
        <section
            className={styles.carouselContainer}
            // Aplicamos la imagen de fondo siempre (si no hay, se pone la default)
            style={{ backgroundImage: `url(${urlFinal})` }}
        >
            <button className={styles.carouselNavBtnAnt} onClick={onAnterior}>‹</button>

            <div className={styles.carouselContent}>
                <div className={styles.carouselItem} key={item.id}>
                    <div className={styles.carouselText}>
                        <span className={styles.previsualizacionLabel}>PREVISUALIZACIÓN DE ANUNCIOS</span>
                        <h2>{item.titulo}</h2>
                        <p>{item.descripcion_corta}</p>
                    </div>
                    <div className={styles.carouselImageArea}>
                        {/* Quitamos la condición del placeholder para mostrar 
                           siempre la etiqueta img con el fallback 
                        */}
                        <img
                            src={urlFinal}
                            alt={item.titulo}
                            className={styles.carouselImage}
                            // Por seguridad, si la URL del servidor falla, carga la default
                            onError={(e) => { e.target.src = IMAGEN_DEFAULT; }}
                        />
                    </div>
                </div>
            </div>

            <button className={styles.carouselNavBtnSig} onClick={onSiguiente}>›</button>

            <div className={styles.carouselDots}>
                {anuncios.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.carouselDot} ${i === indice ? styles.carouselDotActive : ''}`}
                        onClick={() => onIrA(i)}
                    />
                ))}
            </div>
        </section>
    );
};

export default CarruselAnuncios;
