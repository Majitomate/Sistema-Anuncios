import { useState, useEffect, useCallback } from 'react';
import './App.css';
import DashboardLayout from './pages/DashboardLayout';
import PanelControl from './pages/PanelControl';

const App = () => {
    const [anuncios, setAnuncios] = useState([]);
    const [view, setView] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    const fetchAnuncios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/anuncios');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const data = await response.json();
            setAnuncios(data);
        } catch (err) {
            console.error("Error al obtener anuncios:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {fetchAnuncios();},[fetchAnuncios]);
    if (loading && anuncios.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando sistema de anuncios...</p>
            </div>
        );
    }

    return (
        <div className="app-container">
            {view === 'dashboard' ? (
                <DashboardLayout
                    anuncios={anuncios}
                    onAnuncioCreado={fetchAnuncios}
                    onIrAPanel={() => setView('panel')}
                />
            ) : (
                <PanelControl
                    anuncios={anuncios}
                    onRegresar={() => setView('dashboard')}
                    onActualizar={fetchAnuncios}
                />
            )}
        </div>
    );
};

export default App;