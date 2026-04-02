import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readHistorias } from '../services/api';
import Navbar from '../components/Navbar';
import HistoriaCard from '../components/HistoriaCard';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [historias, setHistorias] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        readHistorias()
            .then((res) => {
                // Solo historias publicadas para el lector
                setHistorias(res.data.filter((h) => h.publicada));
            })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, []);

    const filtradas = historias.filter((h) =>
        h.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        (h.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a' }}>
            <Navbar />

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
                padding: '64px 0 48px',
            }}>
                <div className="container text-center">
                    <h1 className="fw-bold mb-3" style={{ color: '#e94560', fontSize: '2.5rem' }}>
                        Novelas Visuales
                    </h1>
                    <p className="text-white-50 mb-4" style={{ fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
                        Explora historias interactivas y toma decisiones que cambian el rumbo de la narrativa.
                    </p>

                    {/* CTA para visitantes sin sesion */}
                    {!usuario && (
                        <div className="d-flex justify-content-center gap-3 mb-4">
                            <button
                                onClick={() => navigate('/registro')}
                                style={{ background: '#e94560', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 8, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                Crear cuenta
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '10px 28px', borderRadius: 8, fontSize: '1rem', cursor: 'pointer' }}>
                                Iniciar sesion
                            </button>
                        </div>
                    )}

                    <input
                        type="text"
                        className="form-control form-control-lg mx-auto"
                        style={{ maxWidth: 420, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        placeholder="Buscar historia..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
            </div>

            {/* Historias */}
            <div className="container py-5">
                {cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: '#e94560' }} />
                        <p className="text-white-50 mt-3">Cargando historias...</p>
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-white-50" style={{ fontSize: '1.1rem' }}>
                            {filtro ? 'No hay historias que coincidan.' : 'Aun no hay historias publicadas.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <h5 className="text-white-50 mb-4">{filtradas.length} historia{filtradas.length !== 1 ? 's' : ''} disponible{filtradas.length !== 1 ? 's' : ''}</h5>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                            {filtradas.map((h) => (
                                <div className="col" key={h.id}>
                                    <HistoriaCard historia={h} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
