import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { useTareasStore } from '../../hooks';

export const ModalCrearEditarTarea = ({ show, handleClose, tareaEditar = null }) => {
    const { startSaveTarea, startUpdateTarea, usuariosDisponibles, user } = useTareasStore();

    const [formValues, setFormValues] = useState({
        titulo: '',
        descripcion: '',
        asignadoA: '',
        prioridad: 'media',
        estado: 'pendiente',
        fechaVencimiento: '',
        etiquetas: []
    });

    const [subtareas, setSubtareas] = useState([]);
    const [nuevaSubtarea, setNuevaSubtarea] = useState('');
    const [nuevoTag, setNuevoTag] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const esEdicion = Boolean(tareaEditar && (tareaEditar._id || tareaEditar.id));

    // Cargar datos al abrir modal para editar o nuevo
    useEffect(() => {
        if (esEdicion) {
            setFormValues({
                titulo: tareaEditar.titulo || '',
                descripcion: tareaEditar.descripcion || '',
                asignadoA: tareaEditar.asignadoA?._id || tareaEditar.asignadoA?.id || tareaEditar.asignadoA || '',
                prioridad: tareaEditar.prioridad || 'media',
                estado: tareaEditar.estado || 'pendiente',
                fechaVencimiento: tareaEditar.fechaVencimiento ? tareaEditar.fechaVencimiento.slice(0, 10) : '',
                etiquetas: Array.isArray(tareaEditar.etiquetas) ? [...tareaEditar.etiquetas] : []
            });
            setSubtareas(Array.isArray(tareaEditar.checklist) ? [...tareaEditar.checklist] : []);
        } else {
            // Por defecto asignar al usuario actual si no hay ninguno seleccionado
            setFormValues({
                titulo: '',
                descripcion: '',
                asignadoA: user?.uid || user?._id || '',
                prioridad: 'media',
                estado: tareaEditar?.estado || 'pendiente',
                fechaVencimiento: '',
                etiquetas: []
            });
            setSubtareas([]);
        }
        setNuevaSubtarea('');
        setNuevoTag('');
    }, [tareaEditar, show, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Agregar subtarea
    const handleAddSubtarea = () => {
        if (!nuevaSubtarea.trim()) return;
        const newSub = {
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            texto: nuevaSubtarea.trim(),
            completada: false
        };
        setSubtareas(prev => [...prev, newSub]);
        setNuevaSubtarea('');
    };

    const handleToggleSub = (subId) => {
        setSubtareas(prev => prev.map(s => s.id === subId ? { ...s, completada: !s.completada } : s));
    };

    const handleDeleteSub = (subId) => {
        setSubtareas(prev => prev.filter(s => s.id !== subId));
    };

    // Manejo de tags
    const handleAddTag = () => {
        if (!nuevoTag.trim()) return;
        const cleanTag = nuevoTag.trim().replace(/^#/, '').toLowerCase();
        if (!formValues.etiquetas.includes(cleanTag)) {
            setFormValues(prev => ({
                ...prev,
                etiquetas: [...prev.etiquetas, cleanTag]
            }));
        }
        setNuevoTag('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormValues(prev => ({
            ...prev,
            etiquetas: prev.etiquetas.filter(t => t !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formValues.titulo.trim()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formValues,
                checklist: subtareas,
                asignadoA: formValues.asignadoA || null,
                fechaVencimiento: formValues.fechaVencimiento ? new Date(formValues.fechaVencimiento).toISOString() : null
            };

            const idEdicion = tareaEditar?._id || tareaEditar?.id;
            if (esEdicion && idEdicion) {
                await startUpdateTarea(idEdicion, payload);
            } else {
                await startSaveTarea(payload);
            }
            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Sugerencias rápidas de tags
    const tagsSugeridos = ['operaciones', 'cobros', 'pedidos', 'compras', 'finanzas', 'sistemas', 'clientes'];

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton className="bg-light border-bottom py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center shadow-xs" style={{ width: '36px', height: '36px' }}>
                        <i className={`fa-solid ${esEdicion ? 'fa-pencil' : 'fa-list-check'}`}></i>
                    </div>
                    <div>
                        <Modal.Title className="fs-6 fw-bold text-dark mb-0">
                            {esEdicion ? 'Editar Tarea' : 'Nueva Tarea'}
                        </Modal.Title>
                        <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                            {esEdicion ? 'Actualice la información y subtareas' : 'Asigne tareas a Leonardo, Oscar o a cualquier miembro del equipo'}
                        </small>
                    </div>
                </div>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4 bg-white">
                    {/* 1. Título */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">
                            Título de la tarea <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej. Revisar inventario de cirios para despacho..."
                            name="titulo"
                            value={formValues.titulo}
                            onChange={handleInputChange}
                            required
                            autoFocus
                            className="rounded-3 shadow-none fw-semibold"
                        />
                    </Form.Group>

                    {/* 2. Asignado y Prioridad */}
                    <Row className="g-3 mb-3">
                        <Col xs={12} md={6}>
                            <Form.Label className="small fw-bold text-secondary">
                                <i className="fa-solid fa-user-check me-1 text-primary"></i> Asignar a:
                            </Form.Label>
                            <Form.Select
                                name="asignadoA"
                                value={formValues.asignadoA}
                                onChange={handleInputChange}
                                className="rounded-3 shadow-none"
                            >
                                <option value="">-- Sin asignar (Libre) --</option>
                                {usuariosDisponibles.map(u => (
                                    <option key={u._id} value={u._id}>
                                        {u.name} {u.rol ? `(${u.rol})` : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="small fw-bold text-secondary">
                                <i className="fa-solid fa-flag me-1 text-warning"></i> Prioridad:
                            </Form.Label>
                            <Form.Select
                                name="prioridad"
                                value={formValues.prioridad}
                                onChange={handleInputChange}
                                className="rounded-3 shadow-none fw-medium"
                            >
                                <option value="baja">Baja (Normal)</option>
                                <option value="media">Media (Prioritaria)</option>
                                <option value="alta">Alta (Importante)</option>
                                <option value="urgente">Urgente (Crítica / Inmediata)</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    {/* 3. Estado y Fecha de Vencimiento */}
                    <Row className="g-3 mb-3">
                        <Col xs={12} md={6}>
                            <Form.Label className="small fw-bold text-secondary">
                                <i className="fa-solid fa-bars-progress me-1 text-info"></i> Estado inicial / actual:
                            </Form.Label>
                            <Form.Select
                                name="estado"
                                value={formValues.estado}
                                onChange={handleInputChange}
                                className="rounded-3 shadow-none fw-medium"
                            >
                                <option value="pendiente">Por Hacer / Pendiente</option>
                                <option value="en_progreso">En Progreso</option>
                                <option value="completada">Completada</option>
                            </Form.Select>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="small fw-bold text-secondary">
                                <i className="fa-regular fa-calendar-days me-1 text-secondary"></i> Fecha límite / vencimiento:
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="fechaVencimiento"
                                value={formValues.fechaVencimiento}
                                onChange={handleInputChange}
                                className="rounded-3 shadow-none"
                            />
                        </Col>
                    </Row>

                    {/* 4. Descripción */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">
                            Descripción / Detalles o notas:
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Detalles adicionales, enlaces, notas de seguimiento..."
                            name="descripcion"
                            value={formValues.descripcion}
                            onChange={handleInputChange}
                            className="rounded-3 shadow-none small"
                        />
                    </Form.Group>

                    {/* 5. Subtareas (Checklist interactivo) */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                        <Form.Label className="small fw-bold text-dark d-flex align-items-center justify-content-between mb-2">
                            <span>
                                <i className="fa-solid fa-list-check me-1 text-primary"></i> Checklist / Subtareas
                            </span>
                            {subtareas.length > 0 && (
                                <span className="small text-muted">
                                    {subtareas.filter(s => s.completada).length}/{subtareas.length} completadas
                                </span>
                            )}
                        </Form.Label>

                        <div className="input-group input-group-sm mb-2">
                            <Form.Control
                                type="text"
                                placeholder="Escribe un paso o subtarea y pulsa Enter..."
                                value={nuevaSubtarea}
                                onChange={(e) => setNuevaSubtarea(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSubtarea();
                                    }
                                }}
                                className="rounded-start-3"
                            />
                            <Button variant="primary" onClick={handleAddSubtarea} className="rounded-end-3 px-3">
                                <i className="fa-solid fa-plus me-1"></i> Agregar
                            </Button>
                        </div>

                        {/* Listado de subtareas agregadas */}
                        {subtareas.length > 0 ? (
                            <div className="d-flex flex-column gap-1.5 mt-1">
                                {subtareas.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-white border small shadow-xs"
                                    >
                                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                                            <input
                                                type="checkbox"
                                                className="form-check-input my-0"
                                                checked={sub.completada}
                                                onChange={() => handleToggleSub(sub.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span className={sub.completada ? 'text-decoration-line-through text-muted' : 'text-dark'}>
                                                {sub.texto}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-link p-0 text-muted hover-danger"
                                            onClick={() => handleDeleteSub(sub.id)}
                                            title="Eliminar subtarea"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <small className="text-muted fst-italic">
                                No hay subtareas añadidas aún. Puedes agregar pasos específicos para completar esta tarea.
                            </small>
                        )}
                    </div>

                    {/* 6. Etiquetas / Tags */}
                    <div>
                        <Form.Label className="small fw-bold text-secondary mb-1">
                            <i className="fa-solid fa-tags me-1 text-secondary"></i> Etiquetas:
                        </Form.Label>
                        <div className="input-group input-group-sm mb-2" style={{ maxWidth: '320px' }}>
                            <Form.Control
                                type="text"
                                placeholder="Nueva etiqueta..."
                                value={nuevoTag}
                                onChange={(e) => setNuevoTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                className="rounded-start-3"
                            />
                            <Button variant="outline-secondary" onClick={handleAddTag} className="rounded-end-3">
                                + Tag
                            </Button>
                        </div>

                        {/* Tags seleccionados */}
                        <div className="d-flex flex-wrap align-items-center gap-1.5 mb-2">
                            {formValues.etiquetas.map((t, idx) => (
                                <Badge key={idx} bg="primary-subtle" className="text-primary border border-primary-subtle rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5">
                                    <span>#{t}</span>
                                    <i
                                        className="fa-solid fa-xmark cursor-pointer"
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => handleRemoveTag(t)}
                                        title="Quitar etiqueta"
                                    ></i>
                                </Badge>
                            ))}
                        </div>

                        {/* Sugerencias de tags */}
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                            <small className="text-muted me-1" style={{ fontSize: '0.72rem' }}>Sugeridos:</small>
                            {tagsSugeridos.filter(st => !formValues.etiquetas.includes(st)).slice(0, 5).map((st, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="btn btn-sm btn-light border py-0 px-2 rounded-pill text-secondary"
                                    style={{ fontSize: '0.68rem' }}
                                    onClick={() => setFormValues(prev => ({ ...prev, etiquetas: [...prev.etiquetas, st] }))}
                                >
                                    +{st}
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="bg-light border-top py-2.5 px-4 justify-content-between">
                    <Button variant="outline-secondary" className="rounded-pill px-3.5 fw-semibold" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" className="rounded-pill px-4 fw-bold shadow-xs" disabled={submitting}>
                        {submitting ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin me-1"></i> Guardando...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-check me-1"></i> {esEdicion ? 'Guardar Cambios' : 'Crear Tarea'}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
