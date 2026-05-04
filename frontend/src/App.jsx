import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Asegúrate de tenerlo instalado
import './App.css';
import DashboardLayout from './pages/DashboardLayout';
import LoginPage       from './pages/LoginPage';
import KioscoLista     from './pages/KioscoLista';
import KioscoDetalle   from './pages/KioscoDetalle';

const ROLES_DASHBOARD = ['admin', 'editor', 'revisor'];
const ROLES_KIOSCO    = ['visualizador'];
const ROLES_TODOS     = [...ROLES_DASHBOARD, ...ROLES_KIOSCO];

const rutaPorRol = (rol) =>
    ROLES_KIOSCO.includes(rol) ? '/display' : '/dashboard';

const RutaProtegida = ({ children, rolesPermitidos }) => {
    const token = localStorage.getItem('sutus_token');
    const rol   = localStorage.getItem('sutus_rol');
    if (!token) return <Navigate to="/login" replace />;
    if (rolesPermitidos && !rolesPermitidos.includes(rol))
        return <Navigate to={rutaPorRol(rol)} replace />;
    return children;
};

const App = () => {
    const [anuncios,    setAnuncios]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [rolUsuario,  setRolUsuario]  = useState(
        () => localStorage.getItem('sutus_rol') || null
    );

    // --- FUNCIÓN PARA CERRAR SESIÓN (Centralizada) ---
    const cerrarSesion = useCallback(() => {
        localStorage.removeItem('sutus_token');
        localStorage.removeItem('sutus_rol');
        setRolUsuario(null);
        window.location.href = '/login'; 
    }, []);

    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sutus_token');
            if (!token) return;

            const res = await fetch('http://localhost:3001/anuncios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 1. SI EL TOKEN CADUCÓ (401)
            if (res.status === 401) {
                Swal.fire({
                    title: 'Sesión expirada',
                    text: 'Por seguridad, ingresa tus credenciales nuevamente.',
                    icon: 'warning',
                    confirmButtonColor: '#ff6224'
                }).then(() => {
                    cerrarSesion();
                });
                return;
            }

            if (!res.ok) throw new Error('Error en la respuesta del servidor');

            const data = await res.json();
            setAnuncios(data);
        } catch (error) {
            console.error("Error al obtener anuncios:", error);
        } finally {
            setLoading(false);
        }
    }, [cerrarSesion]);

    useEffect(() => {
        fetchAnuncios();
    }, [fetchAnuncios]);

    // 2. FUNCIÓN PARA ACTUALIZAR ESTADO TRAS LOGIN EXITOSO
    // Pásala al componente LoginPage
    const alIniciarSesion = () => {
        setRolUsuario(localStorage.getItem('sutus_rol'));
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        localStorage.getItem('sutus_token') && rolUsuario
                            ? <Navigate to={rutaPorRol(rolUsuario)} replace />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* Pasamos alIniciarSesion para que App se entere del cambio */}
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
                        <RutaProtegida rolesPermitidos={ROLES_TODOS}>
                            <KioscoLista />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/display/:id"
                    element={
                        <RutaProtegida rolesPermitidos={ROLES_TODOS}>
                            <KioscoDetalle />
                        </RutaProtegida>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;