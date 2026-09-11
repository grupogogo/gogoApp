import React, { useState, useEffect, useMemo } from 'react';
import { LayoutApp } from '../../layout/LayoutApp';
import { usePreciosStore } from '../../hooks';
import { ModalGestionPrecio } from '../components/ModalGestionPrecio';
import { useFuntions } from '../../hooks/useFuntions';

export const GestionPrecios = () => {
    const {
        listaPrecios,
        isLoadingPrecios,
        setPrecioActivoModal,
        startLoadingPrecios,
        startEliminarPrecio,
        startResetPrecios
    } = usePreciosStore();

    const { formatearPrecio } = useFuntions();

    const [modalOpen, setModalOpen] = useState(false);
    const [filtroAnio, setFiltroAnio] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        startLoadingPrecios();
    }, []);

    // Años únicos disponibles en las tarifas
    const aniosDisponibles = useMemo(() => {
        const set = new Set((listaPrecios || []).map(p => Number(p.anio)));
        return Array.from(set).sort((a, b) => b - a);
    }, [listaPrecios]);

    // Filtrado de tarifas
    const tarifasFiltradas = useMemo(() => {
        return (listaPrecios || []).filter(item => {
            if (filtroAnio !== 'TODOS' && String(item.anio) !== String(filtroAnio)) {
                return false;
            }
            if (busqueda.trim()) {
                const q = busqueda.toLowerCase().trim();
                const desc = (item.descripcion || '').toLowerCase();
                const fecha = (item.fechaVigencia || '').toLowerCase();
                const anio = String(item.anio);
                if (!desc.includes(q) && !fecha.includes(q) && !anio.includes(q)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => {
            if (Number(b.anio) !== Number(a.anio)) {
                return Number(b.anio) - Number(a.anio);
            }
            return new Date(b.fechaVigencia || 0) - new Date(a.fechaVigencia || 0);
        });
    }, [listaPrecios, filtroAnio, busqueda]);

    // Handler para abrir modal nuevo
    const handleCrearNuevo = () => {
        setPrecioActivoModal(null);
        setModalOpen(true);
    };

    // Handler para editar
    const handleEditar = (precio) => {
        setPrecioActivoModal(precio);
        setModalOpen(true);
    };

    return (
        <LayoutApp>
            <div className="container-fluid py-3 px-2 px-md-4">
                {/* Header Superior */}
                <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 overflow-hidden">
                    <div className="card-body p-4">
                        <div className="row align-items-center g-3">
                            <div className="col-12 col-lg-7">
                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                    <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-3 py-1">
                                        <i className="fa-solid fa-calculator me-1"></i> Parámetros de Fábrica
                                    </span>
                                    <span className="badge rounded-pill bg-success-subtle text-success fw-bold px-3 py-1">
                                        <i className="fa-solid fa-calendar-check me-1"></i> Soporte Multivigencia
                                    </span>
                                </div>
                                <h3 className="fw-bolder text-dark mb-1">
                                    Gestión de Precios de Fábrica
                                </h3>
                                <p className="text-muted small mb-0">
                                    Administra los valores predeterminados de costo/venta para kits, cirios y guantes. Puedes registrar diferentes tarifas para un mismo año con fechas de vigencia específicas.
                                </p>
                            </div>

                            <div className="col-12 col-lg-5">
                                <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                                        onClick={startResetPrecios}
                                        title="Restaurar valores de fábrica iniciales"
                                    >
                                        <i className="fa-solid fa-rotate-left"></i>
                                        <span>Restablecer</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                                        onClick={handleCrearNuevo}
                                    >
                                        <i className="fa-solid fa-plus-circle"></i>
                                        <span>Nueva Tarifa</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs Resumen */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="card border-0 shadow-xs rounded-4 p-3 bg-white h-100">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-list-check text-primary me-1"></i> Tarifas Registradas
                            </span>
                            <h4 className="fw-bold text-dark mb-0">{listaPrecios.length}</h4>
                            <small className="text-muted" style={{ fontSize: '0.73rem' }}>Total registros en sistema</small>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="col card border-0 shadow-xs rounded-4 p-3 bg-white h-100">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-calendar text-info me-1"></i> Años Cubiertos
                            </span>
                            <h4 className="fw-bold text-dark mb-0">{aniosDisponibles.length}</h4>
                            <small className="text-muted" style={{ fontSize: '0.73rem' }}>Desde {aniosDisponibles[aniosDisponibles.length - 1] || '—'} hasta {aniosDisponibles[0] || '—'}</small>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="card border-0 shadow-xs rounded-4 p-3 bg-white h-100">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-box text-warning me-1"></i> Kit Bautizo Activo
                            </span>
                            <h4 className="fw-bold text-dark mb-0">
                                {formatearPrecio(listaPrecios.find(p => p.anio === 2026)?.precioKits?.kb || 0)}
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.73rem' }}>Vigente para 2026</small>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="card border-0 shadow-xs rounded-4 p-3 bg-white h-100">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-box-archive text-success me-1"></i> Kit Grande Activo
                            </span>
                            <h4 className="fw-bold text-dark mb-0">
                                {formatearPrecio(listaPrecios.find(p => p.anio === 2026)?.precioKits?.kcg || 0)}
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.73rem' }}>Vigente para 2026</small>
                        </div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control rounded-end-pill border-start-0"
                                    placeholder="Buscar por descripción, año o fecha..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-4">
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-muted fw-bold text-nowrap">Filtrar Año:</span>
                                <select
                                    className="form-select form-select-sm rounded-pill"
                                    value={filtroAnio}
                                    onChange={(e) => setFiltroAnio(e.target.value)}
                                >
                                    <option value="TODOS">Todos los años</option>
                                    {aniosDisponibles.map(a => (
                                        <option key={a} value={a}>Año {a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-md-4 text-md-end">
                            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill small">
                                Mostrando {tarifasFiltradas.length} de {listaPrecios.length} tarifas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabla de Tarifas */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                            <thead className="table-light border-bottom text-secondary text-uppercase" style={{ fontSize: '0.73rem', letterSpacing: '0.04em' }}>
                                <tr>
                                    <th className="py-3 px-3">Año / Vigencia</th>
                                    <th className="py-3 px-3">Descripción</th>
                                    <th className="py-3 px-3 text-center">Kits (KB / KCG / KCP / KCE)</th>
                                    <th className="py-3 px-3 text-center">Cirios (CC / CB)</th>
                                    <th className="py-3 px-3 text-center">Guantes (GB / GN / GM)</th>
                                    <th className="py-3 px-3 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingPrecios && listaPrecios.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                            Cargando tarifas de precios desde la base de datos...
                                        </td>
                                    </tr>
                                ) : tarifasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <i className="fa-solid fa-tags fa-2x mb-2 d-block text-secondary opacity-50"></i>
                                            No se encontraron tarifas registradas para los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    tarifasFiltradas.map((item) => {
                                        const itemId = item._id || item.id;
                                        return (
                                            <tr key={itemId}>
                                                {/* Año y Vigencia */}
                                                <td className="px-3 py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-primary text-white fw-bold px-2 py-1 rounded-pill" style={{ minWidth: '50px' }}>
                                                            {item.anio}
                                                        </span>
                                                        <div>
                                                            <span className="fw-bold text-dark d-block">
                                                                {item.fechaVigencia || 'Vigencia General'}
                                                            </span>
                                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                {item.fechaVigencia ? new Date(item.fechaVigencia + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sin fecha'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Descripción */}
                                                <td className="px-3 py-3">
                                                    <span className="fw-semibold text-dark">
                                                        {item.descripcion || <em className="text-muted">Sin descripción</em>}
                                                    </span>
                                                </td>

                                                {/* Kits */}
                                                <td className="px-3 py-3 text-center">
                                                    <div className="d-flex justify-content-center flex-wrap gap-1">
                                                        <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1" title="Kit Bautizo">
                                                            KB: {formatearPrecio(item.precioKits?.kb || 0)}
                                                        </span>
                                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" title="Kit Comunión Grande">
                                                            KCG: {formatearPrecio(item.precioKits?.kcg || 0)}
                                                        </span>
                                                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-1" title="Kit Comunión Pequeño">
                                                            KCP: {formatearPrecio(item.precioKits?.kcp || 0)}
                                                        </span>
                                                        {item.precioKits?.kce > 0 && (
                                                            <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2 py-1" title="Kit Económico">
                                                                KCE: {formatearPrecio(item.precioKits?.kce || 0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Cirios */}
                                                <td className="px-3 py-3 text-center">
                                                    <div className="d-flex justify-content-center flex-wrap gap-1">
                                                        <span className="badge bg-teal-subtle text-dark border px-2 py-1" title="Cirio Comunión">
                                                            CC: {formatearPrecio(item.precioCirios?.cc || 0)}
                                                        </span>
                                                        <span className="badge bg-pink-subtle text-dark border px-2 py-1" title="Cirio Bautizo">
                                                            CB: {formatearPrecio(item.precioCirios?.cb || 0)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Guantes */}
                                                <td className="px-3 py-3 text-center">
                                                    <div className="d-flex justify-content-center flex-wrap gap-1">
                                                        <span className="badge bg-light text-dark border px-2 py-1" title="Guantes Blancos">
                                                            GB: {formatearPrecio(item.precioGuantes?.gb || 0)}
                                                        </span>
                                                        <span className="badge bg-dark-subtle text-dark border px-2 py-1" title="Guantes Negros">
                                                            GN: {formatearPrecio(item.precioGuantes?.gn || 0)}
                                                        </span>
                                                        <span className="badge bg-secondary-subtle text-secondary border px-2 py-1" title="Guantes Mitón">
                                                            GM: {formatearPrecio(item.precioGuantes?.gm || 0)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Acciones */}
                                                <td className="px-3 py-3 text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm rounded-circle p-1 shadow-none me-1"
                                                            style={{ width: '32px', height: '32px' }}
                                                            onClick={() => handleEditar(item)}
                                                            title="Editar tarifa"
                                                        >
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm rounded-circle p-1 shadow-none"
                                                            style={{ width: '32px', height: '32px' }}
                                                            onClick={() => startEliminarPrecio(item._id || item.id, item.anio)}
                                                            title="Eliminar tarifa"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Creación y Edición */}
            <ModalGestionPrecio
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setPrecioActivoModal(null);
                }}
            />
        </LayoutApp>
    );
};
