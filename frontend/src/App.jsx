import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import DashboardLayout from './pages/DashboardLayout';
import LoginPage from './pages/LoginPage';
import KioscoLista from './pages/KioscoLista';
import KioscoDetalle from './pages/KioscoDetalle';
import EstadoConexion from './pages/EstadoConexion';
import { FullscreenProvider } from './components/FullscreenContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ROLES_DASHBOARD = ['admin', 'editor', 'revisor'];
const ROLES_KIOSCO = ['visualizador'];

const rutaPorRol = (rol) =>
    ROLES_KIOSCO.includes(rol) ? '/display' : '/dashboard';

const RutaProtegida = ({ children, rolesPermitidos }) => {
    const token = localStorage.getItem('sutus_token');
    const rol = localStorage.getItem('sutus_rol');

    if (!token) return <Navigate to="/login" replace />;

    if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
        return <Navigate to={rutaPorRol(rol)} replace />;
    }

    return children;
};

const App = () => {
    const [anuncios, setAnuncios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rolUsuario, setRolUsuario] = useState(localStorage.getItem('sutus_rol'));

    const fetchAnuncios = useCallback(async () => {
        const token = localStorage.getItem('sutus_token');

        // Si no hay token, no intentamos la petición y marcamos que terminó de cargar
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await fetch(`${API}/anuncios`, { headers });

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

        // Sincronización automática cada minuto para activar anuncios por hora
        const intervalo = setInterval(() => {
            fetchAnuncios();
        }, 60000);

        return () => clearInterval(intervalo);
    }, [fetchAnuncios]);

    const alIniciarSesion = () => {
        setRolUsuario(localStorage.getItem('sutus_rol'));
        fetchAnuncios();
    };

    return (
        <FullscreenProvider>
            <BrowserRouter>
                <Routes>
                    {/* Ruta raíz: Redirecciona automáticamente según la sesión */}
                    <Route
                        path="/"
                        element={<Navigate to={rolUsuario ? rutaPorRol(rolUsuario) : "/login"} replace />}
                    />

                    {/* Login del sistema */}
                    <Route path="/login" element={<LoginPage onLoginSuccess={alIniciarSesion} />} />

                    {/* 🟢 RUTAS PÚBLICAS PARA LA TABLET (Sin protección de contraseña) */}
                    <Route path="/display" element={<KioscoLista />} />
                    <Route path="/display/:id" element={<KioscoDetalle />} />

                    {/* 🔴 RUTAS PRIVADAS (Para Administradores y Editores) */}
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
                        path="/estado-conexion"
                        element={
                            <RutaProtegida rolesPermitidos={['admin']}>
                                <EstadoConexion />
                            </RutaProtegida>
                        }
                    />

                    {/* Ruta de escape: Si escriben cualquier cosa errónea, los manda al inicio */}
                    <Route path="*" element={<Navigate to="/" replace />} />



                </Routes>
            </BrowserRouter>
        </FullscreenProvider>
    );
};

export default App;