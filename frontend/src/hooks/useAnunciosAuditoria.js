import { useState, useCallback } from 'react';
import { obtenerAuditoria } from '../services/anuncios.services';

export const useAnuncioAuditoria = () => {
  const [auditoriaData, setAuditoriaData] = useState(null);
  const [loading, setCanLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarAuditoria = useCallback(async (id) => {
    // Recuperamos el token del almacenamiento
    const token = localStorage.getItem('sutus_token'); 
    
    setCanLoading(true);
    setError(null);
    try {
      const data = await obtenerAuditoria(id, token);
      setAuditoriaData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCanLoading(false);
    }
  }, []);

  const limpiarAuditoria = useCallback(() => {
    setAuditoriaData(null);
    setError(null);
  }, []);

  return {
    auditoriaData,
    loading,
    error,
    cargarAuditoria,
    limpiarAuditoria,
  };
};