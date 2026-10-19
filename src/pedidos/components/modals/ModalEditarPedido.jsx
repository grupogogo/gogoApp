import { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Row, Col } from 'react-bootstrap';
import { usePedidosStore, useFuntions } from '../../../hooks';
import Swal from 'sweetalert2';

export const ModalEditarPedido = ({ show, handleClose, pedido }) => {
    const { startUpdatePedidoItems } = usePedidosStore();
    const { formatearPrecio, buscarNombre, aTitulo, capitalize } = useFuntions();

    const [categoriasMap, setCategoriasMap] = useState({});
    const [infoPedido, setInfoPedido] = useState({
        formaPago: 'contado',
        tipoDespacho: 'envio',
        costoEnvio: 0,
        detalleGeneral: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (pedido) {
            // Cargar datos generales del pedido
            setInfoPedido({
                formaPago: pedido.formaPago || 'contado',
                tipoDespacho: pedido.tipoDespacho || 'envio',
                costoEnvio: Number(pedido.costoEnvio) || 0,
                detalleGeneral: pedido.detalleGeneral || '',
            });

            // Extraer la estructura de items del pedido
            if (pedido.itemPedido) {
                if (Array.isArray(pedido.itemPedido) && pedido.itemPedido.length > 0) {
                    const itemPedidoDoc = pedido.itemPedido[0];
                    const rawItems = itemPedidoDoc.itemPedido || itemPedidoDoc || {};
                    setCategoriasMap(JSON.parse(JSON.stringify(rawItems)));
                } else if (typeof pedido.itemPedido === 'object') {
                    const rawItems = pedido.itemPedido.itemPedido || pedido.itemPedido;
                    setCategoriasMap(JSON.parse(JSON.stringify(rawItems)));
                } else {
                    setCategoriasMap({});
                }
            } else {
                setCategoriasMap({});
            }
        }
    }, [pedido]);

    // Cambiar cantidad de un ítem
    const handleCantidadChange = (catKey, itemIdx, nuevaCantidad) => {
        const cant = Math.max(0, parseInt(nuevaCantidad, 10) || 0);
        setCategoriasMap(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (next[catKey]?.pedido?.[itemIdx]) {
                next[catKey].pedido[itemIdx].cantidad = cant;
            }
            return next;
        });
    };

    // Incrementar / decrementar cantidad
    const handleStepCantidad = (catKey, itemIdx, delta) => {
        setCategoriasMap(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (next[catKey]?.pedido?.[itemIdx]) {
                const actual = Number(next[catKey].pedido[itemIdx].cantidad) || 0;
                next[catKey].pedido[itemIdx].cantidad = Math.max(0, actual + delta);
            }
            return next;
        });
    };

    // Cambiar precio unitario de un ítem (si aplica)
    const handlePrecioChange = (catKey, itemIdx, nuevoPrecio) => {
        const precio = Math.max(0, parseFloat(nuevoPrecio) || 0);
        setCategoriasMap(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (next[catKey]?.pedido?.[itemIdx]) {
                if (next[catKey].pedido[itemIdx].precioUnitario !== undefined) {
                    next[catKey].pedido[itemIdx].precioUnitario = precio;
                }
                next[catKey].pedido[itemIdx].precio = precio;
            }
            return next;
        });
    };

    // Eliminar un ítem de la categoría
    const handleEliminarItem = (catKey, itemIdx, nombreItem) => {
        Swal.fire({
            title: '¿Quitar ítem?',
            text: `¿Deseas quitar "${nombreItem}" del pedido?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setCategoriasMap(prev => {
                    const next = JSON.parse(JSON.stringify(prev));
                    if (next[catKey]?.pedido) {
                        next[catKey].pedido.splice(itemIdx, 1);
                        // Si la categoría se queda sin items, se mantiene el array vacío
                    }
                    return next;
                });
            }
        });
    };

    // Manejo de cambios en datos generales
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setInfoPedido(prev => ({
            ...prev,
            [name]: name === 'costoEnvio' ? (parseFloat(value) || 0) : value
        }));
    };

    // Calcular totales en tiempo real
    let totalProductos = 0;
    let totalSubtotalProductos = 0;

    Object.values(categoriasMap).forEach(catData => {
        if (catData && Array.isArray(catData.pedido)) {
            catData.pedido.forEach(item => {
                const cant = Number(item.cantidad) || 0;
                const precio = Number(item.precioUnitario ?? item.precio) || 0;
                totalProductos += cant;
                totalSubtotalProductos += (cant * precio);
            });
        }
    });

    const costoEnvioNum = Number(infoPedido.costoEnvio) || 0;
    const granTotal = totalSubtotalProductos + costoEnvioNum;

    // Guardar cambios en el pedido
    const handleGuardar = async () => {
        if (pedido.estado !== 'pendiente') {
            Swal.fire({
                icon: 'error',
                title: 'No permitido',
                text: 'Solo se pueden modificar pedidos en estado pendiente.'
            });
            return;
        }

        const idMostrar = String(pedido.pedido_id || pedido._id || '').slice(-8).toUpperCase();
        const clienteNom = aTitulo(pedido.cliente?.nombre || 'Cliente');
        const clienteCiu = aTitulo(pedido.cliente?.ciudad || '');

        const confirm = await Swal.fire({
            title: '¿Guardar modificaciones del pedido?',
            html: `
                <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Remisión / Pedido</span>
                            <span style="font-family: monospace; font-weight: 800; font-size: 12px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 6px;">#${idMostrar}</span>
                        </div>
                        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
                            ${clienteNom}
                            ${clienteCiu ? `<span style="font-size: 12px; font-weight: 500; color: #64748b;"> • ${clienteCiu}</span>` : ''}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; font-size: 12px;">
                            <div>
                                <span style="color: #64748b; font-size: 11px;">Total Unidades:</span>
                                <div style="font-weight: 700; color: #0f172a;">${totalProductos} productos</div>
                            </div>
                            <div>
                                <span style="color: #64748b; font-size: 11px;">Nuevo Gran Total:</span>
                                <div style="font-weight: 800; color: #16a34a; font-size: 13px;">${formatearPrecio(granTotal)}</div>
                            </div>
                        </div>
                    </div>

                    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px 12px; border-radius: 8px;">
                        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #15803d; margin-bottom: 2px;">
                            📋 Impacto del Proceso
                        </div>
                        <div style="font-size: 12px; color: #166534; line-height: 1.4;">
                            Se actualizarán los productos, motivos, tallas y subtotales en la base de datos para este pedido.
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Sí, guardar cambios',
            cancelButtonText: 'Seguir revisando'
        });

        if (!confirm.isConfirmed) return;

        setIsSaving(true);
        const pedidoId = pedido.pedido_id || pedido._id || pedido.id;
        const res = await startUpdatePedidoItems(pedidoId, categoriasMap, infoPedido);
        setIsSaving(false);

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Pedido Actualizado!',
                html: `
                    <div style="text-align: center; font-size: 13px; color: #475569;">
                        <p style="margin: 0 0 8px 0;">Los cambios del pedido <strong style="color: #2563eb;">#${idMostrar}</strong> de <strong>${clienteNom}</strong> fueron guardados correctamente.</p>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; display: inline-block; margin-top: 4px;">
                            <strong>${totalProductos}</strong> unidades • Total: <strong style="color: #16a34a;">${formatearPrecio(granTotal)}</strong>
                        </div>
                    </div>
                `,
                timer: 2600,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Listo',
                showConfirmButton: false
            });
            handleClose();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                html: `
                    <div style="text-align: left; font-size: 13px; color: #475569;">
                        <p>No fue posible guardar las modificaciones del pedido <strong>#${idMostrar}</strong>.</p>
                        <div style="background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 8px; font-size: 12px; border: 1px solid #fca5a5;">
                            ${res.msg || 'Error de conexión con el servidor.'}
                        </div>
                    </div>
                `,
                confirmButtonColor: '#dc2626'
            });
        }
    };

    if (!pedido) return null;

    const clienteNombre = aTitulo(pedido.cliente?.nombre || 'Cliente');
    const clienteCiudad = aTitulo(pedido.cliente?.ciudad || 'Ciudad');
    const vendedorNombre = aTitulo(pedido.user?.name || 'Asesor');

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="xl"
            centered
            backdrop="static"
            keyboard={false}
            className="modal-fullscreen-lg-down"
        >
            <Modal.Header closeButton className="border-bottom bg-light py-3 px-4">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between w-100 gap-2 pe-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="p-2 bg-primary-subtle text-primary rounded-3">
                            <i className="fa-solid fa-pencil fa-lg"></i>
                        </span>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h5 className="mb-0 fw-bold text-dark">Editar Pedido</h5>
                                <span className="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace">
                                    #{(pedido.pedido_id || pedido._id).slice(-6).toUpperCase()}
                                </span>
                                <span className="badge bg-warning text-dark border border-warning-subtle rounded-pill px-3 py-1 fw-bold">
                                    <i className="fas fa-clock me-1"></i>Pendiente
                                </span>
                            </div>
                            <small className="text-muted">
                                {clienteNombre} • {clienteCiudad} • Vendedor: {vendedorNombre}
                            </small>
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-3 p-md-4 bg-light-subtle" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                {/* 1. INFORMACIÓN GENERAL Y LOGÍSTICA DEL PEDIDO */}
                <Card className="border border-light-subtle shadow-xs rounded-4 mb-4 bg-white">
                    <Card.Header className="bg-white border-bottom py-2 px-3">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-truck text-primary"></i>
                            <span className="fw-semibold text-dark small">Condiciones de Entrega y Pago</span>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-3">
                        <Row className="g-3">
                            <Col xs={12} sm={6} md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1">Forma de Pago</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        className="rounded-3"
                                        name="formaPago"
                                        value={infoPedido.formaPago}
                                        onChange={handleInfoChange}
                                    >
                                        <option value="contado">Contado</option>
                                        <option value="credito">Crédito</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="contraentrega">Contraentrega</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} sm={6} md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1">Tipo de Entrega</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        className="rounded-3"
                                        name="tipoDespacho"
                                        value={infoPedido.tipoDespacho}
                                        onChange={handleInfoChange}
                                    >
                                        <option value="envio">Despacho Nacional</option>
                                        <option value="urbano">Domicilio Urbano</option>
                                        <option value="recogida">Entrega en Planta</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} sm={6} md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1">Costo de Envío ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        size="sm"
                                        min="0"
                                        className="rounded-3 text-end"
                                        name="costoEnvio"
                                        value={infoPedido.costoEnvio}
                                        onChange={handleInfoChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col xs={12} sm={6} md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1">Observaciones / Detalle</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        className="rounded-3"
                                        placeholder="Ej: Despachar después de las 2pm"
                                        name="detalleGeneral"
                                        value={infoPedido.detalleGeneral}
                                        onChange={handleInfoChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* 2. PRODUCTOS POR CATEGORÍA */}
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <h6 className="fw-bold text-dark mb-0">
                        <i className="fas fa-boxes-stacked me-2 text-primary"></i>Productos del Pedido
                    </h6>
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1">
                        {totalProductos} productos en total
                    </span>
                </div>

                {Object.keys(categoriasMap).length === 0 ? (
                    <div className="card p-4 text-center text-muted rounded-4 bg-white border border-light-subtle">
                        <i className="fas fa-box-open fa-2x mb-2 text-secondary"></i>
                        <p className="mb-0">Este pedido no tiene categorías de productos registradas.</p>
                    </div>
                ) : (
                    Object.entries(categoriasMap).map(([catKey, catData]) => {
                        const itemsList = catData?.pedido || [];
                        const nombreCategoria = buscarNombre(catKey) || catKey;
                        const subtotalCat = itemsList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precioUnitario ?? it.precio) || 0)), 0);
                        const productosCat = itemsList.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);

                        return (
                            <Card key={catKey} className="border border-light-subtle shadow-xs rounded-4 mb-3 bg-white overflow-hidden">
                                <Card.Header className="bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-primary border fw-bold px-2 py-1">
                                            {catKey}
                                        </span>
                                        <strong className="text-dark">{nombreCategoria}</strong>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                                            {productosCat} unds
                                        </span>
                                        <span className="fw-bold text-dark small">
                                            Subtotal: {formatearPrecio(subtotalCat)}
                                        </span>
                                    </div>
                                </Card.Header>

                                <Card.Body className="p-0">
                                    {itemsList.length === 0 ? (
                                        <div className="p-3 text-center text-muted small">
                                            No hay productos en esta categoría.
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.85rem' }}>
                                                <thead className="table-light text-secondary">
                                                    <tr>
                                                        <th className="ps-3 py-2">Producto / Motivo</th>
                                                        <th className="text-center py-2">Talla / Detalle</th>
                                                        <th className="text-center py-2" style={{ width: '170px' }}>Cantidad</th>
                                                        <th className="text-end py-2" style={{ width: '130px' }}>Precio Unit.</th>
                                                        <th className="text-end py-2" style={{ width: '130px' }}>Subtotal</th>
                                                        <th className="text-center pe-3 py-2" style={{ width: '60px' }}>Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itemsList.map((item, idx) => {
                                                        const cant = Number(item.cantidad) || 0;
                                                        const precio = Number(item.precioUnitario ?? item.precio) || 0;
                                                        const subtotal = cant * precio;

                                                        // Formatear nombre del producto o motivo
                                                        const nombreItem = item.producto || item.motivo || item.nombre || item.nombreInput || 'Producto';
                                                        const tallaStr = item.talla ? ((item.talla === 't0') ? 'Surtido' : item.talla.toUpperCase()) : '—';
                                                        const generoStr = item.genero === '0' ? 'Niño' : item.genero === '1' ? 'Niña' : '';

                                                        return (
                                                            <tr key={idx} className={cant === 0 ? 'table-light text-muted opacity-75' : ''}>
                                                                <td className="ps-3 fw-medium text-dark">
                                                                    {nombreItem}
                                                                    {generoStr && (
                                                                        <span className={`badge ms-2 rounded-pill px-2 ${generoStr === 'Niño' ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                                            {generoStr}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="text-center text-secondary">
                                                                    <span className="badge bg-light text-dark border px-2 py-1">
                                                                        {tallaStr}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <div className="input-group input-group-sm justify-content-center" style={{ maxWidth: '140px', margin: '0 auto' }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary px-2"
                                                                            onClick={() => handleStepCantidad(catKey, idx, -1)}
                                                                            disabled={cant <= 0}
                                                                        >
                                                                            <i className="fas fa-minus fa-xs"></i>
                                                                        </button>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            className="form-control text-center fw-bold px-1"
                                                                            value={cant}
                                                                            onChange={(e) => handleCantidadChange(catKey, idx, e.target.value)}
                                                                            onFocus={(e) => e.target.select()}
                                                                            style={{ maxWidth: '60px' }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary px-2"
                                                                            onClick={() => handleStepCantidad(catKey, idx, 1)}
                                                                        >
                                                                            <i className="fas fa-plus fa-xs"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="text-end">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className="form-control form-control-sm text-end d-inline-block px-2"
                                                                        style={{ maxWidth: '110px' }}
                                                                        value={precio}
                                                                        onChange={(e) => handlePrecioChange(catKey, idx, e.target.value)}
                                                                        onFocus={(e) => e.target.select()}
                                                                    />
                                                                </td>
                                                                <td className="text-end fw-bold text-dark">
                                                                    {formatearPrecio(subtotal)}
                                                                </td>
                                                                <td className="text-center pe-3">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-light border text-danger rounded-circle p-1"
                                                                        style={{ width: '32px', height: '32px', fontSize: '0.92rem', lineHeight: '1' }}
                                                                        onClick={() => handleEliminarItem(catKey, idx, nombreItem)}
                                                                        title="Quitar este ítem"
                                                                    >
                                                                        <i className="fa fa-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        );
                    })
                )}
            </Modal.Body>

            <Modal.Footer className="border-top bg-white px-4 py-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    <div>
                        <small className="text-muted d-block">Productos Totales</small>
                        <span className="fw-bold text-dark fs-6">{totalProductos} unds</span>
                    </div>
                    <div className="vr"></div>
                    {costoEnvioNum > 0 && (
                        <>
                            <div>
                                <small className="text-muted d-block">Envío</small>
                                <span className="fw-semibold text-secondary small">{formatearPrecio(costoEnvioNum)}</span>
                            </div>
                            <div className="vr"></div>
                        </>
                    )}
                    <div>
                        <small className="text-muted d-block">Total Factura</small>
                        <span className="fw-bolder text-primary fs-5">{formatearPrecio(granTotal)}</span>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="light"
                        className="border rounded-pill px-4"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 shadow-xs d-flex align-items-center gap-2"
                        onClick={handleGuardar}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Guardando en BD...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check-circle"></i>
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};
