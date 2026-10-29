import React, { useState, useRef } from 'react';
import { useClientesStore, useFuntions } from '../../../hooks';
import { useTiposGuanteEspecial } from '../../../hooks/useTiposGuanteEspecial';
import Swal from 'sweetalert2';

/**
 * FormGuanteEspecial
 * Funciona igual que FormGuantes BLANCOS (T-4 a T-12, 9 tallas) pero
 * con selector de "tipo especial" cargado desde BD, cada tipo tiene su
 * propio precio y se puede editar o eliminar inline.
 */
export const FormGuanteEspecial = ({ setPedidoGuantes, pedidoGuantes }) => {
    const categoria = 'ESPECIAL';
    const TALLA_INICIAL = 4;
    const CANT_TALLAS = 9; // T-4 a T-12

    const { formatearPrecio } = useFuntions();
    const { clienteActivo } = useClientesStore();
    const { tipos, cargando, agregarTipo, editarTipo, eliminarTipo } = useTiposGuanteEspecial();

    const [tipoSeleccionado, setTipoSeleccionado] = useState('');

    // Panel: 'none' | 'add' | 'manage'
    const [panel, setPanel] = useState('none');

    // Estado para nuevo tipo
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [guardando, setGuardando] = useState(false);
    const nuevoNombreRef = useRef(null);

    // Estado para edición inline de un tipo existente
    const [editandoId, setEditandoId] = useState(null);
    const [editNombre, setEditNombre] = useState('');
    const [editPrecio, setEditPrecio] = useState('');
    const [guardandoEdit, setGuardandoEdit] = useState(false);

    // Precio del tipo seleccionado (del objeto de tipos)
    const tipoObj = tipos.find(t => t.nombre === tipoSeleccionado);
    const precioActual = tipoObj?.precio || 0;

    const onInputChange = ({ target }, talla) => {
        const { name, value } = target;
        if (value === '' || isNaN(Number(value))) return;
        if (value < 0) return;

        if (!tipoSeleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona el tipo de guante especial',
                text: 'Debes elegir el tipo antes de agregar cantidades.',
                confirmButtonColor: '#0d6efd',
            });
            return;
        }

        if (!precioActual) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin precio configurado',
                text: `El tipo "${tipoSeleccionado}" no tiene precio asignado. Edítalo primero.`,
                confirmButtonColor: '#0d6efd',
            });
            return;
        }

        setPedidoGuantes(prevState => {
            const nuevoEstado = [...prevState];
            const index = nuevoEstado.findIndex(item => item.nombreInput === name);
            if (value !== '0') {
                const nuevoItem = {
                    nombreInput: name,
                    cantidad: value,
                    talla: 'T-' + talla,
                    categoria,
                    tipoEspecial: tipoSeleccionado,
                    precioUnitario: precioActual,
                };
                if (index !== -1) {
                    nuevoEstado[index] = nuevoItem;
                } else {
                    nuevoEstado.push(nuevoItem);
                }
            } else {
                if (index !== -1) nuevoEstado.splice(index, 1);
            }
            return nuevoEstado;
        });
    };

    // ── AGREGAR NUEVO TIPO ──────────────────────────────────────────
    const handleAgregarTipo = async () => {
        if (!nuevoNombre.trim()) return;
        setGuardando(true);
        const resultado = await agregarTipo({ nombre: nuevoNombre, precio: nuevoPrecio });
        setGuardando(false);
        if (resultado) {
            setTipoSeleccionado(resultado.nombre);
            setNuevoNombre('');
            setNuevoPrecio('');
            setPanel('none');
            Swal.fire({ icon: 'success', title: `"${resultado.nombre}" agregado`, timer: 1600, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el tipo.' });
        }
    };

    // ── INICIAR EDICIÓN ─────────────────────────────────────────────
    const iniciarEdicion = (tipo) => {
        setEditandoId(tipo.id);
        setEditNombre(tipo.nombre);
        setEditPrecio(String(tipo.precio || ''));
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setEditNombre('');
        setEditPrecio('');
    };

    // ── GUARDAR EDICIÓN ─────────────────────────────────────────────
    const handleGuardarEdicion = async (id) => {
        if (!editNombre.trim()) return;
        const nombreOriginal = tipos.find(t => (t.id === id || t._id === id))?.nombre;
        setGuardandoEdit(true);
        const resultado = await editarTipo(id, { nombre: editNombre, precio: editPrecio });
        setGuardandoEdit(false);
        if (resultado) {
            const nuevoPrecioNum = Number(editPrecio) || 0;
            // Sincronizar items ya agregados al pedido con el nuevo nombre y precio
            setPedidoGuantes(prev => prev.map(item => {
                if (item.categoria === categoria && item.tipoEspecial === nombreOriginal) {
                    return {
                        ...item,
                        tipoEspecial: editNombre.trim(),
                        precioUnitario: nuevoPrecioNum,
                    };
                }
                return item;
            }));

            // Si el tipo editado era el seleccionado, actualizar nombre seleccionado
            if (tipoSeleccionado === nombreOriginal) setTipoSeleccionado(editNombre.trim());
            cancelarEdicion();
        } else {
            Swal.fire({ icon: 'error', title: 'Error al guardar' });
        }
    };

    // ── ELIMINAR TIPO ───────────────────────────────────────────────
    const handleEliminarTipo = async (tipo) => {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: `¿Eliminar "${tipo.nombre}"?`,
            text: 'Se desactivará de la lista de tipos.',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!confirm.isConfirmed) return;
        const ok = await eliminarTipo(tipo.id || tipo._id);
        if (ok) {
            if (tipoSeleccionado === tipo.nombre) setTipoSeleccionado('');
            // Remover del pedido los items que pertenecían al tipo eliminado
            setPedidoGuantes(prev => prev.filter(item => !(item.categoria === categoria && item.tipoEspecial === tipo.nombre)));
            Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1400, showConfirmButton: false });
        }
    };

    // Items de esta categoría
    const itemsEnCategoria = pedidoGuantes
        .filter(item => item.categoria === categoria)
        .reduce((acc, item) => acc + parseInt(item.cantidad || 0, 10), 0);

    return (
        <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
            {/* ── HEADER ─────────────────────────────────────────────── */}
            <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-pill px-3 py-1 fw-bold"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' }}>
                        <i className="fa-solid fa-star me-1"></i>
                        GUANTES ESPECIAL
                    </span>
                    {precioActual > 0 && (
                        <span className="badge bg-light text-muted border border-light-subtle rounded-pill px-2 py-1 small fw-normal">
                            {formatearPrecio(precioActual)} c/u
                        </span>
                    )}
                </div>
                {itemsEnCategoria > 0 && (
                    <span className="badge bg-success text-white rounded-pill px-2 py-1 small">
                        <i className="fa-solid fa-check me-1"></i>
                        {itemsEnCategoria} {itemsEnCategoria === 1 ? 'par' : 'pares'}
                    </span>
                )}
            </div>

            {/* ── SELECTOR DE TIPO ────────────────────────────────────── */}
            <div className="mb-3">
                <label className="form-label small fw-semibold mb-1" style={{ color: '#5b21b6' }}>
                    <i className="fa-solid fa-tag me-1"></i>
                    Tipo de guante especial <span className="text-danger">*</span>
                </label>

                {cargando ? (
                    <div className="text-muted small d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm"></span> Cargando tipos...
                    </div>
                ) : (
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                        <select
                            className={`form-select form-select-sm shadow-none flex-grow-1 ${tipoSeleccionado ? 'border-success' : 'border-light-subtle'}`}
                            value={tipoSeleccionado}
                            onChange={e => setTipoSeleccionado(e.target.value)}
                            style={{ maxWidth: 280 }}
                        >
                            <option value="">— Selecciona el tipo —</option>
                            {tipos.map(t => (
                                <option key={t.id} value={t.nombre}>
                                    {t.nombre}{t.precio > 0 ? ` · $${t.precio.toLocaleString('es-CO')}` : ''}
                                </option>
                            ))}
                        </select>

                        {/* Botón Nuevo tipo */}
                        <button type="button"
                            className={`btn btn-sm ${panel === 'add' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-1`}
                            onClick={() => setPanel(p => p === 'add' ? 'none' : 'add')}
                            title="Agregar nuevo tipo">
                            <i className="fa-solid fa-plus"></i>
                            <span className="d-none d-sm-inline">Nuevo</span>
                        </button>

                        {/* Botón Gestionar tipos */}
                        {tipos.length > 0 && (
                            <button type="button"
                                className={`btn btn-sm ${panel === 'manage' ? 'btn-secondary' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                                onClick={() => { setPanel(p => p === 'manage' ? 'none' : 'manage'); cancelarEdicion(); }}
                                title="Editar / eliminar tipos">
                                <i className="fa-solid fa-sliders"></i>
                                <span className="d-none d-sm-inline">Gestionar</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Tipo seleccionado badge */}
                {tipoSeleccionado && (
                    <div className="mt-1">
                        <span className="badge rounded-pill px-2 py-1 small"
                            style={{ background: '#ede9fe', color: '#5b21b6' }}>
                            <i className="fa-solid fa-check-circle me-1"></i>
                            {tipoSeleccionado}
                            {precioActual > 0 && ` · ${formatearPrecio(precioActual)}`}
                        </span>
                    </div>
                )}
            </div>

            {/* ── PANEL: AGREGAR NUEVO TIPO ───────────────────────────── */}
            {panel === 'add' && (
                <div className="mb-3 p-3 rounded-3 border border-primary-subtle bg-primary-subtle bg-opacity-10">
                    <p className="small fw-semibold text-primary mb-2">
                        <i className="fa-solid fa-plus-circle me-1"></i> Nuevo tipo de guante especial
                    </p>
                    <div className="row g-2 align-items-end">
                        <div className="col-12 col-sm-6">
                            <label className="form-label small text-muted mb-1">Nombre del tipo</label>
                            <input
                                ref={nuevoNombreRef}
                                type="text"
                                className="form-control form-control-sm shadow-none"
                                placeholder="Ej: Guante de tiras"
                                value={nuevoNombre}
                                onChange={e => setNuevoNombre(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAgregarTipo(); }}
                                autoFocus
                            />
                        </div>
                        <div className="col-12 col-sm-4">
                            <label className="form-label small text-muted mb-1">Precio unitario</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white">$</span>
                                <input
                                    type="number"
                                    className="form-control form-control-sm shadow-none"
                                    placeholder="0"
                                    value={nuevoPrecio}
                                    onChange={e => setNuevoPrecio(e.target.value)}
                                    min="0"
                                    onFocus={e => e.target.select()}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-sm-2 d-flex gap-1">
                            <button type="button" className="btn btn-sm btn-success flex-grow-1"
                                onClick={handleAgregarTipo}
                                disabled={guardando || !nuevoNombre.trim()}>
                                {guardando
                                    ? <span className="spinner-border spinner-border-sm"></span>
                                    : <i className="fa-solid fa-floppy-disk"></i>}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary"
                                onClick={() => { setPanel('none'); setNuevoNombre(''); setNuevoPrecio(''); }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PANEL: GESTIONAR TIPOS (editar / eliminar) ─────────── */}
            {panel === 'manage' && tipos.length > 0 && (
                <div className="mb-3 p-3 rounded-3 border border-secondary-subtle bg-light">
                    <p className="small fw-semibold text-secondary mb-2">
                        <i className="fa-solid fa-sliders me-1"></i> Gestionar tipos
                    </p>
                    <div className="d-flex flex-column gap-2">
                        {tipos.map(tipo => (
                            <div key={tipo.id} className="rounded-3 border border-light-subtle bg-white p-2">
                                {editandoId === tipo.id ? (
                                    /* ── FILA DE EDICIÓN ── */
                                    <div className="row g-2 align-items-end">
                                        <div className="col-12 col-sm-5">
                                            <label className="form-label small text-muted mb-1">Nombre</label>
                                            <input type="text"
                                                className="form-control form-control-sm shadow-none"
                                                value={editNombre}
                                                onChange={e => setEditNombre(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="col-12 col-sm-4">
                                            <label className="form-label small text-muted mb-1">Precio unitario</label>
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white">$</span>
                                                <input type="number"
                                                    className="form-control form-control-sm shadow-none"
                                                    value={editPrecio}
                                                    onChange={e => setEditPrecio(e.target.value)}
                                                    min="0"
                                                    onFocus={e => e.target.select()}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-3 d-flex gap-1">
                                            <button type="button" className="btn btn-sm btn-success flex-grow-1"
                                                onClick={() => handleGuardarEdicion(tipo.id)}
                                                disabled={guardandoEdit || !editNombre.trim()}>
                                                {guardandoEdit
                                                    ? <span className="spinner-border spinner-border-sm"></span>
                                                    : <><i className="fa-solid fa-floppy-disk me-1"></i>Guardar</>}
                                            </button>
                                            <button type="button" className="btn btn-sm btn-outline-secondary"
                                                onClick={cancelarEdicion}>
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── FILA NORMAL ── */
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <div>
                                            <span className="fw-semibold text-dark small">{tipo.nombre}</span>
                                            <span className="ms-2 badge rounded-pill small"
                                                style={{ background: tipo.precio > 0 ? '#d1fae5' : '#fef3c7', color: tipo.precio > 0 ? '#065f46' : '#92400e' }}>
                                                {tipo.precio > 0
                                                    ? `$${tipo.precio.toLocaleString('es-CO')}`
                                                    : 'Sin precio'}
                                            </span>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-sm btn-outline-primary py-0 px-2"
                                                title="Editar"
                                                onClick={() => iniciarEdicion(tipo)}>
                                                <i className="fa-solid fa-pen-to-square small"></i>
                                            </button>
                                            <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2"
                                                title="Eliminar"
                                                onClick={() => handleEliminarTipo(tipo)}>
                                                <i className="fa-solid fa-trash small"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── GRID DE TALLAS ──────────────────────────────────────── */}
            <div className="row g-2">
                {[...Array(CANT_TALLAS)].map((_, index) => {
                    const tallaNum = index + TALLA_INICIAL;
                    const inputName = `inputGuantes-T${tallaNum}-${categoria}-${tipoSeleccionado || 'NOTIPO'}`;
                    const currentVal = pedidoGuantes.find(item =>
                        item.nombreInput === inputName ||
                        (item.categoria === categoria &&
                            item.tipoEspecial === tipoSeleccionado &&
                            (item.talla === `T-${tallaNum}` || item.talla === `T${tallaNum}` || item.talla === String(tallaNum)))
                    )?.cantidad || '0';
                    const hasValue = parseInt(currentVal, 10) > 0;

                    return (
                        <div key={index} className="col-6 col-sm-4 col-md-3">
                            <div className={`p-2 rounded-3 border ${hasValue
                                ? 'border-success bg-success-subtle bg-opacity-25'
                                : 'border-light-subtle bg-light bg-opacity-50'
                            }`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="badge bg-white text-dark border border-light-subtle rounded-pill px-2 py-0 small fw-bold">
                                        T-{tallaNum}
                                    </span>
                                    {hasValue && <i className="fa-solid fa-circle-check text-success small"></i>}
                                </div>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white text-muted small px-1 border-light-subtle">
                                        Pares
                                    </span>
                                    <input
                                        type="number"
                                        className={`form-control form-control-sm text-center fw-bold shadow-none ${hasValue ? 'border-success text-success' : 'border-light-subtle'}`}
                                        name={inputName}
                                        value={currentVal}
                                        onChange={event => onInputChange(event, tallaNum)}
                                        min="0"
                                        onFocus={(e) => e.target.select()}
                                        disabled={!tipoSeleccionado}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!tipoSeleccionado && (
                <p className="text-muted small mt-2 mb-0 text-center">
                    <i className="fa-solid fa-arrow-up me-1"></i>
                    Selecciona un tipo para habilitar el ingreso de tallas
                </p>
            )}
        </div>
    );
};
