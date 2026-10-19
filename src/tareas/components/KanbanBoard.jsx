import React, { useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { CardTarea } from './CardTarea';

export const KanbanBoard = ({ tareas = [], onEditar, onNuevaTareaEstado }) => {
    const [columnaMovil, setColumnaMovil] = useState('todas');

    const columnas = [
        {
            id: 'pendiente',
            titulo: 'Por Hacer',
            icon: 'fa-clock',
            color: '#d97706',
            bg: '#fffbeb',
            border: '#fde68a',
            items: tareas.filter(t => t.estado === 'pendiente')
        },
        {
            id: 'en_progreso',
            titulo: 'En Progreso',
            icon: 'fa-spinner',
            color: '#2563eb',
            bg: '#eff6ff',
            border: '#bfdbfe',
            items: tareas.filter(t => t.estado === 'en_progreso')
        },
        {
            id: 'completada',
            titulo: 'Completadas',
            icon: 'fa-circle-check',
            color: '#16a34a',
            bg: '#f0fdf4',
            border: '#bbf7d0',
            items: tareas.filter(t => t.estado === 'completada')
        }
    ];

    const columnasAVisualizar = columnas.filter(col => {
        if (columnaMovil === 'todas') return true;
        return col.id === columnaMovil;
    });

    return (
        <>
            {/* Pestañas de Cambio de Columna para Pantallas Móviles */}
            <div className="d-flex d-lg-none scroll-horizontal-touch gap-1 mb-3">
                <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 text-nowrap ${
                        columnaMovil === 'todas' ? 'btn-primary shadow-xs fw-bold' : 'btn-light border text-secondary'
                    }`}
                    onClick={() => setColumnaMovil('todas')}
                >
                    Todas ({tareas.length})
                </button>
                {columnas.map(c => (
                    <button
                        key={c.id}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 text-nowrap d-flex align-items-center gap-1.5 ${
                            columnaMovil === c.id ? 'btn-dark text-white shadow-xs fw-bold' : 'btn-light border text-secondary'
                        }`}
                        onClick={() => setColumnaMovil(c.id)}
                    >
                        <i className={`fa-solid ${c.icon}`} style={{ color: c.color }}></i>
                        <span>{c.titulo}</span>
                        <span className="badge bg-white text-dark ms-1">{c.items.length}</span>
                    </button>
                ))}
            </div>

            <Row className="g-3">
                {columnasAVisualizar.map(col => (
                    <Col key={col.id} xs={12} lg={4}>
                        <div
                            className="rounded-4 p-3 h-100 d-flex flex-column"
                            style={{
                                backgroundColor: '#f8fafc',
                                border: `1.5px solid #e2e8f0`,
                                minHeight: '420px'
                            }}
                        >
                        {/* Cabecera de Columna */}
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="rounded-circle d-flex align-items-center justify-content-center shadow-xs"
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        backgroundColor: col.bg,
                                        color: col.color,
                                        border: `1px solid ${col.border}`
                                    }}
                                >
                                    <i className={`fa-solid ${col.icon}`} style={{ fontSize: '0.8rem' }}></i>
                                </span>
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                                    {col.titulo}
                                </h6>
                            </div>

                            <div className="d-flex align-items-center gap-1.5">
                                <Badge
                                    bg="white"
                                    className="text-dark border rounded-pill px-2.5 py-1 fw-bold shadow-xs"
                                    style={{ fontSize: '0.74rem' }}
                                >
                                    {col.items.length}
                                </Badge>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-light border rounded-circle p-1"
                                    onClick={() => onNuevaTareaEstado(col.id)}
                                    title={`Agregar tarea a ${col.titulo}`}
                                    style={{ width: '26px', height: '26px', fontSize: '0.75rem', lineHeight: 1 }}
                                >
                                    <i className="fa-solid fa-plus text-primary"></i>
                                </button>
                            </div>
                        </div>

                        {/* Listado de Tarjetas en la Columna */}
                        <div className="flex-grow-1 overflow-y-auto pe-1" style={{ maxHeight: '72vh' }}>
                            {col.items.length > 0 ? (
                                col.items.map(tarea => (
                                    <CardTarea
                                        key={tarea._id || tarea.id}
                                        tarea={tarea}
                                        onEditar={onEditar}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-5 px-3 border border-dashed rounded-3 my-2 text-muted">
                                    <i className={`fa-solid ${col.icon} fs-3 opacity-25 mb-2 d-block`}></i>
                                    <small className="d-block fw-medium">No hay tareas en {col.titulo.toLowerCase()}</small>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary rounded-pill mt-2 py-0.5 px-3"
                                        style={{ fontSize: '0.74rem' }}
                                        onClick={() => onNuevaTareaEstado(col.id)}
                                    >
                                        + Agregar aquí
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
        </>
    );
};
