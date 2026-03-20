import React from 'react';
import styles from '../styles/dashboard.module.css';

const ACENTOS = ['#2e7d32', '#e65100', '#1565c0', '#6a1b9a'];

const MetricaItem = ({ label, valor, acento }) => (
  <div className={styles.metricCard} style={{ '--acento': acento }}>
    <div
      className={styles.metricAccent}
      style={{ backgroundColor: acento }}
    />
    <div className={styles.metricContent}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{valor}</span>
    </div>
  </div>
);

const Encabezado = ({ activos, total, pantallas, ultimaActualizacion }) => (
  <header className={styles.dashboardHeader}>
    <MetricaItem
      label="Anuncios Activos"
      valor={activos}
      acento={ACENTOS[0]}
    />
    <MetricaItem
      label="Total de Anuncios"
      valor={total}
      acento={ACENTOS[1]}
    />
    <MetricaItem
      label="Pantallas Activas"
      valor={pantallas}
      acento={ACENTOS[2]}
    />
    <MetricaItem
      label="Última Actualización"
      valor={ultimaActualizacion}
      acento={ACENTOS[3]}
    />
  </header>
);

export default Encabezado;
