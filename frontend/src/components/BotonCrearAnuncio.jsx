import React from 'react';
import styles from '../styles/dashboard.module.css';

const BotonCrearAnuncio = ({ onClick }) => (
  <button 
  type="button" 
  className={styles.createButton} 
  onClick={onClick} >
    + Crear Anuncio
  </button>
);

export default BotonCrearAnuncio;
