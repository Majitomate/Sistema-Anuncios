import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import DashboardLayout from './pages/DashboardLayout';
import LoginPage       from './pages/LoginPage';
import KioscoLista     from './pages/KioscoLista';
import KioscoDetalle   from './pages/KioscoDetalle';

// ── Roles ────────────────────────────────────────────────────────────────────
// admin, editor, revisor → /dashboard
// visualizador           → /display
const ROLES_DASHBOARD = ['admin', 'editor', 'revisor'];
const ROLES_KIOSCO    = ['visualizador'];
const ROLES_TODOS     = [...ROLES_DASHBOARD, ...ROLES_KIOSCO];

const rutaPorRol = (rol) =>
    ROLES_KIOSCO.includes(rol) ? '/display' : '/dashboard';

// ── Guardia de ruta ──────────────────────────────────────────────────────────
const RutaProtegida = ({ children, rolesPermitidos }) => {
    const token = localStorage.getItem('sutus_token');
    const rol   = localStorage.getItem('sutus_rol');

    if (!token)                                       return <Navigate to="/login" replace />;
    if (rolesPermitidos && !rolesPermitidos.includes(rol))
        return <Navigate to={rutaPorRol(rol)} replace />;

    return children;
};

// ── App ──────────────────────────────────────────────────────────────────────
const App = () => {
    const [anuncios, setAnuncios] = useState([]);
    const [loading, setLoading]   = useState(true);

    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        try {
            const token    = localStorage.getItem('sutus_token');
            const headers  = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await fetch('http://localhost:3001/anuncios', { headers });
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            setAnuncios(await response.json());
        } catch (err) {
            console.error('Error al obtener anuncios:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnuncios(); }, [fetchAnuncios]);
    useEffect(() => { document.title = 'SUTUS — Sistema de Anuncios'; }, []);

    const rolUsuario = localStorage.getItem('sutus_rol') ?? 'visualizador';

    return (
        <BrowserRouter>
            <Routes>

                {/* Raíz: redirige según sesión activa */}
                <Route
                    path="/"
                    element={
                        localStorage.getItem('sutus_token')
                            ? <Navigate to={rutaPorRol(rolUsuario)} replace />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* Login público */}
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard — admin, editor, revisor */}
                <Route
                    path="/dashboard"
                    element={
                        <RutaProtegida rolesPermitidos={ROLES_DASHBOARD}>
                            <DashboardLayout
                                anuncios={anuncios}
                                onAnuncioCreado={fetchAnuncios}
                                rolUsuario={rolUsuario}
                                loading={loading}
                            />
                        </RutaProtegida>
                    }
                />

                {/* Kiosco lista — todos los roles autenticados */}
                <Route
                    path="/display"
                    element={
                        <RutaProtegida rolesPermitidos={ROLES_TODOS}>
                            <KioscoLista />
                        </RutaProtegida>
                    }
                />

                {/* Kiosco detalle — todos los roles autenticados */}
                <Route
                    path="/display/:id"
                    element={
                        <RutaProtegida rolesPermitidos={ROLES_TODOS}>
                            <KioscoDetalle />
                        </RutaProtegida>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    );
};

export default App;