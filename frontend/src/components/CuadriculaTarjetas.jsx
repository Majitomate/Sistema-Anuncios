import React from 'react';
import styles from '../styles/dashboard.module.css';
import TarjetaAnuncio from './TarjetaAnuncio';

const CuadriculaTarjetas = ({ anuncios, onEditar, onEliminar, onAbrirDocumento, puedeEditar }) => (
  <section className={styles.announcementsGrid}>
    {anuncios.map((anuncio) => (
      <TarjetaAnuncio
        key={anuncio.id}
        id={anuncio.id}
        titulo={anuncio.titulo}
        tipo={anuncio.tipo}
        descripcion_corta={anuncio.descripcion_corta || ''} 
        tieneDocumento={!!anuncio.documento_tipo}
        id_imagen_principal={anuncio.id_imagen_principal}
        prioridad={anuncio.prioridad}
        estado={anuncio.estado}
        onEditar={() => onEditar(anuncio)}
        onEliminar={() => onEliminar(anuncio.id)}
        onAbrirDocumento={onAbrirDocumento}
        puedeEditar={puedeEditar}
      />
    ))}
  </section>
);

export default CuadriculaTarjetas;