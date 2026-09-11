import React from 'react';
import { Badge, Dropdown, ProgressBar } from 'react-bootstrap';
import { useTareasStore } from '../../hooks';

export const CardTarea = ({ tarea, onEditar }) => {
    const { startCambiarEstado, startDeleteTarea, startToggleSubtarea, user } = useTareasStore();

    const isCompletada = tarea.estado === 'completada';
    const isEnProgreso = tarea.estado === 'en_progreso';

    // Configuración de prioridad
    const getPrioridadConfig = (p = 'media') => {
        switch (p) {
            case 'urgente':
                return { label: 'Urgente', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', icon: 'fa-fire' };
            case 'alta':
                return { label: 'Alta', color: '#f97316', bg: '#ffedd5', border: '#fdba74', icon: 'fa-arrow-up' };
            case 'media':
                return { label: 'Media', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: 'fa-minus' };
            case 'baja':
                return { label: 'Baja', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: 'fa-arrow-down' };
            default:
                return { label: 'Media', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: 'fa-minus' };
        }
    };

    const prioConfig = getPrioridadConfig(tarea.prioridad);

    // Formato y validación de fecha de vencimiento
    const getFechaInfo = (f) => {
        if (!f) return null;
        const fecha = new Date(f);
        if (isNaN(fecha.getTime())) return null;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaComp = new Date(fecha);
        fechaComp.setHours(0, 0, 0, 0);

        const diffTime = fechaComp.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const str = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

        if (diffDays < 0) {
            return { text: `Venció (${str})`, color: '#ef4444', bg: '#fee2e2', isOverdue: true };
        } else if (diffDays === 0) {
            return { text: `Vence hoy`, color: '#d97706', bg: '#fef3c7', isToday: true };
        } else if (diffDays === 1) {
            return { text: `Vence mañana`, color: '#0284c7', bg: '#e0f2fe' };
        } else {
            return { text: str, color: '#64748b', bg: '#f8fafc' };
        }
    };

    const fechaInfo = getFechaInfo(tarea.fechaVencimiento);

    // Cálculo de progreso de subtareas
    const totalSub = tarea.checklist?.length || 0;
    const completadasSub = tarea.checklist?.filter(s => s.completada).length || 0;
    const porcentajeSub = totalSub > 0 ? Math.round((completadasSub / totalSub) * 100) : 0;

    // Inicial del asignado
    const asignadoNombre = tarea.asignadoA?.name || 'Sin asignar';
    const asignadoInicial = asignadoNombre.charAt(0).toUpperCase();
    const esMiTarea = (tarea.asignadoA?._id || tarea.asignadoA?.id || tarea.asignadoA) === (user?.uid || user?._id);

    return (
        <div
            className={`card border rounded-4 shadow-sm mb-2.5 transition-all bg-white position-relative ${
                isCompletada ? 'opacity-75' : ''
            }`}
            style={{
                borderLeft: `5px solid ${isCompletada ? '#10b981' : prioConfig.color}`,
                transition: 'all 0.2s ease-in-out'
            }}
        >
            <div className="card-body p-3">
                {/* Cabecera: Prioridad, Tags y Menú de Acciones */}
                <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                    <div className="d-flex align-items-center gap-1.5 flex-wrap">
                        <span
                            className="badge rounded-pill px-2 py-0.5 d-inline-flex align-items-center gap-1 fw-bold"
                            style={{
                                backgroundColor: prioConfig.bg,
                                color: prioConfig.color,
                                border: `1px solid ${prioConfig.border}`,
                                fontSize: '0.68rem'
                            }}
                        >
                            <i className={`fa-solid ${prioConfig.icon}`}></i>
                            {prioConfig.label}
                        </span>

                        {esMiTarea && (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5 fw-semibold" style={{ fontSize: '0.68rem' }}>
                                <i className="fa-solid fa-user-check me-1"></i>Para mí
                            </span>
                        )}

                        {(tarea.etiquetas || []).slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="badge bg-light text-secondary border rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.66rem' }}>
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Menú de Acciones */}
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            as="button"
                            className="btn btn-sm btn-link p-0 text-muted border-0 shadow-none"
                            style={{ width: '24px', height: '24px', lineHeight: 1 }}
                        >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow-sm border-0 rounded-3 py-1 font-sans small">
                            <Dropdown.Item onClick={() => onEditar(tarea)} className="d-flex align-items-center gap-2 py-1.5">
                                <i className="fa-solid fa-pencil text-warning"></i>
                                <span>Editar tarea</span>
                            </Dropdown.Item>

                            <Dropdown.Divider className="my-1" />

                            <Dropdown.Header className="small text-muted py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                                Cambiar Estado
                            </Dropdown.Header>

                            {tarea.estado !== 'pendiente' && (
                                <Dropdown.Item onClick={() => startCambiarEstado(tarea._id, 'pendiente')} className="d-flex align-items-center gap-2 py-1.5">
                                    <i className="fa-regular fa-clock text-secondary"></i>
                                    <span>Mover a Pendientes</span>
                                </Dropdown.Item>
                            )}

                            {tarea.estado !== 'en_progreso' && (
                                <Dropdown.Item onClick={() => startCambiarEstado(tarea._id, 'en_progreso')} className="d-flex align-items-center gap-2 py-1.5">
                                    <i className="fa-solid fa-spinner text-primary"></i>
                                    <span>Mover a En Progreso</span>
                                </Dropdown.Item>
                            )}

                            {tarea.estado !== 'completada' && (
                                <Dropdown.Item onClick={() => startCambiarEstado(tarea._id, 'completada')} className="d-flex align-items-center gap-2 py-1.5 text-success">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <span>Marcar Completada</span>
                                </Dropdown.Item>
                            )}

                            <Dropdown.Divider className="my-1" />

                            <Dropdown.Item onClick={() => startDeleteTarea(tarea._id)} className="d-flex align-items-center gap-2 py-1.5 text-danger">
                                <i className="fa-solid fa-trash"></i>
                                <span>Eliminar</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {/* Título con Checkbox de Toggle Rápido */}
                <div className="d-flex align-items-start gap-2 mb-1.5">
                    <button
                        type="button"
                        className="btn btn-sm p-0 border-0 bg-transparent mt-0.5"
                        onClick={() => startCambiarEstado(tarea._id, isCompletada ? 'pendiente' : 'completada')}
                        title={isCompletada ? 'Marcar como pendiente' : 'Marcar como completada'}
                        style={{ cursor: 'pointer' }}
                    >
                        {isCompletada ? (
                            <i className="fa-solid fa-circle-check text-success fs-5"></i>
                        ) : isEnProgreso ? (
                            <i className="fa-solid fa-circle-notch text-primary fa-spin fs-5"></i>
                        ) : (
                            <i className="fa-regular fa-circle text-muted fs-5"></i>
                        )}
                    </button>

                    <div className="flex-grow-1">
                        <h6
                            className={`mb-0 fw-bold text-dark ${isCompletada ? 'text-decoration-line-through text-muted' : ''}`}
                            style={{ fontSize: '0.88rem', lineHeight: '1.3' }}
                        >
                            {tarea.titulo}
                        </h6>
                    </div>
                </div>

                {/* Descripción (si existe) */}
                {tarea.descripcion && (
                    <p
                        className="text-muted small mb-2 ps-4"
                        style={{
                            fontSize: '0.75rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.3'
                        }}
                    >
                        {tarea.descripcion}
                    </p>
                )}

                {/* Subtareas / Checklist Compacto */}
                {totalSub > 0 && (
                    <div className="mb-2 ps-4">
                        <div className="d-flex justify-content-between align-items-center small text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                            <span>
                                <i className="fa-solid fa-list-check me-1 text-primary"></i>
                                Subtareas: <strong>{completadasSub}/{totalSub}</strong>
                            </span>
                            <span>{porcentajeSub}%</span>
                        </div>
                        <ProgressBar
                            now={porcentajeSub}
                            variant={porcentajeSub === 100 ? 'success' : 'primary'}
                            style={{ height: '4px', borderRadius: '2px' }}
                        />
                    </div>
                )}

                {/* Pie: Fecha de vencimiento y Avatar de Asignado */}
                <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                    {/* Fecha */}
                    <div>
                        {fechaInfo ? (
                            <span
                                className="badge rounded-pill px-2 py-0.5 small fw-semibold"
                                style={{
                                    backgroundColor: fechaInfo.bg,
                                    color: fechaInfo.color,
                                    fontSize: '0.68rem'
                                }}
                            >
                                <i className="fa-regular fa-calendar me-1"></i>
                                {fechaInfo.text}
                            </span>
                        ) : (
                            <span className="text-muted small fst-italic" style={{ fontSize: '0.68rem' }}>
                                Sin fecha
                            </span>
                        )}
                    </div>

                    {/* Asignado */}
                    <div className="d-flex align-items-center gap-1.5" title={`Asignado a: ${asignadoNombre}`}>
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs text-white"
                            style={{
                                width: '24px',
                                height: '24px',
                                fontSize: '0.7rem',
                                backgroundColor: tarea.asignadoA ? '#3b82f6' : '#94a3b8'
                            }}
                        >
                            {asignadoInicial}
                        </div>
                        <span className="small text-dark fw-medium text-truncate" style={{ maxWidth: '100px', fontSize: '0.72rem' }}>
                            {asignadoNombre.split(' ')[0]}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
