import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, ProgressBar, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTareasStore } from '../../hooks';
import { ModalCrearEditarTarea } from '../../tareas/components/ModalCrearEditarTarea';

export const WidgetTareasPendientes = () => {
    const navigate = useNavigate();
    const {
        tareas,
        user,
        startLoadingTareas,
        startLoadingUsuarios,
        startCambiarEstado,
        isLoadingTareas
    } = useTareasStore();

    const [showModal, setShowModal] = useState(false);
    const [filtroSoloMias, setFiltroSoloMias] = useState(true);

    useEffect(() => {
        startLoadingTareas();
        startLoadingUsuarios();
    }, []);

    const uid = user?.uid || user?._id;

    // Filtrar tareas pendientes (no completadas)
    const tareasPendientes = (tareas || []).filter(t => {
        if (t.estado === 'completada') return false;
        if (filtroSoloMias) {
            const asigId = t.asignadoA?._id || t.asignadoA?.id || t.asignadoA;
            return asigId === uid;
        }
        return true;
    });

    // Ordenar: primero urgentes, luego próximas a vencer
    const tareasOrdenadas = [...tareasPendientes].sort((a, b) => {
        const pesoPrio = { urgente: 4, alta: 3, media: 2, baja: 1 };
        const pA = pesoPrio[a.prioridad] || 2;
        const pB = pesoPrio[b.prioridad] || 2;
        if (pA !== pB) return pB - pA;

        const fA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : Infinity;
        const fB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : Infinity;
        return fA - fB;
    });

    // Conteo de mis tareas completadas hoy vs total para una barra de progreso personal
    const misTareasTotales = (tareas || []).filter(t => {
        const asigId = t.asignadoA?._id || t.asignadoA?.id || t.asignadoA;
        return asigId === uid;
    });
    const misCompletadas = misTareasTotales.filter(t => t.estado === 'completada').length;
    const porcentajeProgreso = misTareasTotales.length > 0 ? Math.round((misCompletadas / misTareasTotales.length) * 100) : 0;

    const getPrioridadBadge = (p = 'media') => {
        switch (p) {
            case 'urgente':
                return { label: 'Urgente', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' };
            case 'alta':
                return { label: 'Alta', color: '#f97316', bg: '#ffedd5', border: '#fdba74' };
            case 'media':
                return { label: 'Media', color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
            default:
                return { label: 'Baja', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
        }
    };

    const getVencimientoLabel = (f) => {
        if (!f) return null;
        const fecha = new Date(f);
        if (isNaN(fecha.getTime())) return null;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((new Date(fecha).setHours(0, 0, 0, 0) - hoy.getTime()) / (1000 * 60 * 60 * 24));
        const str = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

        if (diffDays < 0) return { text: `Vencida (${str})`, color: '#ef4444', bg: '#fee2e2' };
        if (diffDays === 0) return { text: 'Vence hoy', color: '#d97706', bg: '#fef3c7' };
        if (diffDays === 1) return { text: 'Mañana', color: '#0284c7', bg: '#e0f2fe' };
        return { text: str, color: '#64748b', bg: '#f8fafc' };
    };

    return (
        <div className="card border border-light-subtle shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
            {/* Cabecera del Widget */}
            <div className="card-body p-3 border-bottom bg-light bg-opacity-50">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                    <div className="d-flex align-items-center gap-2.5">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs"
                            style={{
                                width: '38px',
                                height: '38px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                            }}
                        >
                            <i className="fa-solid fa-list-check fs-5"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                                    Mis Tareas y Compromisos
                                </h6>
                                <Badge bg="primary" className="rounded-pill px-2.5 py-0.5 fw-bold shadow-xs">
                                    {tareasPendientes.length} pendientes
                                </Badge>
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                                Filtrado para <strong>{user?.name || 'Administrador'}</strong> • Acciones directas
                            </small>
                        </div>
                    </div>

                    {/* Acciones y Switch de Filtro */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="btn-group bg-white rounded-pill p-0.5 border shadow-xs">
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill py-0.5 px-2.5 fw-semibold ${
                                    filtroSoloMias ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary border-0'
                                }`}
                                style={{ fontSize: '0.74rem' }}
                                onClick={() => setFiltroSoloMias(true)}
                            >
                                <i className="fa-solid fa-user me-1"></i>Solo Mías
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill py-0.5 px-2.5 fw-semibold ${
                                    !filtroSoloMias ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary border-0'
                                }`}
                                style={{ fontSize: '0.74rem' }}
                                onClick={() => setFiltroSoloMias(false)}
                            >
                                <i className="fa-solid fa-users me-1"></i>Todas
                            </button>
                        </div>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-2.5 py-1 fw-bold shadow-xs d-flex align-items-center gap-1.5"
                            style={{ fontSize: '0.76rem' }}
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fa-solid fa-plus"></i>
                            <span>Nueva</span>
                        </Button>

                        <Button
                            variant="light"
                            size="sm"
                            className="rounded-pill px-2.5 py-1 text-primary border fw-bold shadow-xs d-flex align-items-center gap-1.5"
                            style={{ fontSize: '0.76rem' }}
                            onClick={() => navigate('/tareas')}
                        >
                            <span>Ir al Tablero</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </Button>
                    </div>
                </div>

                {/* Barra de progreso personal */}
                {misTareasTotales.length > 0 && (
                    <div className="mt-2.5 pt-2 border-top">
                        <div className="d-flex justify-content-between align-items-center small text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                            <span>
                                Progreso de mis tareas: <strong>{misCompletadas} de {misTareasTotales.length} completadas</strong>
                            </span>
                            <strong className={porcentajeProgreso === 100 ? 'text-success' : 'text-primary'}>
                                {porcentajeProgreso}%
                            </strong>
                        </div>
                        <ProgressBar
                            now={porcentajeProgreso}
                            variant={porcentajeProgreso === 100 ? 'success' : 'primary'}
                            style={{ height: '5px', borderRadius: '3px' }}
                        />
                    </div>
                )}
            </div>

            {/* Listado de Tareas Pendientes en el Dashboard */}
            <div className="card-body p-2 p-md-3">
                {isLoadingTareas ? (
                    <div className="text-center py-4 text-muted">
                        <i className="fa-solid fa-spinner fa-spin me-2"></i>Cargando tareas...
                    </div>
                ) : tareasOrdenadas.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                        {tareasOrdenadas.slice(0, 5).map(tarea => {
                            const prio = getPrioridadBadge(tarea.prioridad);
                            const venc = getVencimientoLabel(tarea.fechaVencimiento);
                            const totalSub = tarea.checklist?.length || 0;
                            const compSub = tarea.checklist?.filter(s => s.completada).length || 0;
                            const asigNombre = tarea.asignadoA?.name || 'Sin asignar';

                            return (
                                <div
                                    key={tarea._id || tarea.id}
                                    className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white shadow-xs transition-all hover-shadow"
                                    style={{ borderLeft: `4px solid ${prio.color} !important` }}
                                >
                                    <div className="d-flex align-items-center gap-2.5 flex-grow-1 text-truncate me-2">
                                        {/* Checkbox directo de completado */}
                                        <button
                                            type="button"
                                            className="btn btn-sm p-0 border-0 bg-transparent flex-shrink-0"
                                            onClick={() => startCambiarEstado(tarea._id, 'completada')}
                                            title="Completar tarea"
                                        >
                                            <i className="fa-regular fa-circle text-muted fs-5 hover-success"></i>
                                        </button>

                                        <div className="text-truncate">
                                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                                <span className="fw-bold text-dark small text-truncate" style={{ maxWidth: '320px' }}>
                                                    {tarea.titulo}
                                                </span>
                                                <span
                                                    className="badge rounded-pill px-2 py-0 fw-bold"
                                                    style={{
                                                        backgroundColor: prio.bg,
                                                        color: prio.color,
                                                        border: `1px solid ${prio.border}`,
                                                        fontSize: '0.64rem'
                                                    }}
                                                >
                                                    {prio.label}
                                                </span>
                                                {tarea.estado === 'en_progreso' && (
                                                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill px-1.5 py-0" style={{ fontSize: '0.64rem' }}>
                                                        <i className="fa-solid fa-spinner fa-spin me-1"></i>En Progreso
                                                    </span>
                                                )}
                                            </div>

                                            {tarea.descripcion && (
                                                <small className="text-muted d-block text-truncate" style={{ fontSize: '0.72rem', maxWidth: '350px' }}>
                                                    {tarea.descripcion}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadatos y Asignado a la derecha */}
                                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                        {/* Subtareas */}
                                        {totalSub > 0 && (
                                            <span className="badge bg-light text-secondary border px-1.5 py-0.5 d-none d-md-inline" style={{ fontSize: '0.68rem' }}>
                                                <i className="fa-solid fa-list-check me-1"></i>{compSub}/{totalSub}
                                            </span>
                                        )}

                                        {/* Vencimiento */}
                                        {venc && (
                                            <span
                                                className="badge rounded-pill px-2 py-0.5 fw-semibold"
                                                style={{
                                                    backgroundColor: venc.bg,
                                                    color: venc.color,
                                                    fontSize: '0.68rem'
                                                }}
                                            >
                                                <i className="fa-regular fa-calendar me-1"></i>
                                                {venc.text}
                                            </span>
                                        )}

                                        {/* Asignado avatar */}
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                fontSize: '0.68rem',
                                                backgroundColor: tarea.asignadoA ? '#3b82f6' : '#94a3b8'
                                            }}
                                            title={`Asignado a: ${asigNombre}`}
                                        >
                                            {asigNombre.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {tareasPendientes.length > 5 && (
                            <div className="text-center pt-1">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
                                    style={{ fontSize: '0.78rem' }}
                                    onClick={() => navigate('/tareas')}
                                >
                                    Ver {tareasPendientes.length - 5} tareas más en el tablero completo &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted">
                        <i className="fa-solid fa-circle-check text-success fs-3 mb-2 d-block opacity-75"></i>
                        <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                            ¡Todo al día! No tienes tareas pendientes
                        </h6>
                        <small className="text-muted d-block mb-2">
                            Has completado todos tus compromisos asignados.
                        </small>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-3 py-1 fw-semibold"
                            style={{ fontSize: '0.76rem' }}
                            onClick={() => setShowModal(true)}
                        >
                            + Crear nueva tarea
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal para Crear Tarea Rápida */}
            <ModalCrearEditarTarea
                show={showModal}
                handleClose={() => setShowModal(false)}
            />
        </div>
    );
};
