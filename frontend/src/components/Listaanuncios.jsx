import React from 'react';
import BotonEstado from './BotonEstado';
import styles from '../styles/dashboard.module.css';

const TIPO_CLASES = { general: 'tipoGeneral', evento: 'tipoEvento', convocatoria: 'tipoConvocatoria', votacion: 'tipoVotacion', resultado: 'tipoResultado' };
const PRIO_CLASES = { 3: 'prioAlta', 2: 'prioMedia', 1: 'prioBaja' };
const PRIO_LABELS = { 3: 'Alta', 2: 'Media', 1: 'Baja' };

const ListaAnuncios = ({
    anuncios,
    puedeEditar,
    onEditar,
    onEliminar,
    onVer,
    onVerAuditoria,
    onToggleEstado,
}) => (
    <div className={styles.announcementsTableContainer}>
        <div className={styles.listaTitleRow}>
            <h3 className={styles.listaTitle}>Gestión de Anuncios</h3>
            <span className={styles.listaContador}>{anuncios.length} anuncios</span>
        </div>

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
                {anuncios.length === 0 ? (
                    <tr className={styles.emptyTableRow}>
                        <td colSpan={5}>
                            <div className={styles.emptyTableCell}>
                                <div className={styles.emptyTableIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#9eaa9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M3 9h18M9 21V9" />
                                    </svg>
                                </div>
                                <p className={styles.emptyTableTitle}>La lista está vacía</p>
                                <p className={styles.emptyTableSub}>
                                    {puedeEditar
                                        ? 'Usa el botón "+ Nuevo Anuncio" para agregar el primero.'
                                        : 'Aún no hay anuncios publicados.'}
                                </p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    anuncios.map((anuncio) => {
                        const tipoClase = styles[TIPO_CLASES[anuncio.tipo]] ?? '';
                        const prioClase = styles[PRIO_CLASES[anuncio.prioridad]] ?? styles.prioMedia;
                        const prioLabel = PRIO_LABELS[anuncio.prioridad] ?? 'Media';
                        const tipoLabel = anuncio.tipo
                            ? anuncio.tipo.charAt(0).toUpperCase() + anuncio.tipo.slice(1)
                            : '—';

                        return (
                            <tr key={anuncio.id}>
                                <td>
                                    <div className={styles.tdTitulo}>{anuncio.titulo}</div>
                                    {anuncio.descripcion_corta && (
                                        <div className={styles.tddescripcion_corta}>{anuncio.descripcion_corta}</div>
                                    )}
                                </td>
                                <td>
                                    <span className={`${styles.badgeTipoTable} ${tipoClase}`}>{tipoLabel}</span>
                                </td>
                                <td>
                                    <span className={`${styles.badgePrioTable} ${prioClase}`}>{prioLabel}</span>
                                </td>
                                <td>
                                    <BotonEstado
                                        id={anuncio.id}
                                        estado={anuncio.estado}
                                        onToggle={onToggleEstado}
                                        disabled={!puedeEditar}
                                    />
                                </td>
                                <td>
                                    <div className={styles.accionesGroupTable}>
                                        <button className={styles.btnVer} onClick={() => onVer(anuncio)}>
                                            👁 Ver
                                        </button>
                                        <button
                                            className={styles.btnAuditoria}
                                            onClick={() => typeof onVerAuditoria === 'function' && onVerAuditoria(anuncio.id)}
                                            title="Ver registro de cambios"
                                            disabled={!onVerAuditoria}
                                        >
                                            📋 Cambios
                                        </button>
                                        {puedeEditar && (
                                            <>
                                                <button className={styles.btnEditTable} onClick={() => onEditar(anuncio)}>
                                                    ✎ Editar
                                                </button>
                                                <button className={styles.btnDeleteTable} onClick={() => onEliminar(anuncio.id)}>
                                                    🗑 Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
);

export default ListaAnuncios;