import { useState, useEffect, useCallback } from 'react';
import './App.css';
import DashboardLayout from './pages/DashboardLayout';

const ROLES = [
  { value: 'editor',       label: 'Editor o Revisor — CRUD completo'        },
  { value: 'visualizador', label: 'Visualizador — solo lectura'    },
];

const App = () => {
  const [anuncios, setAnuncios]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [rolSimulado, setRolSimulado] = useState('editor');

  const fetchAnuncios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/anuncios');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      setAnuncios(await response.json());
    } catch (err) {
      console.error('Error al obtener anuncios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnuncios(); }, [fetchAnuncios]);

  useEffect(() => {
    document.title = 'SUTUS — Sistema de Anuncios';
  }, []);

  return (
    <div className="app-container">

      {/* Banner de simulación de roles — solo para el Sprint 1 demo */}
      <div className="rol-simulador-banner">
        <span className="rol-simulador-label">
          🔧 Simulador de permisos (Sprint 1 demo)
        </span>
        <select
          className="rol-simulador-select"
          value={rolSimulado}
          onChange={(e) => setRolSimulado(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <DashboardLayout
        anuncios={anuncios}
        onAnuncioCreado={fetchAnuncios}
        rolUsuario={rolSimulado}
        loading={loading}
      />
    </div>
  );
};

export default App;