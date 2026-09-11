import React, { useEffect, useState } from 'react';
import { LayoutApp } from '../../layout/LayoutApp';
import { useTareasStore } from '../../hooks';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListaTareas } from '../components/ListaTareas';
import { ModalCrearEditarTarea } from '../components/ModalCrearEditarTarea';
import { Row, Col, Card, Badge, Button, Form, InputGroup } from 'react-bootstrap';

export const TareasPage = () => {
    const {
        tareasFiltradas,
        isLoadingTareas,
        usuariosDisponibles,
        filtroAsignado,
        filtroEstado,
        filtroPrioridad,
        filtroBusqueda,
        vistaActiva,
        stats,
        user,
        startLoadingTareas,
        startLoadingUsuarios,
        setFiltroAsignado,
        setFiltroEstado,
        setFiltroPrioridad,
        setFiltroBusqueda,
        setVistaActiva
    } = useTareasStore();

    const [showModal, setShowModal] = useState(false);
    const [tareaAEditar, setTareaAEditar] = useState(null);

    useEffect(() => {
        startLoadingTareas();
        startLoadingUsuarios();
    }, []);

    const handleNuevaTarea = (estadoInicial = 'pendiente') => {
        setTareaAEditar(estadoInicial ? { estado: estadoInicial } : null);
        setShowModal(true);
    };

    const handleEditarTarea = (tarea) => {
        setTareaAEditar(tarea);
        setShowModal(true);
    };

    const handleCerrarModal = () => {
        setShowModal(false);
        setTareaAEditar(null);
    };

    return (
        <LayoutApp>
            <div className="container-fluid px-2 px-md-3 py-2">
                {/* 1. Cabecera Principal */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3 pb-2 border-bottom">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="p-2 bg-primary-subtle text-primary rounded-3 shadow-xs">
                                <i className="fa-solid fa-list-check fs-5"></i>
                            </span>
                            <h4 className="mb-0 fw-bold text-dark">Gestión de Tareas y Compromisos</h4>
                        </div>
                        <small className="text-muted">
                            Asignación operativa entre administradores y equipo de trabajo
                        </small>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        {/* Selector de Vista: Kanban / Lista */}
                        <div className="btn-group bg-light rounded-pill p-1 border shadow-xs">
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                    vistaActiva === 'kanban' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary border-0'
                                }`}
                                onClick={() => setVistaActiva('kanban')}
                            >
                                <i className="fa-solid fa-table-columns me-1.5"></i>Tablero Kanban
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                    vistaActiva === 'lista' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary border-0'
                                }`}
                                onClick={() => setVistaActiva('lista')}
                            >
                                <i className="fa-solid fa-list me-1.5"></i>Lista
                            </button>
                        </div>

                        {/* Botón Nueva Tarea */}
                        <Button
                            variant="primary"
                            className="rounded-pill px-3.5 py-1.5 fw-bold shadow-xs d-flex align-items-center gap-2"
                            onClick={() => handleNuevaTarea('pendiente')}
                        >
                            <i className="fa-solid fa-plus-circle"></i>
                            <span>Nueva Tarea</span>
                        </Button>
                    </div>
                </div>

                {/* 2. Tarjetas Resumen de Métricas */}
                <Row className="g-2.5 mb-3">
                    {/* Total */}
                    <Col xs={6} md={4} lg={2}>
                        <div className="card border-0 rounded-4 shadow-sm p-3 bg-white h-100">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small text-muted fw-semibold">Total Tareas</span>
                                <span className="rounded-circle p-1.5 bg-light text-secondary" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-layer-group" style={{ fontSize: '0.72rem' }}></i>
                                </span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-0">{stats.total}</h4>
                        </div>
                    </Col>

                    {/* Mis Tareas Pendientes (Destacada) */}
                    <Col xs={6} md={4} lg={2}>
                        <div
                            className={`card border-0 rounded-4 shadow-sm p-3 h-100 cursor-pointer transition-all ${
                                filtroAsignado === 'mis-tareas' ? 'ring-2 ring-primary' : ''
                            }`}
                            style={{ backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe' }}
                            onClick={() => setFiltroAsignado(filtroAsignado === 'mis-tareas' ? 'todos' : 'mis-tareas')}
                            title="Haga clic para filtrar solo mis tareas"
                        >
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small text-primary fw-bold">Para Mí</span>
                                <span className="rounded-circle p-1.5 bg-primary text-white" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-user-check" style={{ fontSize: '0.72rem' }}></i>
                                </span>
                            </div>
                            <h4 className="fw-bolder text-primary mb-0">{stats.misPendientes}</h4>
                        </div>
                    </Col>

                    {/* Por Hacer */}
                    <Col xs={6} md={4} lg={2}>
                        <div className="card border-0 rounded-4 shadow-sm p-3 bg-white h-100">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small text-muted fw-semibold">Por Hacer</span>
                                <span className="rounded-circle p-1.5 bg-warning-subtle text-warning-emphasis" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-regular fa-clock" style={{ fontSize: '0.72rem' }}></i>
                                </span>
                            </div>
                            <h4 className="fw-bolder text-warning-emphasis mb-0">{stats.pendientes}</h4>
                        </div>
                    </Col>

                    {/* En Progreso */}
                    <Col xs={6} md={4} lg={2}>
                        <div className="card border-0 rounded-4 shadow-sm p-3 bg-white h-100">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small text-muted fw-semibold">En Progreso</span>
                                <span className="rounded-circle p-1.5 bg-info-subtle text-info-emphasis" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-spinner" style={{ fontSize: '0.72rem' }}></i>
                                </span>
                            </div>
                            <h4 className="fw-bolder text-info-emphasis mb-0">{stats.enProgreso}</h4>
                        </div>
                    </Col>

                    {/* Completadas */}
                    <Col xs={6} md={4} lg={2}>
                        <div className="card border-0 rounded-4 shadow-sm p-3 bg-white h-100">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small text-muted fw-semibold">Completadas</span>
                                <span className="rounded-circle p-1.5 bg-success-subtle text-success" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-check" style={{ fontSize: '0.72rem' }}></i>
                                </span>
                            </div>
                            <h4 className="fw-bolder text-success mb-0">{stats.completadas}</h4>
                        </div>
                    </Col>

                    {/* Urgentes / Vencidas */}
                    <Col xs={6} md={4} lg={2}>
                        <div className="card border-0 rounded-4 shadow-sm p-3 bg-white h-100">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small text-danger fw-semibold">Urgentes / Vencidas</span>
                                <span className="rounded-circle p-1.5 bg-danger-subtle text-danger" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '0.72rem' }}></i>
                                </span>
                            </div>
                            <h4 className="fw-bolder text-danger mb-0">
                                {stats.urgentes}
                                {stats.vencidas > 0 && (
                                    <small className="fs-7 text-danger ms-1 fw-bold">({stats.vencidas} vencidas)</small>
                                )}
                            </h4>
                        </div>
                    </Col>
                </Row>

                {/* 3. Barra de Filtros y Búsqueda */}
                <div className="card border-0 rounded-4 shadow-sm p-3 mb-3 bg-white">
                    <Row className="g-2 align-items-center">
                        {/* Filtro Rápido "Mis Tareas" */}
                        <Col xs={12} sm={6} md="auto">
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 fw-bold w-100 ${
                                    filtroAsignado === 'mis-tareas'
                                        ? 'btn-primary shadow-xs'
                                        : 'btn-outline-primary'
                                }`}
                                onClick={() => setFiltroAsignado(filtroAsignado === 'mis-tareas' ? 'todos' : 'mis-tareas')}
                            >
                                <i className="fa-solid fa-user-check me-1.5"></i>
                                {filtroAsignado === 'mis-tareas' ? 'Mostrando: Mis Tareas' : 'Ver Solo Mis Tareas'}
                            </button>
                        </Col>

                        {/* Filtro por Asignado */}
                        <Col xs={6} sm={6} md="auto">
                            <Form.Select
                                size="sm"
                                className="rounded-pill border-light-subtle shadow-xs"
                                value={filtroAsignado}
                                onChange={(e) => setFiltroAsignado(e.target.value)}
                                style={{ minWidth: '160px' }}
                            >
                                <option value="todos">Todos los responsables</option>
                                <option value="mis-tareas">Solo mis tareas</option>
                                <option value="sin-asignar">Sin asignar</option>
                                <optgroup label="Usuarios">
                                    {usuariosDisponibles.map(u => (
                                        <option key={u._id} value={u._id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </Form.Select>
                        </Col>

                        {/* Filtro por Prioridad */}
                        <Col xs={6} sm={6} md="auto">
                            <Form.Select
                                size="sm"
                                className="rounded-pill border-light-subtle shadow-xs"
                                value={filtroPrioridad}
                                onChange={(e) => setFiltroPrioridad(e.target.value)}
                                style={{ minWidth: '130px' }}
                            >
                                <option value="todos">Toda prioridad</option>
                                <option value="urgente">Urgente</option>
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="baja">Baja</option>
                            </Form.Select>
                        </Col>

                        {/* Filtro por Estado (en vista lista) */}
                        {vistaActiva === 'lista' && (
                            <Col xs={6} sm={6} md="auto">
                                <Form.Select
                                    size="sm"
                                    className="rounded-pill border-light-subtle shadow-xs"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                    style={{ minWidth: '130px' }}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="pendiente">Por Hacer</option>
                                    <option value="en_progreso">En Progreso</option>
                                    <option value="completada">Completada</option>
                                </Form.Select>
                            </Col>
                        )}

                        {/* Buscador de Texto */}
                        <Col xs={12} md>
                            <InputGroup size="sm">
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar por título, descripción, etiqueta o responsable..."
                                    value={filtroBusqueda}
                                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                                    className="rounded-pill ps-3 shadow-none"
                                />
                                {filtroBusqueda && (
                                    <Button
                                        variant="outline-secondary"
                                        className="rounded-pill ms-1"
                                        onClick={() => setFiltroBusqueda('')}
                                        title="Limpiar búsqueda"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>
                    </Row>
                </div>

                {/* 4. Contenido Principal: Tablero Kanban o Vista Lista */}
                {isLoadingTareas ? (
                    <div className="text-center py-5">
                        <i className="fa-solid fa-spinner fa-spin fs-2 text-primary mb-3"></i>
                        <h6 className="text-muted">Cargando tareas y compromisos...</h6>
                    </div>
                ) : vistaActiva === 'kanban' ? (
                    <KanbanBoard
                        tareas={tareasFiltradas}
                        onEditar={handleEditarTarea}
                        onNuevaTareaEstado={handleNuevaTarea}
                    />
                ) : (
                    <ListaTareas
                        tareas={tareasFiltradas}
                        onEditar={handleEditarTarea}
                    />
                )}
            </div>

            {/* Modal para Crear y Editar Tareas */}
            <ModalCrearEditarTarea
                show={showModal}
                handleClose={handleCerrarModal}
                tareaEditar={tareaAEditar}
            />
        </LayoutApp>
    );
};
