import { useState, useEffect } from 'react';
import {
    readHistorias, updateHistoria,
    readUsuarios, deleteUsuario,
    readRoles, createRol, updateRol, deleteRol,
} from '../../services/api';
import Navbar from '../../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

// -------------------------------------------------------
// Tab Historias: aprobar / despublicar
// -------------------------------------------------------
function TabHistorias() {
    const [historias, setHistorias] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const rh = await readHistorias();
            setHistorias(rh.data);
        } catch { toast.error('Error al cargar historias'); }
        finally { setCargando(false); }
    };

    const togglePublicar = async (h) => {
        const tid = toast.loading(h.publicada ? 'Despublicando...' : 'Publicando...');
        try {
            await updateHistoria(h.id, { ...h, publicada: !h.publicada });
            toast.success(h.publicada ? 'Historia despublicada' : 'Historia publicada', { id: tid });
            cargar();
        } catch { toast.error('Error al cambiar estado', { id: tid }); }
    };

    const filtradas = historias.filter((h) => {
        if (filtro === 'publicadas') return h.publicada;
        if (filtro === 'borradores') return !h.publicada;
        return true;
    });

    const FILTROS = [
        { key: 'todos', label: 'Todos' },
        { key: 'publicadas', label: 'Publicadas' },
        { key: 'borradores', label: 'Borradores' },
    ];

    return (
        <div>
            {/* Filtros */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {FILTROS.map(({ key, label }) => (
                    <button key={key} onClick={() => setFiltro(key)} style={{
                        height: 32,
                        padding: '0 16px',
                        borderRadius: 20,
                        border: `1px solid ${filtro === key ? 'var(--accent)' : 'var(--border)'}`,
                        background: filtro === key ? 'var(--accent-light)' : 'var(--surface)',
                        color: filtro === key ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: filtro === key ? 700 : 500,
                        fontSize: '0.83rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}>
                        {label} {filtro === key && `(${filtradas.length})`}
                    </button>
                ))}
            </div>

            {cargando ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <Spinner />
                </div>
            ) : filtradas.length === 0 ? (
                <Empty texto="Sin historias en esta categoría." />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtradas.map((h) => (
                        <div key={h.id} style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            boxShadow: 'var(--shadow-sm)',
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.93rem' }}>
                                        {h.titulo}
                                    </span>
                                    <span className={`nv-badge ${h.publicada ? 'nv-badge-green' : 'nv-badge-yellow'}`}>
                                        {h.publicada ? 'Publicada' : 'Borrador'}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {h.nombre_creador && <span>Autor: {h.nombre_creador}</span>}
                                    <span>·</span>
                                    <span>ID {h.id}</span>
                                    <span>·</span>
                                    <span>{new Date(h.fecha_creacion).toLocaleDateString('es-MX')}</span>
                                </div>
                                {h.descripcion && (
                                    <p style={{
                                        color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4,
                                        overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                                    }}>
                                        {h.descripcion}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => togglePublicar(h)} style={{
                                height: 32,
                                padding: '0 14px',
                                borderRadius: 7,
                                border: `1px solid ${h.publicada ? 'var(--red)' : 'var(--green)'}`,
                                background: h.publicada ? 'var(--red-bg)' : 'var(--green-bg)',
                                color: h.publicada ? 'var(--red)' : 'var(--green)',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'opacity 0.15s',
                            }}>
                                {h.publicada ? 'Despublicar' : 'Publicar'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// Tab Usuarios: ver, activar/desactivar, eliminar
// -------------------------------------------------------
function TabUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const [ru, rr] = await Promise.all([readUsuarios(), readRoles()]);
            setUsuarios(ru.data);
            setRoles(rr.data);
        } catch { toast.error('Error al cargar usuarios'); }
        finally { setCargando(false); }
    };

    const toggleActivo = async (u) => {
        const tid = toast.loading(u.activo ? 'Desactivando...' : 'Activando...');
        try {
            const res = await fetch(`http://localhost:8000/api/usuarios/${u.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ activo: !u.activo }),
            });
            if (!res.ok) throw new Error();
            toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado', { id: tid });
            cargar();
        } catch { toast.error('Error al cambiar estado', { id: tid }); }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este usuario permanentemente?')) return;
        const tid = toast.loading('Eliminando...');
        try {
            await deleteUsuario(id);
            toast.success('Usuario eliminado', { id: tid });
            cargar();
        } catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreRol = (id) => roles.find((r) => r.id === id)?.nombre_rol || '—';

    const filtrados = usuarios.filter((u) =>
        `${u.nombre} ${u.apellido_paterno} ${u.email}`.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="nv-input"
                style={{ maxWidth: 360, marginBottom: 20 }}
            />

            {cargando ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <Spinner />
                </div>
            ) : filtrados.length === 0 ? (
                <Empty texto="Sin resultados." />
            ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                                    <th key={h} style={{
                                        padding: '10px 18px',
                                        textAlign: 'left',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.07em',
                                        color: 'var(--text-muted)',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
                                        {u.nombre} {u.apellido_paterno}
                                    </td>
                                    <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {u.email}
                                    </td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <span className="nv-badge nv-badge-blue">
                                            {nombreRol(u.id_rol)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <span className={`nv-badge ${u.activo ? 'nv-badge-green' : ''}`} style={!u.activo ? {
                                            background: 'var(--red-bg)', color: 'var(--red)',
                                        } : {}}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <div style={{ display: 'inline-flex', gap: 8 }}>
                                            <button onClick={() => toggleActivo(u)} style={{
                                                height: 30,
                                                padding: '0 12px',
                                                border: '1px solid var(--border)',
                                                borderRadius: 6,
                                                background: 'var(--surface)',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.78rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}>
                                                {u.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button onClick={() => handleEliminar(u.id)} style={{
                                                height: 30,
                                                padding: '0 12px',
                                                border: '1px solid var(--red)',
                                                borderRadius: 6,
                                                background: 'var(--red-bg)',
                                                color: 'var(--red)',
                                                fontSize: '0.78rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// Tab Roles: CRUD
// -------------------------------------------------------
function TabRoles() {
    const FORM = { nombre_rol: '' };
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { setRoles((await readRoles()).data); }
        catch { toast.error('Error al cargar roles'); }
        finally { setCargando(false); }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            if (editandoId) { await updateRol(editandoId, form); toast.success('Rol actualizado'); }
            else { await createRol(form); toast.success('Rol creado'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardando(false); }
    };

    const editar = (r) => { setForm({ nombre_rol: r.nombre_rol }); setEditandoId(r.id); };

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar este rol?')) return;
        try { await deleteRol(id); toast.success('Rol eliminado'); cargar(); }
        catch { toast.error('Error al eliminar'); }
    };

    return (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Formulario */}
            <div style={{ width: 280, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                    {editandoId ? 'Editar rol' : 'Nuevo rol'}
                </h3>
                <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label className="nv-label">Nombre del rol</label>
                        <input
                            type="text"
                            value={form.nombre_rol}
                            onChange={(e) => setForm({ nombre_rol: e.target.value })}
                            required
                            disabled={guardando}
                            placeholder="Ej: administrador, lector"
                            className="nv-input"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{
                            flex: 1,
                            height: 36,
                            background: 'var(--accent)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                        }}>
                            {guardando ? '...' : editandoId ? 'Actualizar' : 'Crear'}
                        </button>
                        {editandoId && (
                            <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={{
                                height: 36,
                                padding: '0 14px',
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                            }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de roles */}
            <div style={{ flex: 1, minWidth: 240 }}>
                {cargando ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}><Spinner /></div>
                ) : roles.length === 0 ? (
                    <Empty texto="Sin roles configurados." />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {roles.map((r) => (
                            <div key={r.id} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                                padding: '13px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: 'var(--shadow-sm)',
                            }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem' }}>{r.nombre_rol}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 10 }}>ID {r.id}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => editar(r)} style={{
                                        height: 30, padding: '0 12px',
                                        border: '1px solid var(--border)',
                                        borderRadius: 6, background: 'var(--yellow-bg)',
                                        color: 'var(--yellow)', fontSize: '0.8rem',
                                        fontWeight: 600, cursor: 'pointer',
                                    }}>
                                        Editar
                                    </button>
                                    <button onClick={() => eliminar(r.id)} style={{
                                        height: 30, padding: '0 12px',
                                        border: '1px solid var(--red)',
                                        borderRadius: 6, background: 'var(--red-bg)',
                                        color: 'var(--red)', fontSize: '0.8rem',
                                        fontWeight: 600, cursor: 'pointer',
                                    }}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// Helpers de UI
// -------------------------------------------------------
function Spinner() {
    return (
        <div style={{
            width: 28, height: 28, margin: '0 auto',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
        }} />
    );
}

function Empty({ texto }) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {texto}
        </div>
    );
}

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export default function AdminPanel() {
    const [tab, setTab] = useState('historias');

    const tabs = [
        { key: 'historias', label: 'Historias' },
        { key: 'usuarios', label: 'Usuarios' },
        { key: 'roles', label: 'Roles' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Toaster position="top-right" />
            <Navbar />

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                {/* Encabezado */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>
                        Panel de Administración
                    </h2>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Gestiona historias, usuarios y roles del sistema
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 28, display: 'flex', gap: 4 }}>
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                            padding: '10px 20px',
                            marginBottom: -1,
                            cursor: 'pointer',
                            color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                            fontWeight: tab === t.key ? 700 : 500,
                            fontSize: '0.92rem',
                            transition: 'color 0.15s',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'historias' && <TabHistorias />}
                {tab === 'usuarios' && <TabUsuarios />}
                {tab === 'roles' && <TabRoles />}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
