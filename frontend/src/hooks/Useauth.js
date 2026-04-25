import { useState, useCallback } from 'react';

const API = 'http://localhost:3001';

// ── useAuth ──────────────────────────────────────────────────────────────────
const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API}/auth/login`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.mensaje ?? data.message ?? 'Credenciales incorrectas');
            }

            localStorage.setItem('sutus_token',   data.token);
            localStorage.setItem('sutus_rol',     data.rol);
            localStorage.setItem('sutus_nombre',  data.nombre ?? '');
            localStorage.setItem('sutus_email',   email);

            return data.rol;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('sutus_token');
        localStorage.removeItem('sutus_rol');
        localStorage.removeItem('sutus_nombre');
        localStorage.removeItem('sutus_email');
    }, []);

    const getToken = () => localStorage.getItem('sutus_token');
    const getRol   = () => localStorage.getItem('sutus_rol');

    return { login, logout, getToken, getRol, loading, error };
};

export default useAuth;