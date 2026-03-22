import React from 'react';
import styles from '../styles/dashboard.module.css';

const METRICAS = [
  {
    key: 'activos',
    label: 'Anuncios Activos',
    acento: '#2e7d32',
    iconoBg: '#e6f4ea',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    key: 'total',
    label: 'Total de Anuncios',
    acento: '#e65100',
    iconoBg: '#fff3e0',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#e65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
    ),
  },
  {
    key: 'pantallas',
    label: 'Pantallas Activas',
    acento: '#1565c0',
    iconoBg: '#e3f2fd',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    key: 'hora',
    label: 'Última Actualización',
    acento: '#6a1b9a',
    iconoBg: '#f3e5f5',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
];

const Encabezado = ({ activos, total, pantallas, ultimaActualizacion }) => {
  const valores = { activos, total, pantallas, hora: ultimaActualizacion };

  return (
    <header className={styles.dashboardHeader}>
      {METRICAS.map(({ key, label, acento, iconoBg, icono }) => (
        <div key={key} className={styles.metricCard}>
          <div className={styles.metricAccent} style={{ backgroundColor: acento }} />
          <div className={styles.metricContent}>
            <div className={styles.metricIcon} style={{ backgroundColor: iconoBg }}>
              {icono}
            </div>
            <span className={styles.metricLabel}>{label}</span>
            <span className={styles.metricValue}>{valores[key]}</span>
          </div>
        </div>
      ))}
    </header>
  );
};

export default Encabezado;