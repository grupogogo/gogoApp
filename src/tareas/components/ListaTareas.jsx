import React from 'react';
import { Table, Badge, Dropdown, ProgressBar } from 'react-bootstrap';
import { useTareasStore } from '../../hooks';

export const ListaTareas = ({ tareas = [], onEditar }) => {
    const { startCambiarEstado, startDeleteTarea, user } = useTareasStore();

    const getPrioridadConfig = (p = 'media') => {
        switch (p) {
            case 'urgente':
                return { label: 'Urgente', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' };
            case 'alta':
                return { label: 'Alta', color: '#f97316', bg: '#ffedd5', border: '#fdba74' };
            case 'media':
                return { label: 'Media', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' };
            case 'baja':
                return { label: 'Baja', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
            default:
                return { label: 'Media', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
        }
    };

    const getFechaInfo = (f) => {
        if (!f) return null;
        const fecha = new Date(f);
        if (isNaN(fecha.getTime())) return null;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((new Date(fecha).setHours(0, 0, 0, 0) - hoy.getTime()) / (1000 * 60 * 60 * 24));
        const str = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

        if (diffDays < 0) return { text: `Venció (${str})`, color: '#ef4444', bg: '#fee2e2' };
        if (diffDays === 0) return { text: 'Vence hoy', color: '#d97706', bg: '#fef3c7' };
        if (diffDays === 1) return { text: 'Vence mañana', color: '#0284c7', bg: '#e0f2fe' };
        return { text: str, color: '#64748b', bg: '#f8fafc' };
    };

    return (
        <div className="table-responsive bg-white rounded-4 border shadow-sm">
            <Table hover className="align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                <thead className="table-light text-secondary small">
                    <tr>
                        <th style={{ width: '45px' }} className="text-center">✓</th>
                        <th className="ps-2">Tarea / Detalle</th>
                        <th style={{ width: '150px' }}>Asignado</th>
                        <th style={{ width: '110px' }} className="text-center">Prioridad</th>
                        <th style={{ width: '130px' }} className="text-center">Estado</th>
                        <th style={{ width: '120px' }} className="text-center">Subtareas</th>
                        <th style={{ width: '130px' }} className="text-center">Vencimiento</th>
                        <th style={{ width: '80px' }} className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {tareas.length > 0 ? (
                        tareas.map(tarea => {
                            const isDone = tarea.estado === 'completada';
                            const prio = getPrioridadConfig(tarea.prioridad);
                            const fechaInfo = getFechaInfo(tarea.fechaVencimiento);
                            const totalSub = tarea.checklist?.length || 0;
                            const compSub = tarea.checklist?.filter(s => s.completada).length || 0;
                            const pctSub = totalSub > 0 ? Math.round((compSub / totalSub) * 100) : 0;
                            const asigNombre = tarea.asignadoA?.name || 'Sin asignar';
                            const esMiTarea = (tarea.asignadoA?._id || tarea.asignadoA?.id || tarea.asignadoA) === (user?.uid || user?._id);

                            return (
                                <tr key={tarea._id || tarea.id} className={isDone ? 'table-light opacity-75' : ''}>
                                    {/* Checkbox de completado rápido */}
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-sm p-0 border-0 bg-transparent"
                                            onClick={() => startCambiarEstado(tarea._id, isDone ? 'pendiente' : 'completada')}
                                            title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                                        >
                                            {isDone ? (
                                                <i className="fa-solid fa-circle-check text-success fs-5"></i>
                                            ) : (
                                                <i className="fa-regular fa-circle text-muted fs-5"></i>
                                            )}
                                        </button>
                                    </td>

                                    {/* Título, Descripción y Tags */}
                                    <td className="ps-2">
                                        <div className="d-flex flex-column">
                                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                                <span className={`fw-bold text-dark ${isDone ? 'text-decoration-line-through text-muted' : ''}`}>
                                                    {tarea.titulo}
                                                </span>
                                                {esMiTarea && (
                                                    <Badge bg="primary-subtle" className="text-primary border border-primary-subtle rounded-pill px-1.5 py-0" style={{ fontSize: '0.64rem' }}>
                                                        Para mí
                                                    </Badge>
                                                )}
                                                {(tarea.etiquetas || []).map((t, idx) => (
                                                    <span key={idx} className="badge bg-light text-secondary border rounded-pill px-1.5 py-0" style={{ fontSize: '0.65rem' }}>
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                            {tarea.descripcion && (
                                                <small className="text-muted text-truncate mt-0.5" style={{ maxWidth: '380px', fontSize: '0.74rem' }}>
                                                    {tarea.descripcion}
                                                </small>
                                            )}
                                        </div>
                                    </td>

                                    {/* Asignado */}
                                    <td>
                                        <div className="d-flex align-items-center gap-1.5">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs text-white flex-shrink-0"
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    fontSize: '0.7rem',
                                                    backgroundColor: tarea.asignadoA ? '#3b82f6' : '#94a3b8'
                                                }}
                                            >
                                                {asigNombre.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="small text-dark fw-medium text-truncate" style={{ maxWidth: '110px' }}>
                                                {asigNombre}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Prioridad */}
                                    <td className="text-center">
                                        <span
                                            className="badge rounded-pill px-2 py-1 fw-bold"
                                            style={{
                                                backgroundColor: prio.bg,
                                                color: prio.color,
                                                border: `1px solid ${prio.border}`,
                                                fontSize: '0.7rem'
                                            }}
                                        >
                                            {prio.label}
                                        </span>
                                    </td>

                                    {/* Estado con Selector Rápido */}
                                    <td className="text-center">
                                        <select
                                            className="form-select form-select-sm py-0.5 px-2 rounded-pill fw-medium text-center border-0 shadow-xs"
                                            style={{
                                                fontSize: '0.75rem',
                                                backgroundColor:
                                                    tarea.estado === 'completada' ? '#dcfce7' :
                                                    tarea.estado === 'en_progreso' ? '#e0f2fe' : '#fef3c7',
                                                color:
                                                    tarea.estado === 'completada' ? '#166534' :
                                                    tarea.estado === 'en_progreso' ? '#075985' : '#92400e'
                                            }}
                                            value={tarea.estado}
                                            onChange={(e) => startCambiarEstado(tarea._id, e.target.value)}
                                        >
                                            <option value="pendiente">Por Hacer</option>
                                            <option value="en_progreso">En Progreso</option>
                                            <option value="completada">Completada</option>
                                        </select>
                                    </td>

                                    {/* Subtareas */}
                                    <td className="text-center">
                                        {totalSub > 0 ? (
                                            <div style={{ maxWidth: '100px', margin: '0 auto' }}>
                                                <small className="text-muted d-block mb-1" style={{ fontSize: '0.68rem' }}>
                                                    {compSub}/{totalSub} ({pctSub}%)
                                                </small>
                                                <ProgressBar now={pctSub} variant={pctSub === 100 ? 'success' : 'primary'} style={{ height: '3px' }} />
                                            </div>
                                        ) : (
                                            <span className="text-muted small fst-italic">—</span>
                                        )}
                                    </td>

                                    {/* Vencimiento */}
                                    <td className="text-center">
                                        {fechaInfo ? (
                                            <span
                                                className="badge rounded-pill px-2 py-0.5 small fw-semibold"
                                                style={{
                                                    backgroundColor: fechaInfo.bg,
                                                    color: fechaInfo.color,
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {fechaInfo.text}
                                            </span>
                                        ) : (
                                            <span className="text-muted small fst-italic">—</span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="text-center">
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                className="btn btn-sm btn-light border text-warning px-1.5 py-0.5"
                                                onClick={() => onEditar(tarea)}
                                                title="Editar tarea"
                                            >
                                                <i className="fa-solid fa-pencil" style={{ fontSize: '0.8rem' }}></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-light border text-danger px-1.5 py-0.5"
                                                onClick={() => startDeleteTarea(tarea._id)}
                                                title="Eliminar tarea"
                                            >
                                                <i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} className="text-center py-5 text-muted">
                                <i className="fa-solid fa-list-check fs-2 opacity-25 d-block mb-2"></i>
                                <span className="fw-semibold">No se encontraron tareas con los filtros actuales</span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};
