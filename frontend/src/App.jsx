import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import DashboardLayout from './pages/DashboardLayout';
import LoginPage       from './pages/LoginPage';
import KioscoLista     from './pages/KioscoLista';
import KioscoDetalle   from './pages/KioscoDetalle';

import { FullscreenProvider } from './components/FullscreenContext';

const ROLES_DASHBOARD = ['admin', 'editor', 'revisor'];
const ROLES_KIOSCO    = ['visualizador'];
const ROLES_VER_KIOSCO = [...ROLES_DASHBOARD, ...ROLES_KIOSCO];

const rutaPorRol = (rol) =>
    ROLES_KIOSCO.includes(rol) ? '/display' : '/dashboard';

const RutaProtegida = ({ children, rolesPermitidos }) => {
    const token = localStorage.getItem('sutus_token');
    const rol   = localStorage.getItem('sutus_rol');

    if (!token) return <Navigate to="/login" replace />;

    if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
        return <Navigate to={rutaPorRol(rol)} replace />;
    }

    return children;
};

const App = () => {
    const [anuncios,    setAnuncios]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [rolUsuario,  setRolUsuario]  = useState(localStorage.getItem('sutus_rol'));

    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sutus_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch('http://localhost:3001/anuncios', { headers });
            if (!res.ok) throw new Error('Error al cargar anuncios');
            const data = await res.json();
            setAnuncios(data);
        } catch (err) {
            console.error("Error fetching ads:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnuncios();
    }, [fetchAnuncios]);

    const alIniciarSesion = () => {
        setRolUsuario(localStorage.getItem('sutus_rol'));
        fetchAnuncios();
    };

    return (
        <FullscreenProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to={rolUsuario ? rutaPorRol(rolUsuario) : "/login"} replace />}
                    />

                    <Route path="/login" element={<LoginPage onLoginSuccess={alIniciarSesion} />} />

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

                    <Route
                        path="/display"
                        element={
                            <RutaProtegida rolesPermitidos={ROLES_VER_KIOSCO}>
                                <KioscoLista />
                            </RutaProtegida>
                        }
                    />

                    <Route
                        path="/display/:id"
                        element={
                            <RutaProtegida rolesPermitidos={ROLES_VER_KIOSCO}>
                                <KioscoDetalle />
                            </RutaProtegida>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </FullscreenProvider>
    );
};

export default App;