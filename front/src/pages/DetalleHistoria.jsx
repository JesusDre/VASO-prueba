import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readHistoria, readNodos, readProgresos, deleteProgreso, readUsuarios } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../styles/detalle-historia.css';

export default function DetalleHistoria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const [historia, setHistoria] = useState(null);
    const [autor, setAutor] = useState('');
    const [progreso, setProgreso] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [resHistoria, resNodos] = await Promise.all([
                    readHistoria(id),
                    readNodos(),
                ]);
                const hist = resHistoria.data;
                setHistoria(hist);
                setTotalNodos(resNodos.data.filter(
                    (n) => Number(n.id_historia) === Number(id)
                ).length);

                // Cargar autor (público)
                try {
                    const resUsuarios = await readUsuarios();
                    const autorObj = resUsuarios.data.find((u) => u.id === hist.id_creador);
                    if (autorObj) setAutor(`${autorObj.nombre} ${autorObj.apellido_paterno}`);
                } catch { /* no bloquear si falla */ }

                if (usuario) {
                    const resProgresos = await readProgresos();
                    const progresoExistente = resProgresos.data.find(
                        (p) => Number(p.id_historia) === Number(id)
                    );
                    setProgreso(progresoExistente || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [id, usuario]);

    const handleComenzar = () => navigate(`/leer/${id}`);

    const handleReiniciar = async () => {
        if (progreso) {
            try { await deleteProgreso(progreso.id); } catch { /* continuar igual */ }
        }
        navigate(`/leer/${id}`);
    };

    if (cargando) {
        return (
            <div className="dh-page">
                <Navbar />
                <div className="dh-spinner-wrap">
                    <div className="dh-spinner" />
                </div>
            </div>
        );
    }

    if (!historia) {
        return (
            <div className="dh-page">
                <Navbar />
                <div className="dh-not-found">
                    <p>Historia no encontrada.</p>
                    <button onClick={() => navigate('/')}>Volver al catálogo</button>
                </div>
            </div>
        );
    }

    const portadaSrc = historia.portada_base64
        ? `data:image/png;base64,${historia.portada_base64}`
        : historia.portada_url || null;

    return (
        <div className="dh-page">
            <Navbar />

            {/* Volver */}
            <div className="dh-back-bar">
                <button className="dh-back-btn" onClick={() => navigate('/')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver al catálogo
                </button>
            </div>

            {/* Hero card */}
            <div className="dh-hero-wrap">
                <div
                    className="dh-hero-card"
                    style={portadaSrc ? { backgroundImage: `url(${portadaSrc})` } : {}}
                >
                    {/* Overlay oscuro solo si hay imagen */}
                    {portadaSrc && <div className="dh-hero-overlay" />}

                    <div className={`dh-hero-content ${portadaSrc ? 'has-image' : 'no-image'}`}>
                        {/* Badge */}
                        <div className="dh-badge">Misterio • Novela Visual</div>

                        {/* Título */}
                        <h1 className="dh-title">{historia.titulo}</h1>

                        {/* Autor */}
                        {autor && (
                            <p className="dh-author">por {autor}</p>
                        )}

                        {/* Separador */}
                        <div className="dh-divider" />

                        {/* Descripción */}
                        {historia.descripcion && (
                            <p className="dh-description">
                                "{historia.descripcion}"
                            </p>
                        )}

                        {/* Botón */}
                        <div className="dh-actions">
                            <button className="dh-btn-comenzar" onClick={handleComenzar}>
                                {progreso ? 'Continuar Aventura' : 'Comenzar Aventura'}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            </button>
                            {progreso && (
                                <button className="dh-btn-reiniciar" onClick={handleReiniciar}>
                                    Reiniciar
                                </button>
                            )}
                        </div>

                        {!usuario && (
                            <p className="dh-login-hint">
                                <span onClick={() => navigate('/login')}>Inicia sesión</span> para guardar tu progreso.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
