import React from 'react';
import styles from '../styles/dashboard.module.css';

const BotonPanelControl = ({ onClick }) => (
    <button
        type="button"
        className={styles.navbarActionButton}
        onClick={onClick}
    >
        Panel de Control
    </button>
);

export default BotonPanelControl;