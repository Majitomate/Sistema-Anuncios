import { useState, useEffect, useCallback } from 'react';
import { obtenerAnuncioPorId } from '../services/anuncios.services';

export const useAnuncioDetalle = (id) => {
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnuncio = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await obtenerAnuncioPorId(id);
      setAnuncio(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setAnuncio(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnuncio();
  }, [fetchAnuncio]);

  return {
    anuncio,
    loading,
    error,
  };
};