import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { useAuthStore } from '../../../hooks';
import { useFuntions } from '../../../hooks/useFuntions';
import useImage from '../../../hooks/useImage';

export const ModalDetallePedido = ({ setShow, show, pedido }) => {
    const { user } = useAuthStore();
    const { capitalize, formatearPrecio, obtenerImagen, buscarNombre, aTitulo, fechaCorta, limpiarFecha } = useFuntions();

    const esPlanta = String(user?.rol || '').toLowerCase().trim() === 'planta';
    const [selectedRows, setSelectedRows] = useState({});
    const [copiedField, setCopiedField] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [modoTaller, setModoTaller] = useState(esPlanta);

    const handleClose = () => setShow(false);

    // Copiar texto al portapapeles con feedback temporal
    const copiarTexto = (texto, campo) => {
        if (!texto) return;
        navigator.clipboard.writeText(texto);
        setCopiedField(campo);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Toggle de checklist para control de preparación/empaque
    const handleCheck = (key) => {
        setSelectedRows(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Alternar todos los ítems de una categoría
    const handleCheckAllCategory = (categoria, itemsKeys, estadoActual) => {
        setSelectedRows(prev => {
            const next = { ...prev };
            itemsKeys.forEach(k => {
                next[k] = !estadoActual;
            });
            return next;
        });
    };

    // Estado visual y configuración del pedido
    const estadoConfig = useMemo(() => {
        const est = String(pedido?.estado || '').toLowerCase().trim();
        switch (est) {
            case 'pendiente':
                return { label: 'Pendiente', icon: 'fa-clock', bg: '#fef3c7', color: '#92400e', border: '#fcd34d', step: 1 };
            case 'preparado':
                return { label: 'Preparado', icon: 'fa-box-open', bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd', step: 2 };
            case 'enviado':
                return { label: 'Enviado', icon: 'fa-truck-fast', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', step: 3 };
            case 'entregado':
                return { label: 'Entregado', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d', border: '#86efac', step: 4 };
            case 'pagado':
                return { label: 'Pagado', icon: 'fa-money-bill-wave', bg: '#ecfdf5', color: '#047857', border: '#6ee7b7', step: 5 };
            case 'anulado':
                return { label: 'Anulado', icon: 'fa-ban', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', step: 0 };
            case 'devuelto':
                return { label: 'Devuelto', icon: 'fa-rotate-left', bg: '#ffedd5', color: '#c2410c', border: '#fdba74', step: 0 };
            default:
                return { label: capitalize(est || 'Sin Estado'), icon: 'fa-circle-info', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', step: 0 };
        }
    }, [pedido?.estado, capitalize]);

    // Resumen numérico y financiero
    const resumenPedido = useMemo(() => {
        let totalGeneral = 0;
        let totalProductos = 0;
        let totalCategorias = 0;
        const desglosePorCategoria = {};

        if (pedido?.itemPedido && Array.isArray(pedido.itemPedido)) {
            pedido.itemPedido.forEach(block => {
                const itemsMap = block?.itemPedido || {};
                Object.entries(itemsMap).forEach(([cat, catData]) => {
                    totalCategorias += 1;
                    const items = catData?.pedido || [];
                    let subtotalCat = 0;
                    let productosCat = 0;

                    items.forEach(prod => {
                        const cant = Number(prod.cantidad) || 0;
                        const prec = Number(prod.precioUnitario || prod.precio) || 0;
                        const sub = prec * cant;
                        subtotalCat += sub;
                        productosCat += cant;
                    });

                    totalGeneral += subtotalCat;
                    totalProductos += productosCat;
                    desglosePorCategoria[cat] = {
                        subtotal: subtotalCat,
                        productos: productosCat,
                        count: items.length
                    };
                });
            });
        }

        return {
            totalGeneral,
            totalProductos,
            totalCategorias,
            desglosePorCategoria
        };
    }, [pedido?.itemPedido]);

    const idPedidoMostrar = pedido?.pedido_id || pedido?._id || '';

    // Íconos y colores por categoría
    const getCategoryTheme = (cat = '') => {
        const c = String(cat).toUpperCase();
        if (c.startsWith('K')) {
            return { icon: 'fa-box-open', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
        }
        if (c === 'GUANTES' || c.startsWith('G_') || c === 'G') {
            return { icon: 'fa-mitten', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
        }
        if (c === 'CC' || c === 'CB' || c === 'CCON') {
            return { icon: 'fa-fire', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' };
        }
        return { icon: 'fa-tags', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
    };

    return (
        <>
            <Modal
                size="xl"
                aria-labelledby="modal-detalle-pedido-title"
                centered
                show={show}
                onHide={handleClose}
                scrollable
                contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
            >
                {/* Cabecera Principal */}
                <Modal.Header className="bg-white border-bottom py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center shadow-xs"
                            style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563eb' }}
                        >
                            <i className="fa-solid fa-receipt fs-4"></i>
                        </div>
                        <div>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <span className="text-secondary small fw-bold text-uppercase">Remisión / Pedido:</span>
                                <span className="badge bg-light text-dark border px-2.5 py-1 font-monospace fw-bold fs-6">
                                    #{idPedidoMostrar ? idPedidoMostrar.slice(-8).toUpperCase() : '---'}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-link p-0 text-primary text-decoration-none"
                                    onClick={() => copiarTexto(idPedidoMostrar, 'idPedido')}
                                    title="Copiar ID completo del pedido"
                                >
                                    <i className={`fa-solid ${copiedField === 'idPedido' ? 'fa-check text-success' : 'fa-copy'}`}></i>
                                    {copiedField === 'idPedido' && <span className="ms-1 text-success small fw-bold">¡Copiado!</span>}
                                </button>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">
                                    <i className="fa-regular fa-calendar me-1"></i>
                                    Creado el {capitalize(pedido?.fechaCreacion || 'Fecha no registrada')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Estado del Pedido y Acciones de Cabecera */}
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        {/* Selector / Indicador de Modo Taller */}
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${
                                modoTaller
                                    ? 'btn-warning text-dark border-warning'
                                    : 'btn-outline-secondary'
                            }`}
                            onClick={() => setModoTaller(!modoTaller)}
                            title="Alternar entre modo administrativo y modo taller (pantalla grande para operarios)"
                        >
                            <i className={`fa-solid ${modoTaller ? 'fa-industry' : 'fa-laptop'} me-1.5`}></i>
                            {modoTaller ? 'Modo Taller Activo' : 'Modo Estándar'}
                        </button>

                        {/* Badge de Estado del Pedido */}
                        <div
                            className="px-3 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-xs"
                            style={{
                                backgroundColor: estadoConfig.bg,
                                color: estadoConfig.color,
                                border: `1px solid ${estadoConfig.border}`,
                                fontSize: '0.85rem'
                            }}
                        >
                            <i className={`fa-solid ${estadoConfig.icon}`}></i>
                            <span>{estadoConfig.label}</span>
                        </div>

                        {/* Botón Cerrar */}
                        <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-circle p-2 ms-2 text-secondary"
                            onClick={handleClose}
                            title="Cerrar modal"
                            style={{ width: '36px', height: '36px' }}
                        >
                            <i className="fa-solid fa-xmark fs-6"></i>
                        </button>
                    </div>
                </Modal.Header>

                <Modal.Body className="bg-light p-3 p-md-4">
                    {/* Flujo de Estados (Stepper Visual) */}
                    {estadoConfig.step > 0 && (
                        <div className="card border-0 rounded-4 shadow-sm p-3 mb-4 bg-white">
                            <div className="d-flex justify-content-between align-items-center position-relative px-2 px-md-4">
                                <div
                                    className="position-absolute top-50 start-0 translate-middle-y w-100 bg-light"
                                    style={{ height: '4px', zIndex: 1 }}
                                >
                                    <div
                                        className="bg-success transition-all"
                                        style={{
                                            height: '100%',
                                            width: `${((Math.min(estadoConfig.step, 5) - 1) / 4) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                {[
                                    { step: 1, label: 'Pendiente', icon: 'fa-clock' },
                                    { step: 2, label: 'Preparado', icon: 'fa-box-open' },
                                    { step: 3, label: 'Enviado', icon: 'fa-truck-fast' },
                                    { step: 4, label: 'Entregado', icon: 'fa-circle-check' },
                                    { step: 5, label: 'Pagado', icon: 'fa-money-bill-wave' }
                                ].map(s => {
                                    const alcanzado = estadoConfig.step >= s.step;
                                    const actual = estadoConfig.step === s.step;
                                    return (
                                        <div
                                            key={s.step}
                                            className="d-flex flex-column align-items-center position-relative"
                                            style={{ zIndex: 2 }}
                                        >
                                            <div
                                                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all shadow-xs ${
                                                    actual
                                                        ? 'bg-primary text-white ring-4 ring-primary-subtle'
                                                        : alcanzado
                                                            ? 'bg-success text-white'
                                                            : 'bg-white text-secondary border'
                                                }`}
                                                style={{
                                                    width: actual ? '36px' : '30px',
                                                    height: actual ? '36px' : '30px',
                                                    fontSize: '0.8rem',
                                                    boxShadow: actual ? '0 0 0 4px rgba(13, 110, 253, 0.2)' : 'none'
                                                }}
                                            >
                                                <i className={`fa-solid ${s.icon}`}></i>
                                            </div>
                                            <span
                                                className={`small mt-1 fw-semibold d-none d-md-block ${
                                                    actual ? 'text-primary fw-bold' : alcanzado ? 'text-success' : 'text-muted'
                                                }`}
                                                style={{ fontSize: '0.72rem' }}
                                            >
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tarjetas de Información: Cliente, Logística & Comercial */}
                    <Row className="g-3 mb-4">
                        {/* 1. Tarjeta Cliente */}
                        <Col xs={12} md={4}>
                            <div className="card border-0 rounded-4 shadow-sm p-3 h-100 bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                                            style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff' }}
                                        >
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-0">Cliente</h6>
                                    </div>
                                    {pedido?.cliente?.distribuidor ? (
                                        <Badge bg="primary-subtle" className="text-primary border border-primary-subtle rounded-pill px-2">
                                            Distribuidor
                                        </Badge>
                                    ) : (
                                        <Badge bg="light" className="text-secondary border rounded-pill px-2">
                                            Particular
                                        </Badge>
                                    )}
                                </div>
                                <h6 className="fw-bold text-dark mb-1">
                                    {aTitulo(pedido?.cliente?.nombre || 'Cliente sin nombre')}
                                </h6>
                                <div className="text-muted small d-flex flex-column gap-1">
                                    {pedido?.cliente?.nit && (
                                        <span>
                                            <i className="fa-regular fa-id-card me-1 text-secondary"></i>
                                            NIT/CC: <strong>{pedido.cliente.nit}</strong>
                                        </span>
                                    )}
                                    <span>
                                        <i className="fa-solid fa-location-dot me-1 text-danger"></i>
                                        {aTitulo(pedido?.cliente?.ciudad || 'Ciudad no especificada')}
                                    </span>
                                    {pedido?.cliente?.direccion && (
                                        <span>
                                            <i className="fa-regular fa-map me-1 text-secondary"></i>
                                            {pedido.cliente.direccion}
                                        </span>
                                    )}
                                    {pedido?.cliente?.telefono && (
                                        <div className="d-flex align-items-center gap-1 mt-1">
                                            <i className="fa-solid fa-phone me-1 text-success"></i>
                                            <span>{pedido.cliente.telefono}</span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-link p-0 text-secondary text-decoration-none ms-1"
                                                onClick={() => copiarTexto(pedido.cliente.telefono, 'telefono')}
                                                title="Copiar teléfono"
                                            >
                                                <i className={`fa-solid ${copiedField === 'telefono' ? 'fa-check text-success' : 'fa-copy'}`}></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* 2. Tarjeta Logística & Despacho */}
                        <Col xs={12} md={4}>
                            <div className="card border-0 rounded-4 shadow-sm p-3 h-100 bg-white">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-info"
                                        style={{ width: '32px', height: '32px', backgroundColor: '#f0f9ff' }}
                                    >
                                        <i className="fa-solid fa-truck"></i>
                                    </div>
                                    <h6 className="fw-bold text-dark mb-0">Despacho y Pago</h6>
                                </div>
                                <div className="text-muted small d-flex flex-column gap-2">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1.5">
                                        <span>Transportadora / Entrega:</span>
                                        <strong className="text-dark">{capitalize(pedido?.tipoDespacho || 'No especificado')}</strong>
                                    </div>
                                    {!esPlanta && (
                                        <div className="d-flex justify-content-between align-items-center border-bottom pb-1.5">
                                            <span>Forma de pago:</span>
                                            <strong className="text-dark">{capitalize(pedido?.formaPago || 'Sin definir')}</strong>
                                        </div>
                                    )}
                                    {!esPlanta && (
                                        <div className="d-flex justify-content-between align-items-center border-bottom pb-1.5">
                                            <span>Costo de envío:</span>
                                            <strong className={Number(pedido?.costoEnvio) > 0 ? 'text-danger' : 'text-success'}>
                                                {Number(pedido?.costoEnvio) > 0 ? formatearPrecio(pedido.costoEnvio) : 'Incluido / $0'}
                                            </strong>
                                        </div>
                                    )}

                                    {/* Guía de Envío Interactiva */}
                                    {pedido?.numeroGuia ? (
                                        <div className="p-2 rounded-3 bg-light border d-flex flex-column gap-1">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="fw-semibold text-secondary small">
                                                    <i className="fa-solid fa-barcode me-1 text-primary"></i> Guía:
                                                </span>
                                                <div className="d-flex align-items-center gap-1">
                                                    <strong className="text-primary font-monospace">{pedido.numeroGuia}</strong>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link p-0 text-secondary text-decoration-none ms-1"
                                                        onClick={() => copiarTexto(pedido.numeroGuia, 'guia')}
                                                        title="Copiar número de guía"
                                                    >
                                                        <i className={`fa-solid ${copiedField === 'guia' ? 'fa-check text-success' : 'fa-copy'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <a
                                                href="https://interrapidisimo.com/sigue-tu-envio/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary rounded-pill py-0.5 mt-1 fw-bold text-decoration-none d-flex align-items-center justify-content-center gap-1"
                                                onClick={() => navigator.clipboard.writeText(pedido.numeroGuia)}
                                            >
                                                <i className="fa-solid fa-arrow-up-right-from-square small"></i>
                                                Rastrear Envío
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-muted fst-italic small">
                                            <i className="fa-solid fa-circle-info me-1"></i> Guía pendiente de asignación
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* 3. Tarjeta Comercial (No-Planta) / Control de Alistamiento (Planta) */}
                        <Col xs={12} md={4}>
                            <div className="card border-0 rounded-4 shadow-sm p-3 h-100 bg-white d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-success"
                                            style={{ width: '32px', height: '32px', backgroundColor: '#ecfdf5' }}
                                        >
                                            <i className={`fa-solid ${esPlanta ? 'fa-boxes-packing' : 'fa-user-tie'}`}></i>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-0">{esPlanta ? 'Control de Alistamiento' : 'Gestión Comercial'}</h6>
                                    </div>
                                    <div className="text-muted small d-flex flex-column gap-1 mb-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Asesor responsable:</span>
                                            <strong className="text-dark">{pedido?.user?.name || 'Sistema'}</strong>
                                        </div>
                                        {!esPlanta && pedido?.user?.email && (
                                            <div className="d-flex justify-content-between align-items-center text-truncate">
                                                <span>Email:</span>
                                                <span className="text-muted text-truncate ms-2">{pedido.user.email}</span>
                                            </div>
                                        )}
                                        {pedido?.fechaModificacionEstado && (
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Último cambio:</span>
                                                <span className="text-muted">{fechaCorta(limpiarFecha(pedido.fechaModificacionEstado))}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Banner Destacado: Unidades en Planta vs Total Facturado en Admin/Ventas */}
                                {esPlanta ? (
                                    <div
                                        className="p-2.5 rounded-3 text-white text-center mt-2 shadow-xs"
                                        style={{
                                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                                        }}
                                    >
                                        <span className="small text-white-50 text-uppercase d-block fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                            Total Unidades a Preparar
                                        </span>
                                        <span className="fs-3 fw-bolder text-white d-block">
                                            {resumenPedido.totalProductos} unds
                                        </span>
                                        <div className="d-flex justify-content-center gap-2 mt-1 small text-white-50" style={{ fontSize: '0.72rem' }}>
                                            <span><strong>{resumenPedido.totalCategorias}</strong> categorías</span>
                                            <span>•</span>
                                            <span>Taller Planta</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="p-2.5 rounded-3 text-white text-center mt-2 shadow-xs"
                                        style={{
                                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                        }}
                                    >
                                        <span className="small text-white-50 text-uppercase d-block fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                            Total General del Pedido
                                        </span>
                                        <span className="fs-3 fw-bolder text-white d-block">
                                            {formatearPrecio(resumenPedido.totalGeneral)}
                                        </span>
                                        <div className="d-flex justify-content-center gap-2 mt-1 small text-white-50" style={{ fontSize: '0.72rem' }}>
                                            <span><strong>{resumenPedido.totalProductos}</strong> productos</span>
                                            <span>•</span>
                                            <span><strong>{resumenPedido.totalCategorias}</strong> categorías</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Observaciones y Notas si existen */}
                    {(pedido?.detalleGeneral || pedido?.detalleEstado) && (
                        <div className="card border-0 rounded-4 shadow-sm p-3 mb-4 bg-white">
                            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                                <i className="fa-solid fa-clipboard-list text-warning"></i>
                                Observaciones y Notas del Pedido
                            </h6>
                            <Row className="g-2">
                                {pedido?.detalleGeneral && (
                                    <Col xs={12} md={pedido?.detalleEstado ? 6 : 12}>
                                        <div className="p-2.5 rounded-3 bg-light border">
                                            <span className="small fw-bold text-secondary d-block mb-1">
                                                <i className="fa-solid fa-comment-dots me-1"></i> Detalle General:
                                            </span>
                                            <p className="mb-0 text-dark small">{pedido.detalleGeneral}</p>
                                        </div>
                                    </Col>
                                )}
                                {pedido?.detalleEstado && (
                                    <Col xs={12} md={pedido?.detalleGeneral ? 6 : 12}>
                                        <div className="p-2.5 rounded-3 bg-light border">
                                            <span className="small fw-bold text-secondary d-block mb-1">
                                                <i className="fa-solid fa-triangle-exclamation me-1 text-warning"></i> Novedad de Estado:
                                            </span>
                                            <p className="mb-0 text-dark small">{pedido.detalleEstado}</p>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>
                    )}

                    {/* LISTADO DE PRODUCTOS AGRUPADOS POR CATEGORÍA */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="p-1.5 bg-primary-subtle text-primary rounded-3">
                                <i className="fa-solid fa-boxes-stacked"></i>
                            </span>
                            <h5 className="fw-bolder text-dark mb-0">Detalle de Productos por Categoría</h5>
                        </div>
                        <div className="text-muted small">
                            Marque los ítems para verificar el alistamiento / empaque
                        </div>
                    </div>

                    {pedido?.itemPedido?.map((block, blockIdx) => (
                        <div key={block._id || blockIdx} className="d-flex flex-column gap-4 mb-4">
                            {Object.entries(block?.itemPedido || {}).map(([categoria, detalles], catIdx) => {
                                const theme = getCategoryTheme(categoria);
                                const nombreCat = buscarNombre(categoria);
                                const items = detalles?.pedido || [];

                                // Ordenar ítems por motivo y luego por talla
                                const itemsOrdenados = [...items].sort((a, b) => {
                                    const motivoA = (a?.motivo || '').trim().toUpperCase();
                                    const motivoB = (b?.motivo || '').trim().toUpperCase();
                                    if (motivoA && !motivoB) return -1;
                                    if (!motivoA && motivoB) return 1;
                                    const comp = motivoA.localeCompare(motivoB, undefined, { numeric: true });
                                    if (comp !== 0) return comp;

                                    const tallaA = parseInt((a?.nombreInput || '').replace(/\D/g, ''), 10);
                                    const tallaB = parseInt((b?.nombreInput || '').replace(/\D/g, ''), 10);
                                    if (isNaN(tallaA)) return 1;
                                    if (isNaN(tallaB)) return -1;
                                    return tallaA - tallaB;
                                });

                                const subtotalCat = items.reduce((acc, p) => {
                                    const cant = Number(p.cantidad) || 0;
                                    const prec = Number(p.precioUnitario || p.precio) || 0;
                                    return acc + (cant * prec);
                                }, 0);

                                const totalProductosCat = items.reduce((acc, p) => acc + (Number(p.cantidad) || 0), 0);

                                const allKeys = items.map((_, i) => `${categoria}-${catIdx}-${i}`);
                                const todosSeleccionados = allKeys.length > 0 && allKeys.every(k => !!selectedRows[k]);

                                return (
                                    <div
                                        key={`${categoria}-${catIdx}`}
                                        className="card rounded-4 overflow-hidden bg-white"
                                        style={{
                                            border: `1.5px solid ${theme.border}`,
                                            borderLeft: `6px solid ${theme.color}`,
                                            boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.08)'
                                        }}
                                    >
                                        {/* Encabezado de la Categoría */}
                                        <div
                                            className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
                                            style={{
                                                backgroundColor: theme.bg,
                                                borderBottom: `2px solid ${theme.border}`
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center shadow-xs"
                                                    style={{ width: '36px', height: '36px', backgroundColor: '#ffffff', color: theme.color }}
                                                >
                                                    <i className={`fa-solid ${theme.icon}`}></i>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '0.2px' }}>
                                                        {nombreCat}
                                                    </h6>
                                                    {detalles?.detalleGeneral && (
                                                        <small className="text-secondary fst-italic d-block mt-0.5">
                                                            <i className="fa-regular fa-note-sticky me-1"></i>
                                                            {detalles.detalleGeneral}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-2">
                                                <Badge bg="white" className="text-dark border rounded-pill px-2.5 py-1.5 fw-bold shadow-xs">
                                                    {totalProductosCat} productos
                                                </Badge>
                                                {!esPlanta && (
                                                    <Badge bg="success" className="rounded-pill px-3 py-1.5 fw-bold shadow-xs fs-7">
                                                        Subtotal: {formatearPrecio(subtotalCat)}
                                                    </Badge>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 text-secondary fw-semibold"
                                                    onClick={() => handleCheckAllCategory(categoria, allKeys, todosSeleccionados)}
                                                    title={todosSeleccionados ? 'Desmarcar todos los ítems' : 'Marcar todos los ítems como verificados'}
                                                    style={{ fontSize: '0.74rem' }}
                                                >
                                                    <i className={`fa-solid ${todosSeleccionados ? 'fa-square-check text-success' : 'fa-check'} me-1`}></i>
                                                    {todosSeleccionados ? 'Desmarcar' : 'Marcar todos'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tabla de Productos de la Categoría */}
                                        <div className="table-responsive">
                                            <Table hover className={`table-bordered align-middle mb-0 ${modoTaller ? 'table-lg' : 'table-sm'}`} style={{ borderColor: '#e2e8f0' }}>
                                                <thead className="table-light">
                                                    <tr className="text-secondary small fw-bold text-center">
                                                        <th style={{ width: '44px' }}>✓</th>
                                                        <th className="text-start ps-3">Motivo / Producto</th>
                                                        {(categoria === 'KCG' || categoria === 'GUANTES') && (
                                                            <th style={{ width: '110px' }}>Talla</th>
                                                        )}
                                                        <th style={{ width: '90px' }}>Cantidad</th>
                                                        {!esPlanta && (
                                                            <>
                                                                <th style={{ width: '130px' }} className="text-end">Precio Unitario</th>
                                                                <th style={{ width: '140px' }} className="text-end pe-3">Subtotal</th>
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itemsOrdenados.map((item, itemIdx) => {
                                                        const rowKey = `${categoria}-${catIdx}-${itemIdx}`;
                                                        const isChecked = !!selectedRows[rowKey];
                                                        const inputStr = String(item?.nombreInput || '');
                                                        const esSurtidoNino = inputStr.includes('inputSurtidoNino') || inputStr.endsWith('O');
                                                        const esSurtidoNina = inputStr.includes('inputSurtidoNina') || inputStr.endsWith('A');

                                                        // Imagen del producto si corresponde
                                                        let imgSrc = null;
                                                        if (['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON'].includes(categoria) && !esSurtidoNino && !esSurtidoNina) {
                                                            const motivoNum = parseInt(inputStr.split('-')[1] || '1', 10);
                                                            if (!isNaN(motivoNum)) {
                                                                imgSrc = useImage(obtenerImagen(categoria, item.genero), motivoNum);
                                                            }
                                                        }

                                                        const precioU = Number(item?.precioUnitario || item?.precio) || 0;
                                                        const cant = Number(item?.cantidad) || 0;
                                                        const sub = precioU * cant;

                                                        return (
                                                            <tr
                                                                key={item._id || rowKey}
                                                                className={`transition-all ${isChecked ? 'table-success bg-opacity-25' : ''}`}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleCheck(rowKey)}
                                                            >
                                                                {/* Checkbox de Verificación */}
                                                                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="form-check d-flex justify-content-center m-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            checked={isChecked}
                                                                            onChange={() => handleCheck(rowKey)}
                                                                            style={{
                                                                                transform: modoTaller ? 'scale(1.6)' : 'scale(1.2)',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>

                                                                {/* Producto / Motivo */}
                                                                <td className="text-start ps-3">
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        {/* Miniatura con zoom al hacer clic */}
                                                                        {imgSrc ? (
                                                                            <div
                                                                                className="position-relative rounded-3 border overflow-hidden shadow-xs flex-shrink-0 bg-white"
                                                                                style={{
                                                                                    width: modoTaller ? '90px' : '65px',
                                                                                    height: modoTaller ? '90px' : '65px',
                                                                                    cursor: 'zoom-in'
                                                                                }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setPreviewImage({
                                                                                        src: imgSrc,
                                                                                        title: `${nombreCat} - Motivo #${inputStr.split('-')[1] || ''}`
                                                                                    });
                                                                                }}
                                                                                title="Haga clic para ver imagen ampliada"
                                                                            >
                                                                                <img
                                                                                    src={imgSrc}
                                                                                    alt="Motivo"
                                                                                    className="w-100 h-100 object-fit-contain"
                                                                                    loading="lazy"
                                                                                />
                                                                                <span
                                                                                    className="position-absolute bottom-0 end-0 p-0.5 bg-dark bg-opacity-50 text-white rounded-start"
                                                                                    style={{ fontSize: '0.6rem' }}
                                                                                >
                                                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                                                </span>
                                                                            </div>
                                                                        ) : null}

                                                                        <div className="d-flex flex-column gap-1">
                                                                            {/* Identificación de Motivo */}
                                                                            {categoria === 'GUANTES' && (
                                                                                <span className={`fw-bold text-dark ${modoTaller ? 'fs-5' : 'fs-6'}`}>
                                                                                    {item.producto || inputStr.split('-').pop()}
                                                                                </span>
                                                                            )}

                                                                            {categoria === 'OTR' && (
                                                                                <span className={`fw-bold text-dark ${modoTaller ? 'fs-5' : 'fs-6'}`}>
                                                                                    {item?.producto || 'Accesorio sin nombre'}
                                                                                </span>
                                                                            )}

                                                                            {['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON'].includes(categoria) && (
                                                                                <>
                                                                                    {esSurtidoNino ? (
                                                                                        <div className="d-flex align-items-center gap-1.5">
                                                                                            <span className={`fw-bold text-dark ${modoTaller ? 'fs-5' : ''}`}>Surtido</span>
                                                                                            <Badge bg="primary" className="rounded-pill px-2 py-0.5">
                                                                                                <i className="fa-solid fa-mars me-1"></i> Niño
                                                                                            </Badge>
                                                                                        </div>
                                                                                    ) : esSurtidoNina ? (
                                                                                        <div className="d-flex align-items-center gap-1.5">
                                                                                            <span className={`fw-bold text-dark ${modoTaller ? 'fs-5' : ''}`}>Surtido</span>
                                                                                            <Badge bg="danger" className="rounded-pill px-2 py-0.5">
                                                                                                <i className="fa-solid fa-venus me-1"></i> Niña
                                                                                            </Badge>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            {(() => {
                                                                                                const rawMotivo = inputStr.split('-')[1] || item.motivo || '1';
                                                                                                const num = parseInt(rawMotivo, 10);
                                                                                                const usaLetras = ['KCG', 'KCP', 'KCE', 'CC', 'KB', 'CB', 'CCON'].includes(categoria.toUpperCase());
                                                                                                const label = (usaLetras && !isNaN(num) && num >= 1 && num <= 26)
                                                                                                    ? `Modelo ${String.fromCharCode(64 + num)}`
                                                                                                    : `Motivo #${rawMotivo}`;
                                                                                                return (
                                                                                                    <span className={`fw-bold text-dark ${modoTaller ? 'fs-5' : ''}`}>
                                                                                                        {label}
                                                                                                    </span>
                                                                                                );
                                                                                            })()}
                                                                                            {item.genero !== undefined && (
                                                                                                <Badge
                                                                                                    bg={item.genero === '0' || item.genero === 0 ? 'primary' : 'danger'}
                                                                                                    className="rounded-pill px-2 py-0.5"
                                                                                                    style={{ fontSize: '0.68rem' }}
                                                                                                >
                                                                                                    <i className={`fa-solid ${item.genero === '0' || item.genero === 0 ? 'fa-mars' : 'fa-venus'} me-1`}></i>
                                                                                                    {item.genero === '0' || item.genero === 0 ? 'Niño' : 'Niña'}
                                                                                                </Badge>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}

                                                                            {item.codigo && (
                                                                                <small className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                                                                                    Cód: {item.codigo}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                {/* Talla */}
                                                                {(categoria === 'KCG' || categoria === 'GUANTES') && (
                                                                    <td className="text-center">
                                                                        {item?.talla === 't0' ? (
                                                                            <Badge bg="light" className="text-dark border rounded-pill px-2 py-1">
                                                                                Surtido
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge bg="secondary-subtle" className="text-dark border rounded-pill px-2.5 py-1 fw-bold">
                                                                                {capitalize(item?.talla || 'Única')}
                                                                            </Badge>
                                                                        )}
                                                                    </td>
                                                                )}

                                                                {/* Cantidad */}
                                                                <td className="text-center">
                                                                    <span
                                                                        className={`badge rounded-pill fw-bold ${
                                                                            modoTaller
                                                                                ? 'bg-primary text-white fs-5 px-3 py-1.5'
                                                                                : 'bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 fs-6'
                                                                        }`}
                                                                    >
                                                                        {cant}
                                                                    </span>
                                                                </td>

                                                                {/* Precios (Modo Administrativo / Comercial) */}
                                                                {!esPlanta && (
                                                                    <>
                                                                        <td className="text-end text-muted small">
                                                                            {formatearPrecio(precioU)}
                                                                        </td>
                                                                        <td className="text-end pe-3 fw-bold text-dark">
                                                                            {formatearPrecio(sub)}
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </Modal.Body>

                {/* Pie del Modal con Resumen de Cierre */}
                <Modal.Footer className="bg-white border-top py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted small">
                            Total Pedido: <strong className="text-dark">{resumenPedido.totalProductos} productos</strong> en <strong className="text-dark">{resumenPedido.totalCategorias} categorías</strong>
                        </span>
                        {!esPlanta && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fs-6 rounded-pill fw-bold">
                                Facturado: {formatearPrecio(resumenPedido.totalGeneral)}
                            </span>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Button variant="secondary" className="rounded-pill px-4 fw-bold shadow-xs" onClick={handleClose}>
                            Cerrar
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Modal Lightbox para Ampliar Imagen del Motivo */}
            {previewImage && (
                <Modal
                    show={!!previewImage}
                    onHide={() => setPreviewImage(null)}
                    centered
                    size="md"
                    contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
                >
                    <Modal.Header closeButton className="py-2.5 px-3 bg-light border-bottom">
                        <Modal.Title className="fs-6 fw-bold text-dark">
                            {previewImage.title || 'Vista Previa del Motivo'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-3 text-center bg-white">
                        <img
                            src={previewImage.src}
                            alt="Motivo ampliado"
                            className="img-fluid rounded-3 shadow-sm"
                            style={{ maxHeight: '75vh', width: 'auto' }}
                        />
                    </Modal.Body>
                    <Modal.Footer className="py-2 px-3 bg-light justify-content-center">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-pill px-4"
                            onClick={() => setPreviewImage(null)}
                        >
                            Cerrar Vista Previa
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};
