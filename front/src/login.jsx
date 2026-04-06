import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import './styles/login.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(formData);
            navigate('/');
        } catch (apiError) {
            const message =
                apiError.response?.data?.detail ||
                'No fue posible iniciar sesión. Verifica tus credenciales.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Navbar />

            <div className="login-body">
                <div className="login-card">
                    {/* Logo */}
                    <div className="login-logo">C</div>

                    <h1 className="login-title">Bienvenido</h1>
                    <p className="login-subtitle">Acceso para la comunidad creativa</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label htmlFor="email" className="login-label">
                                Usuario <span className="login-required">*</span>
                            </label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label htmlFor="password" className="login-label">
                                Contraseña <span className="login-required">*</span>
                            </label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="login-error" role="alert">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    <p className="login-footer">
                        ¿No tienes cuenta? <Link to="/registro">Crea una</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
