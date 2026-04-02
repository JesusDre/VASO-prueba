import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HistoriaCard({ historia }) {
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const tienePorcentaje = historia.total_nodos > 0 && historia.nodo_actual;

    return (
        <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer', transition: 'transform .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate(`/historia/${historia.id}`)}>

            {/* Portada */}
            {(() => {
                const src = historia.portada_base64
                    ? `data:image/png;base64,${historia.portada_base64}`
                    : historia.portada_url || null;
                return (
                    <div style={{
                        height: 180,
                        background: src
                            ? `url(${src}) center/cover`
                            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        borderRadius: '0.375rem 0.375rem 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {!src && <span style={{ fontSize: 48, opacity: 0.4 }}>📖</span>}
                    </div>
                );
            })()}

            <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold mb-1" style={{ fontSize: '1rem' }}>
                    {historia.titulo}
                </h5>
                <p className="card-text text-muted small flex-grow-1"
                    style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {historia.descripcion || 'Sin descripcion'}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">
                        {new Date(historia.fecha_creacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' })}
                    </small>
                    <span className="badge bg-success">Publicada</span>
                </div>
            </div>
        </div>
    );
}
