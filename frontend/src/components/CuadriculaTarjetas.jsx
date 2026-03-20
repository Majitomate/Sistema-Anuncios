import React from 'react';
import styles from '../styles/dashboard.module.css';
import TarjetaAnuncio from './TarjetaAnuncio';

const CuadriculaTarjetas = ({ anuncios, onEditar, onEliminar, onAbrirDocumento }) => (
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
        onEditar={() => onEditar(anuncio)}
        onEliminar={() => onEliminar(anuncio.id)}
        onAbrirDocumento={onAbrirDocumento}
      />
    ))}
  </section>
);

export default CuadriculaTarjetas;