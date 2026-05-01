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

    return (
        <section
            className={styles.carouselContainer}
            style={item.imagen_tipo ? { backgroundImage: `url(${obtenerUrlImagen(item)})` } : undefined}
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
                        {item.imagen_tipo ? (
                            <img
                                src={obtenerUrlImagen(item)}
                                alt={item.titulo}
                                className={styles.carouselImage}
                            />
                        ) : (
                            <div className={styles.noImagePlaceholder}>
                                <span>📄</span>
                                <p>Sin Imagen</p>
                            </div>
                        )}
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