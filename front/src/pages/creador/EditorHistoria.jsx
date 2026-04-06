import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    readHistoria, createHistoria, updateHistoria,
    readNodos, createNodo, updateNodo, deleteNodo,
    readOpciones, createOpcion, updateOpcion, deleteOpcion,
    readImagenes, createImagen, deleteImagen,
    readAudios, createAudio, deleteAudio,
    readPersonajes, createPersonaje, updatePersonaje, deletePersonaje,
    readNodoPersonajes, createNodoPersonaje, deleteNodoPersonaje,
} from '../../services/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// -------------------------------------------------------
// Estilos comunes (tema claro)
// -------------------------------------------------------
const inputStyle = {
    width: '100%',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: '0.9rem',
};
const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginBottom: 6,
};
const selectStyle = {
    ...inputStyle,
    height: 42,
    cursor: 'pointer',
};
const btnPrimary = {
    background: 'var(--accent)',
    border: 'none',
    color: 'white',
    padding: '9px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
};
const btnGhost = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.9rem',
};
const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 20,
    boxShadow: 'var(--shadow-sm)',
};

// -------------------------------------------------------
// Tab 1: Info básica de la historia (Configurar Introducción)
// -------------------------------------------------------
function TabInfo({ historia, historiaId, usuario, onGuardado }) {
    const FORM_INICIAL = { titulo: '', descripcion: '', publicada: false, id_nodo_inicio: '', id_portada: '' };
    const [form, setForm] = useState(historia
        ? {
            titulo: historia.titulo,
            descripcion: historia.descripcion,
            publicada: historia.publicada,
            id_nodo_inicio: historia.id_nodo_inicio || '',
            id_portada: historia.id_portada || '',
        }
        : FORM_INICIAL);
    const [nodos, setNodos] = useState([]);
    const [portadas, setPortadas] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (historiaId) {
            readNodos().then((r) => {
                setNodos(r.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
            }).catch(() => {});
        }
        readImagenes().then((r) => {
            setPortadas(r.data.filter((i) => i.tipo === 'portada'));
        }).catch(() => {});
    }, [historiaId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrores({});
        const payload = {
            titulo: form.titulo,
            descripcion: form.descripcion,
            publicada: form.publicada,
            id_creador: usuario.id,
            id_nodo_inicio: form.id_nodo_inicio || null,
            id_portada: form.id_portada || null,
        };
        try {
            if (historiaId) {
                await updateHistoria(historiaId, payload);
                toast.success('Historia guardada');
            } else {
                const res = await createHistoria(payload);
                toast.success('Historia creada');
                onGuardado(res.data.id);
            }
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            toast.error('Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    // Preview de portada
    const portadaSeleccionada = portadas.find((p) => p.id === Number(form.id_portada));
    const portadaSrc = portadaSeleccionada
        ? (portadaSeleccionada.imagen_base64_display
            ? `data:image/png;base64,${portadaSeleccionada.imagen_base64_display}`
            : portadaSeleccionada.url
                ? `http://localhost:8000${portadaSeleccionada.url}`
                : null)
        : null;

    return (
        <form onSubmit={handleGuardar}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Columna izquierda: portada */}
                <div style={{ width: 240, flexShrink: 0 }}>
                    <p style={labelStyle}>Imagen de Portada</p>
                    <div style={{
                        border: '2px dashed var(--border)',
                        borderRadius: 10,
                        height: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: portadaSrc ? 'transparent' : 'var(--surface-2)',
                        backgroundImage: portadaSrc ? `url(${portadaSrc})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        gap: 8,
                        color: 'var(--text-muted)',
                    }}>
                        {!portadaSrc && (
                            <>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Haz clic para subir portada
                                </span>
                            </>
                        )}
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <label style={labelStyle}>Seleccionar portada</label>
                        <select name="id_portada" value={form.id_portada} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin portada --</option>
                            {portadas.map((p) => (
                                <option key={p.id} value={p.id}>{p.descripcion || `Portada ${p.id}`}</option>
                            ))}
                        </select>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                            Sube la portada primero en "Recursos".
                        </p>
                    </div>
                </div>

                {/* Columna derecha: formulario */}
                <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Título de la Novela *</label>
                        <input
                            type="text"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            required
                            disabled={guardando}
                            placeholder="Ej. El Misterio del Edificio A"
                            style={inputStyle}
                        />
                        {errores.titulo && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errores.titulo.join(', ')}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Categoría</label>
                            <select style={selectStyle} defaultValue="misterio">
                                <option value="misterio">Misterio</option>
                                <option value="aventura">Aventura</option>
                                <option value="romance">Romance</option>
                                <option value="terror">Terror</option>
                                <option value="fantasia">Fantasía</option>
                                <option value="ciencia-ficcion">Ciencia Ficción</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Estado</label>
                            <select
                                value={form.publicada ? 'publicado' : 'borrador'}
                                onChange={(e) => setForm({ ...form, publicada: e.target.value === 'publicado' })}
                                disabled={guardando}
                                style={selectStyle}
                            >
                                <option value="borrador">Borrador</option>
                                <option value="publicado">Publicado</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            <svg style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Sinopsis / Prólogo
                        </label>
                        <textarea
                            name="descripcion"
                            rows={5}
                            value={form.descripcion}
                            onChange={handleChange}
                            disabled={guardando}
                            placeholder="Este texto se mostrará en la introducción de tu historia..."
                            style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
                        />
                    </div>

                    {historiaId && nodos.length > 0 && (
                        <div>
                            <label style={labelStyle}>Nodo de inicio</label>
                            <select name="id_nodo_inicio" value={form.id_nodo_inicio} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin nodo de inicio --</option>
                                {nodos.map((n) => (
                                    <option key={n.id} value={n.id}>{n.titulo_nodo} (ID {n.id})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!form.publicada && (
                        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px' }}>
                            <p style={{ color: '#92400e', fontSize: '0.84rem' }}>
                                Tu historia está en modo borrador. Solo tú puedes verla.
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        <button type="submit" disabled={guardando} style={btnPrimary}>
                            {guardando ? 'Guardando...' : historiaId ? 'Guardar cambios' : 'Guardar y Continuar'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

// -------------------------------------------------------
// Tab 2: Recursos (imágenes y audios)
// -------------------------------------------------------
function TabRecursos() {
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [subiendo, setSubiendo] = useState(false);
    const [imgFile, setImgFile] = useState(null);
    const [imgTipo, setImgTipo] = useState('escenario');
    const [imgDesc, setImgDesc] = useState('');
    const [audFile, setAudFile] = useState(null);
    const [audDesc, setAudDesc] = useState('');
    const [seccion, setSeccion] = useState('imagenes');

    const cargar = async () => {
        const [ri, ra] = await Promise.all([readImagenes(), readAudios()]);
        setImagenes(ri.data);
        setAudios(ra.data);
    };

    useEffect(() => { cargar(); }, []);

    const subirImagen = async (e) => {
        e.preventDefault();
        if (!imgFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendo(true);
        const fd = new FormData();
        fd.append('imagen_para_binario', imgFile);
        fd.append('tipo', imgTipo);
        fd.append('descripcion', imgDesc);
        try {
            await createImagen(fd);
            toast.success('Imagen subida');
            setImgFile(null);
            setImgDesc('');
            e.target.reset();
            cargar();
        } catch { toast.error('Error al subir imagen'); }
        finally { setSubiendo(false); }
    };

    const subirAudio = async (e) => {
        e.preventDefault();
        if (!audFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendo(true);
        const fd = new FormData();
        fd.append('archivo', audFile);
        fd.append('descripcion', audDesc);
        try {
            await createAudio(fd);
            toast.success('Audio subido');
            setAudFile(null);
            setAudDesc('');
            e.target.reset();
            cargar();
        } catch { toast.error('Error al subir audio'); }
        finally { setSubiendo(false); }
    };

    const eliminarImagen = async (id) => {
        if (!window.confirm('¿Eliminar imagen?')) return;
        await deleteImagen(id);
        toast.success('Imagen eliminada');
        cargar();
    };

    const eliminarAudio = async (id) => {
        if (!window.confirm('¿Eliminar audio?')) return;
        await deleteAudio(id);
        toast.success('Audio eliminado');
        cargar();
    };

    const tipoLabel = { escenario: 'Fondo', personaje: 'Personaje', portada: 'Portada' };
    const tipoBadgeBg = { escenario: '#dbeafe', personaje: '#ede9fe', portada: '#fee2e2' };
    const tipoBadgeColor = { escenario: '#1d4ed8', personaje: '#6d28d9', portada: '#dc2626' };

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['imagenes', 'audios'].map((s) => (
                    <button key={s} onClick={() => setSeccion(s)} style={{
                        background: seccion === s ? 'var(--accent-light)' : 'transparent',
                        border: '1px solid ' + (seccion === s ? 'var(--accent)' : 'var(--border)'),
                        color: seccion === s ? 'var(--accent)' : 'var(--text-muted)',
                        borderRadius: 8, padding: '6px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                    }}>
                        {s === 'imagenes' ? 'Imágenes' : 'Audios'}
                    </button>
                ))}
            </div>

            {seccion === 'imagenes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                    <div style={cardStyle}>
                        <h6 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Subir imagen</h6>
                        <form onSubmit={subirImagen}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Tipo de imagen</label>
                                <select value={imgTipo} onChange={(e) => setImgTipo(e.target.value)} style={selectStyle}>
                                    <option value="escenario">Fondo de escena</option>
                                    <option value="personaje">Sprite de personaje</option>
                                    <option value="portada">Portada de historia</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Descripción</label>
                                <input type="text" value={imgDesc} onChange={(e) => setImgDesc(e.target.value)} placeholder="Ej: Bosque nocturno" style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Archivo (PNG, JPG, WebP)</label>
                                <input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files[0])} style={{ ...inputStyle, padding: '6px 10px' }} />
                            </div>
                            <button type="submit" disabled={subiendo} style={{ ...btnPrimary, width: '100%' }}>
                                {subiendo ? 'Subiendo...' : 'Subir imagen'}
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {imagenes.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin imágenes. Sube la primera.</p>
                        )}
                        {imagenes.map((img) => (
                            <div key={img.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 60, height: 60, borderRadius: 7, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                    {img.imagen_base64_display ? (
                                        <img src={`data:image/png;base64,${img.imagen_base64_display}`} alt={img.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : img.url ? (
                                        <img src={`http://localhost:8000${img.url}`} alt={img.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.65rem' }}>IMG</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{img.descripcion || `Imagen ${img.id}`}</div>
                                    <span style={{ background: tipoBadgeBg[img.tipo] || '#f1f5f9', color: tipoBadgeColor[img.tipo] || 'var(--text-muted)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                                        {tipoLabel[img.tipo] || img.tipo}
                                    </span>
                                </div>
                                <button onClick={() => eliminarImagen(img.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {seccion === 'audios' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                    <div style={cardStyle}>
                        <h6 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Subir audio</h6>
                        <form onSubmit={subirAudio}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Descripción</label>
                                <input type="text" value={audDesc} onChange={(e) => setAudDesc(e.target.value)} placeholder="Ej: Música de tensión" style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Archivo (MP3, OGG, WAV)</label>
                                <input type="file" accept="audio/*" onChange={(e) => setAudFile(e.target.files[0])} style={{ ...inputStyle, padding: '6px 10px' }} />
                            </div>
                            <button type="submit" disabled={subiendo} style={{ ...btnPrimary, width: '100%' }}>
                                {subiendo ? 'Subiendo...' : 'Subir audio'}
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {audios.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin audios. Sube el primero.</p>
                        )}
                        {audios.map((a) => (
                            <div key={a.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.descripcion || `Audio ${a.id}`}</div>
                                    {a.archivo && (
                                        <audio controls style={{ marginTop: 4, height: 28, width: '100%' }}>
                                            <source src={`http://localhost:8000${a.archivo}`} />
                                        </audio>
                                    )}
                                </div>
                                <button onClick={() => eliminarAudio(a.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}>
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// Tab 3: Personajes
// -------------------------------------------------------
function TabPersonajes({ historiaId }) {
    const FORM_P = { nombre: '', id_imagen: '' };
    const [personajes, setPersonajes] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [nodoPersonajes, setNodoPersonajes] = useState([]);
    const [form, setForm] = useState(FORM_P);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [asignForm, setAsignForm] = useState({ id_personaje: '', id_nodo: '', posicion: 'centro' });
    const [asignando, setAsignando] = useState(false);

    const cargar = async () => {
        const [rp, ri, rn, rnp] = await Promise.all([readPersonajes(), readImagenes(), readNodos(), readNodoPersonajes()]);
        setPersonajes(rp.data.filter((p) => Number(p.id_historia) === Number(historiaId)));
        setImagenes(ri.data.filter((i) => i.tipo === 'personaje'));
        setNodos(rn.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
        setNodoPersonajes(rnp.data);
    };

    useEffect(() => { cargar(); }, [historiaId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const payload = { nombre: form.nombre, id_historia: Number(historiaId), id_imagen: form.id_imagen || null };
        try {
            if (editandoId) { await updatePersonaje(editandoId, payload); toast.success('Personaje actualizado'); }
            else { await createPersonaje(payload); toast.success('Personaje creado'); }
            setForm(FORM_P); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar personaje'); }
        finally { setGuardando(false); }
    };

    const eliminarPersonaje = async (id) => {
        if (!window.confirm('¿Eliminar personaje?')) return;
        await deletePersonaje(id); toast.success('Personaje eliminado'); cargar();
    };

    const editar = (p) => { setForm({ nombre: p.nombre, id_imagen: p.id_imagen || '' }); setEditandoId(p.id); };

    const handleAsign = async (e) => {
        e.preventDefault(); setAsignando(true);
        try {
            await createNodoPersonaje({ id_nodo: Number(asignForm.id_nodo), id_personaje: Number(asignForm.id_personaje), posicion: asignForm.posicion });
            toast.success('Personaje asignado al nodo');
            setAsignForm({ id_personaje: '', id_nodo: '', posicion: 'centro' }); cargar();
        } catch { toast.error('Ya existe esa asignación o hubo un error'); }
        finally { setAsignando(false); }
    };

    const eliminarAsignacion = async (id) => { await deleteNodoPersonaje(id); toast.success('Asignación eliminada'); cargar(); };
    const getNombrePersonaje = (id) => personajes.find((p) => p.id === id)?.nombre || `P${id}`;
    const getNombreNodo = (id) => nodos.find((n) => n.id === id)?.titulo_nodo || `N${id}`;
    const getImgSrc = (p) => {
        const img = imagenes.find((i) => i.id === p.id_imagen);
        if (!img) return null;
        if (img.imagen_base64_display) return `data:image/png;base64,${img.imagen_base64_display}`;
        if (img.url) return `http://localhost:8000${img.url}`;
        return null;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={cardStyle}>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>{editandoId ? 'Editar personaje' : 'Nuevo personaje'}</h6>
                    <form onSubmit={handleGuardar}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>Nombre</label>
                            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Aria" />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Sprite (imagen de personaje)</label>
                            <select name="id_imagen" value={form.id_imagen} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin sprite --</option>
                                {imagenes.map((i) => <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>{guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}</button>
                            {editandoId && <button type="button" onClick={() => { setForm(FORM_P); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                        </div>
                    </form>
                </div>

                {personajes.length > 0 && nodos.length > 0 && (
                    <div style={cardStyle}>
                        <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 16, fontSize: '0.95rem' }}>Asignar a nodo</h6>
                        <form onSubmit={handleAsign}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Personaje</label>
                                <select value={asignForm.id_personaje} onChange={(e) => setAsignForm({ ...asignForm, id_personaje: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Personaje --</option>
                                    {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Nodo</label>
                                <select value={asignForm.id_nodo} onChange={(e) => setAsignForm({ ...asignForm, id_nodo: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Nodo --</option>
                                    {nodos.map((n) => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Posición en pantalla</label>
                                <select value={asignForm.posicion} onChange={(e) => setAsignForm({ ...asignForm, posicion: e.target.value })} style={selectStyle}>
                                    <option value="izquierda">Izquierda</option>
                                    <option value="centro">Centro</option>
                                    <option value="derecha">Derecha</option>
                                </select>
                            </div>
                            <button type="submit" disabled={asignando} style={{ ...btnPrimary, width: '100%' }}>{asignando ? '...' : 'Asignar'}</button>
                        </form>
                    </div>
                )}
            </div>

            <div>
                {personajes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin personajes. Crea el primero.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {personajes.map((p) => {
                            const src = getImgSrc(p);
                            const asignaciones = nodoPersonajes.filter((np) => np.id_personaje === p.id);
                            return (
                                <div key={p.id} style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: asignaciones.length > 0 ? 10 : 0 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)', flexShrink: 0 }}>
                                            {src ? (
                                                <img src={src} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.65rem' }}>SIN</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.nombre}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{asignaciones.length} nodo{asignaciones.length !== 1 ? 's' : ''}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => editar(p)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                            <button onClick={() => eliminarPersonaje(p.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                                        </div>
                                    </div>
                                    {asignaciones.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                            {asignaciones.map((np) => (
                                                <span key={np.id} style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', color: '#6d28d9', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    {getNombreNodo(np.id_nodo)} · {np.posicion}
                                                    <button onClick={() => eliminarAsignacion(np.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// Tab 4: Gestión de Nodos / Escenas
// -------------------------------------------------------
function TabNodos({ historiaId }) {
    const FORM = { titulo_nodo: '', texto: '', es_final: false, id_imagen_escenario: '', id_audio_fondo: '' };
    const [nodos, setNodos] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargar();
        Promise.all([readImagenes(), readAudios()]).then(([i, a]) => {
            setImagenes(i.data); setAudios(a.data);
        }).catch(() => {});
    }, [historiaId]);

    const cargar = async () => {
        const res = await readNodos();
        setNodos(res.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleGuardar = async (e) => {
        e.preventDefault(); setGuardando(true); setErrores({});
        const payload = { titulo_nodo: form.titulo_nodo, texto: form.texto, es_final: form.es_final, id_historia: Number(historiaId), id_imagen_escenario: form.id_imagen_escenario || null, id_audio_fondo: form.id_audio_fondo || null };
        try {
            if (editandoId) { await updateNodo(editandoId, payload); toast.success('Nodo actualizado'); }
            else { await createNodo(payload); toast.success('Nodo creado'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            else toast.error('Error al guardar');
        } finally { setGuardando(false); }
    };

    const editar = (n) => {
        setForm({ titulo_nodo: n.titulo_nodo, texto: n.texto, es_final: n.es_final, id_imagen_escenario: n.id_imagen_escenario || '', id_audio_fondo: n.id_audio_fondo || '' });
        setEditandoId(n.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar este nodo?')) return;
        await deleteNodo(id); toast.success('Nodo eliminado'); cargar();
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>{editandoId ? 'Editar nodo' : 'Nuevo nodo'}</h6>
                <form onSubmit={handleGuardar}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Título interno</label>
                        <input type="text" name="titulo_nodo" value={form.titulo_nodo} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Escena 1" />
                        {errores.titulo_nodo && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{errores.titulo_nodo.join(', ')}</p>}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Texto narrativo / Diálogo</label>
                        <textarea name="texto" rows={5} value={form.texto} onChange={handleChange} required disabled={guardando} style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} placeholder="Lo que verá el lector..." />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Imagen de escenario (fondo)</label>
                        <select name="id_imagen_escenario" value={form.id_imagen_escenario} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin imagen --</option>
                            {imagenes.filter(i => i.tipo === 'escenario').map(i => <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Audio de fondo</label>
                        <select name="id_audio_fondo" value={form.id_audio_fondo} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin audio --</option>
                            {audios.map(a => <option key={a.id} value={a.id}>{a.descripcion || `Audio ${a.id}`}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <input type="checkbox" id="es_final" name="es_final" checked={form.es_final} onChange={handleChange} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                        <label htmlFor="es_final" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Es nodo final</label>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>{guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}</button>
                        {editandoId && <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                    </div>
                </form>
            </div>

            <div>
                {nodos.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin nodos. Crea el primero.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {nodos.map((n) => (
                            <div key={n.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{n.titulo_nodo}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                                        ID {n.id}
                                        {n.es_final && ' · Final'}
                                        {n.id_imagen_escenario && ' · Con fondo'}
                                        {n.id_audio_fondo && ' · Con audio'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => editar(n)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                    <button onClick={() => eliminar(n.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
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
// Tab 5: Gestión de Opciones / Decisiones
// -------------------------------------------------------
function TabOpciones({ historiaId }) {
    const FORM = { texto_opcion: '', id_nodo_origen: '', id_nodo_destino: '' };
    const [opciones, setOpciones] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargar();
        readNodos().then(r => setNodos(r.data.filter(n => Number(n.id_historia) === Number(historiaId)))).catch(() => {});
    }, [historiaId]);

    const cargar = async () => {
        const [resOp, resNod] = await Promise.all([readOpciones(), readNodos()]);
        const nodosHistoria = new Set(resNod.data.filter(n => Number(n.id_historia) === Number(historiaId)).map(n => n.id));
        setOpciones(resOp.data.filter(o => nodosHistoria.has(o.id_nodo_origen)));
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGuardar = async (e) => {
        e.preventDefault(); setGuardando(true);
        const payload = { texto_opcion: form.texto_opcion, id_nodo_origen: Number(form.id_nodo_origen), id_nodo_destino: Number(form.id_nodo_destino) };
        try {
            if (editandoId) { await updateOpcion(editandoId, payload); toast.success('Opción actualizada'); }
            else { await createOpcion(payload); toast.success('Opción creada'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardando(false); }
    };

    const editar = (o) => { setForm({ texto_opcion: o.texto_opcion, id_nodo_origen: o.id_nodo_origen, id_nodo_destino: o.id_nodo_destino }); setEditandoId(o.id); };
    const eliminar = async (id) => { if (!window.confirm('¿Eliminar opción?')) return; await deleteOpcion(id); toast.success('Opción eliminada'); cargar(); };
    const nombreNodo = (id) => nodos.find(n => n.id === id)?.titulo_nodo || `Nodo ${id}`;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>{editandoId ? 'Editar opción' : 'Nueva opción'}</h6>
                <form onSubmit={handleGuardar}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Texto de la opción</label>
                        <input type="text" name="texto_opcion" value={form.texto_opcion} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Lo que elige el lector" />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Nodo origen</label>
                        <select name="id_nodo_origen" value={form.id_nodo_origen} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                            <option value="">-- Desde qué nodo --</option>
                            {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Nodo destino</label>
                        <select name="id_nodo_destino" value={form.id_nodo_destino} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                            <option value="">-- A qué nodo lleva --</option>
                            {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>{guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}</button>
                        {editandoId && <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                    </div>
                </form>
            </div>

            <div>
                {opciones.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin opciones. Crea la primera.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {opciones.map((o) => (
                            <div key={o.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{o.texto_opcion}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                                        {nombreNodo(o.id_nodo_origen)} → {nombreNodo(o.id_nodo_destino)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => editar(o)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                    <button onClick={() => eliminar(o.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
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
// Componente principal
// -------------------------------------------------------
export default function EditorHistoria() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [historia, setHistoria] = useState(null);
    const [historiaId, setHistoriaId] = useState(id || null);
    const [tab, setTab] = useState('info');
    const [cargando, setCargando] = useState(!!id);

    useEffect(() => {
        if (id) {
            readHistoria(id)
                .then((r) => setHistoria(r.data))
                .catch(() => toast.error('Historia no encontrada'))
                .finally(() => setCargando(false));
        }
    }, [id]);

    const onHistoriaCreada = (nuevoId) => {
        setHistoriaId(nuevoId);
        navigate(`/creador/historia/${nuevoId}`, { replace: true });
    };

    const tabs = [
        { key: 'info',       label: 'Configurar Introducción' },
        { key: 'recursos',   label: 'Recursos',           disabled: !historiaId },
        { key: 'personajes', label: 'Personajes',         disabled: !historiaId },
        { key: 'nodos',      label: 'Nodos / Escenas',    disabled: !historiaId },
        { key: 'opciones',   label: 'Opciones',           disabled: !historiaId },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Toaster position="top-right" />
            <Navbar />

            {/* Header del editor */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => navigate('/creador')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: '0.9rem', padding: 0 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                            {historiaId ? `Diseñando: ${historia?.titulo || '...'}` : 'Nueva Historia'}
                        </div>
                        {historiaId && (
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginTop: 1 }}>
                                {tab === 'nodos' && 'Editor de escenas'}
                                {tab === 'info' && 'Configuración general'}
                                {tab === 'recursos' && 'Gestión de recursos'}
                                {tab === 'personajes' && 'Personajes'}
                                {tab === 'opciones' && 'Opciones de decisión'}
                            </div>
                        )}
                    </div>

                    {historiaId && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 14px',
                                borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-2)',
                                fontSize: '0.84rem', fontWeight: 600, color: historia?.publicada ? 'var(--green)' : 'var(--yellow)',
                            }}>
                                {historia?.publicada ? 'Publicado' : 'Borrador'}
                            </span>
                            <button
                                onClick={() => { setTab('info'); }}
                                style={{ ...btnPrimary, height: 34, padding: '0 16px', fontSize: '0.84rem' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                    Guardar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: 0, overflowX: 'auto' }}>
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            disabled={t.disabled}
                            onClick={() => setTab(t.key)}
                            style={{
                                background: 'none',
                                border: 'none',
                                borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '14px 18px',
                                cursor: t.disabled ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                color: tab === t.key ? 'var(--accent)' : t.disabled ? '#c0cfe0' : 'var(--text-muted)',
                                fontWeight: tab === t.key ? 700 : 500,
                                fontSize: '0.88rem',
                                transition: 'color 0.15s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
                {cargando ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                    </div>
                ) : (
                    <>
                        {tab === 'info' && <TabInfo historia={historia} historiaId={historiaId} usuario={usuario} onGuardado={onHistoriaCreada} />}
                        {tab === 'recursos' && historiaId && <TabRecursos />}
                        {tab === 'personajes' && historiaId && <TabPersonajes historiaId={historiaId} />}
                        {tab === 'nodos' && historiaId && <TabNodos historiaId={historiaId} />}
                        {tab === 'opciones' && historiaId && <TabOpciones historiaId={historiaId} />}
                    </>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
