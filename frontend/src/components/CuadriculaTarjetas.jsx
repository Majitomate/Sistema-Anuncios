import React from 'react';
import styles from '../styles/dashboard.module.css';
import TarjetaAnuncio from './TarjetaAnuncio';

const CuadriculaTarjetas = ({ anuncios, onAbrirDocumento }) => (
  <section className={styles.announcementsGrid}>
    {anuncios.map((anuncio) => (
      <TarjetaAnuncio
        key={anuncio.id}
        id={anuncio.id}
        titulo={anuncio.titulo}
        tipo={anuncio.tipo}
        subtitulo={anuncio.subtitulo}
        prioridad={anuncio.prioridad}
        estado={anuncio.estado}
        onAbrirDocumento={onAbrirDocumento} // Pasamos la función a cada tarjeta
      />
    ))}
  </section>
);

export default CuadriculaTarjetas;