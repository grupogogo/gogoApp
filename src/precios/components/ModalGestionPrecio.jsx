import React, { useState, useEffect } from 'react';
import { usePreciosStore } from '../../hooks';
import Swal from 'sweetalert2';

const estadoInicialForm = {
    id: null,
    anio: new Date().getFullYear(),
    fechaVigencia: new Date().toISOString().split('T')[0],
    descripcion: '',
    precioKits: {
        kcg: 20500,
        kcp: 14500,
        kb: 14500,
        kce: 7400
    },
    precioCirios: {
        cc: 9000,
        cb: 9000
    },
    precioGuantes: {
        gb: 25200,
        gn: 26400,
        gm: 32000
    }
};

export const ModalGestionPrecio = ({ isOpen, onClose }) => {
    const { precioActivoModal, startGuardarPrecio } = usePreciosStore();
    const [form, setForm] = useState(estadoInicialForm);

    useEffect(() => {
        if (precioActivoModal) {
            setForm({
                id: precioActivoModal._id || precioActivoModal.id || null,
                _id: precioActivoModal._id || precioActivoModal.id || null,
                anio: precioActivoModal.anio || new Date().getFullYear(),
                fechaVigencia: precioActivoModal.fechaVigencia || new Date().toISOString().split('T')[0],
                descripcion: precioActivoModal.descripcion || '',
                precioKits: {
                    kcg: precioActivoModal.precioKits?.kcg ?? 0,
                    kcp: precioActivoModal.precioKits?.kcp ?? 0,
                    kb: precioActivoModal.precioKits?.kb ?? 0,
                    kce: precioActivoModal.precioKits?.kce ?? 0,
                },
                precioCirios: {
                    cc: precioActivoModal.precioCirios?.cc ?? 0,
                    cb: precioActivoModal.precioCirios?.cb ?? 0,
                },
                precioGuantes: {
                    gb: precioActivoModal.precioGuantes?.gb ?? 0,
                    gn: precioActivoModal.precioGuantes?.gn ?? 0,
                    gm: precioActivoModal.precioGuantes?.gm ?? 0,
                }
            });
        } else {
            setForm(estadoInicialForm);
        }
    }, [precioActivoModal, isOpen]);

    if (!isOpen) return null;

    const handleGeneralesChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'anio' ? Number(value) : value
        }));
    };

    const handleKitsChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            precioKits: {
                ...prev.precioKits,
                [name]: Number(value) || 0
            }
        }));
    };

    const handleCiriosChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            precioCirios: {
                ...prev.precioCirios,
                [name]: Number(value) || 0
            }
        }));
    };

    const handleGuantesChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            precioGuantes: {
                ...prev.precioGuantes,
                [name]: Number(value) || 0
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.anio || form.anio < 2015 || form.anio > 2035) {
            Swal.fire('Atención', 'Por favor ingresa un año válido.', 'warning');
            return;
        }
        if (!form.fechaVigencia) {
            Swal.fire('Atención', 'La fecha de vigencia es obligatoria.', 'warning');
            return;
        }

        const ok = startGuardarPrecio(form);
        if (ok) {
            onClose();
        }
    };

    const esEdicion = Boolean(form.id);

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
            tabIndex="-1"
            role="dialog"
        >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
                    {/* Header */}
                    <div
                        className="modal-header border-0 text-white p-4"
                        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: '46px', height: '46px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)' }}
                            >
                                <i className="fa-solid fa-tags text-primary fs-5"></i>
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0">
                                    {esEdicion ? 'Modificar Tarifa de Precios' : 'Nueva Tarifa de Precios Fábrica'}
                                </h5>
                                <small className="text-white-50">
                                    {esEdicion ? `Editando tarifa de ${form.anio}` : 'Configura precios de fábrica para kits, cirios y guantes con fecha de vigencia'}
                                </small>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white shadow-none"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 bg-light bg-opacity-50" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                            {/* Sección Datos Generales y Fecha */}
                            <div className="card border-0 shadow-xs rounded-3 p-3 mb-3 bg-white">
                                <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                                    <i className="fa-solid fa-calendar-days text-primary"></i>
                                    Vigencia y Aplicación
                                </h6>
                                <div className="row g-3">
                                    <div className="col-12 col-md-3">
                                        <label className="form-label small fw-bold text-secondary">Año Aplicable</label>
                                        <input
                                            type="number"
                                            name="anio"
                                            className="form-control form-control-sm rounded-pill border-secondary border-opacity-25 fw-bold"
                                            value={form.anio}
                                            onChange={handleGeneralesChange}
                                            min="2017"
                                            max="2035"
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label small fw-bold text-secondary">Fecha de Vigencia / Inicio</label>
                                        <input
                                            type="date"
                                            name="fechaVigencia"
                                            className="form-control form-control-sm rounded-pill border-secondary border-opacity-25"
                                            value={form.fechaVigencia}
                                            onChange={handleGeneralesChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <label className="form-label small fw-bold text-secondary">Descripción / Identificador</label>
                                        <input
                                            type="text"
                                            name="descripcion"
                                            className="form-control form-control-sm rounded-pill border-secondary border-opacity-25"
                                            placeholder="Ej: Tarifa Inicial, Ajuste Junio..."
                                            value={form.descripcion}
                                            onChange={handleGeneralesChange}
                                        />
                                    </div>
                                </div>
                                <small className="text-muted mt-2 d-block" style={{ fontSize: '0.73rem' }}>
                                    <i className="fa-solid fa-circle-info text-info me-1"></i>
                                    Puedes registrar más de una tarifa para el mismo año. Las ventas tomarán la tarifa vigente según su fecha.
                                </small>
                            </div>

                            {/* Sección Precios Kits */}
                            <div className="card border-0 shadow-xs rounded-3 p-3 mb-3 bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                                        <i className="fa-solid fa-box-open text-primary"></i>
                                        Precios de Fábrica — Línea de Kits
                                    </h6>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill small">4 Productos</span>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-semibold text-secondary">Kit Bautizo (KB)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="kb"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioKits.kb}
                                                onChange={handleKitsChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-semibold text-secondary">Kit Comunión Grande (KCG)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="kcg"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioKits.kcg}
                                                onChange={handleKitsChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-semibold text-secondary">Kit Comunión Pequeño (KCP)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="kcp"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioKits.kcp}
                                                onChange={handleKitsChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-semibold text-secondary">Kit Económico (KCE)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="kce"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioKits.kce}
                                                onChange={handleKitsChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección Precios Cirios */}
                            <div className="card border-0 shadow-xs rounded-3 p-3 mb-3 bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                                        <i className="fa-solid fa-fire-flame-curved text-warning"></i>
                                        Precios de Fábrica — Cirios
                                    </h6>
                                    <span className="badge bg-warning-subtle text-dark rounded-pill small">2 Productos</span>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6 col-md-6">
                                        <label className="form-label small fw-semibold text-secondary">Cirio de Comunión (CC)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="cc"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioCirios.cc}
                                                onChange={handleCiriosChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-6">
                                        <label className="form-label small fw-semibold text-secondary">Cirio de Bautizo (CB)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="cb"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioCirios.cb}
                                                onChange={handleCiriosChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección Precios Guantes */}
                            <div className="card border-0 shadow-xs rounded-3 p-3 mb-2 bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                                        <i className="fa-solid fa-mitten text-purple"></i>
                                        Precios de Fábrica — Guantes (por Docena)
                                    </h6>
                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill small">3 Líneas</span>
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label small fw-semibold text-secondary">Guantes Blancos (GB)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="gb"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioGuantes.gb}
                                                onChange={handleGuantesChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label small fw-semibold text-secondary">Guantes Negros (GN)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="gn"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioGuantes.gn}
                                                onChange={handleGuantesChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label small fw-semibold text-secondary">Guantes Mitón (GM)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill">$</span>
                                            <input
                                                type="number"
                                                name="gm"
                                                className="form-control rounded-end-pill fw-bold"
                                                value={form.precioGuantes.gm}
                                                onChange={handleGuantesChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 p-3 bg-white justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-light rounded-pill px-4 border"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                            >
                                <i className="fa-solid fa-floppy-disk"></i>
                                {esEdicion ? 'Guardar Cambios' : 'Registrar Tarifa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
