import { useState, useCallback } from 'react';
import {
  obtenerAnuncios,
  crearAnuncio,
  editarAnuncio,
  eliminarAnuncio,
} from '../services/anuncios.services';

export const useAnuncios = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnuncios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerAnuncios();
      setAnuncios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAnuncio = useCallback(async (payload) => {
    const nuevo = await crearAnuncio(payload);
    setAnuncios((prev) => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const updateAnuncio = useCallback(async (id, payload) => {
    const actualizado = await editarAnuncio(id, payload);
    setAnuncios((prev) =>
      prev.map((a) => (a.id === id ? actualizado : a))
    );
    return actualizado;
  }, []);

  const removeAnuncio = useCallback(async (id) => {
    await eliminarAnuncio(id);
    setAnuncios((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    anuncios,
    loading,
    error,
    fetchAnuncios,
    addAnuncio,
    updateAnuncio,
    removeAnuncio,
  };
};