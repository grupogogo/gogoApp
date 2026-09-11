import React, { useMemo } from 'react';
import { Modal, Button, Row, Col, Badge, Card, Table } from 'react-bootstrap';
import { useFuntions } from '../../../hooks/useFuntions';

export const ModalCopiarPedido = ({ show, handleClose, pedido, clienteCompleto, onConfirmar }) => {
  const { formatearPrecio, aTitulo, capitalize, fechaCorta, limpiarFecha } = useFuntions();

  // Precios vigentes del cliente
  const preciosCliente = useMemo(() => {
    return clienteCompleto?.precios || pedido?.cliente?.precios || {};
  }, [clienteCompleto, pedido]);

  // Obtener precio actualizado de una categoría
  const obtenerPrecioActualizado = (catCode, item) => {
    const pKits = preciosCliente?.precioKits || {};
    const pCirios = preciosCliente?.precioCirios || {};
    const pGuantes = preciosCliente?.precioGuantes || {};

    const code = String(catCode || '').toUpperCase().trim();

    if (code === 'KCG') return Number(pKits.kcg) || Number(item.precioUnitario || item.precio) || 0;
    if (code === 'KCP') return Number(pKits.kcp) || Number(item.precioUnitario || item.precio) || 0;
    if (code === 'KCE') return Number(pKits.kce) || Number(item.precioUnitario || item.precio) || 0;
    if (code === 'KB') return Number(pKits.kb) || Number(item.precioUnitario || item.precio) || 0;
    if (code === 'CC') return Number(pCirios.cc) || Number(item.precioUnitario || item.precio) || 0;
    if (code === 'CB') return Number(pCirios.cb) || Number(item.precioUnitario || item.precio) || 0;

    if (code === 'GUANTES' || code === 'GUA') {
      const catG = String(item.categoria || '').toUpperCase().trim();
      if (catG.includes('BLANC')) return Number(pGuantes.gb) || Number(item.precioUnitario || item.precio) || 0;
      if (catG.includes('NEGR')) return Number(pGuantes.gn) || Number(item.precioUnitario || item.precio) || 0;
      if (catG.includes('MIT')) return Number(pGuantes.gm) || Number(item.precioUnitario || item.precio) || 0;
      return Number(pGuantes.gb) || Number(item.precioUnitario || item.precio) || 0;
    }

    // Para OTR u otros, mantiene su precio unitario o el del producto
    return Number(item.precioUnitario || item.precio) || 0;
  };

  // Resumen del pedido con precios actualizados
  const resumen = useMemo(() => {
    if (!pedido) return { categorias: [], totalOriginal: 0, totalActualizado: 0, totalProductos: 0 };

    let totalOrig = 0;
    let totalAct = 0;
    let totalProds = 0;
    const catList = [];

    let rawItems = {};
    if (pedido.itemPedido && Array.isArray(pedido.itemPedido) && pedido.itemPedido.length > 0) {
      const block = pedido.itemPedido[0];
      rawItems = block.itemPedido || block || {};
    } else if (pedido.itemPedido && typeof pedido.itemPedido === 'object') {
      rawItems = pedido.itemPedido.itemPedido || pedido.itemPedido || {};
    }

    const nombresCategorias = {
      'KCG': 'Kit Comunión Grande',
      'KCP': 'Kit Comunión Pequeño',
      'KCE': 'Kit Comunión Económico',
      'KB': 'Kit Bautizo',
      'CC': 'Cirio Comunión',
      'CB': 'Cirio Bautizo',
      'GUANTES': 'Guantes',
      'OTR': 'Otros Productos'
    };

    Object.entries(rawItems).forEach(([catKey, catData]) => {
      const items = catData?.pedido || [];
      if (!Array.isArray(items) || items.length === 0) return;

      let subOrig = 0;
      let subAct = 0;
      let qtyCat = 0;

      const itemsConPrecio = items.map(it => {
        const cant = parseInt(it.cantidad, 10) || 0;
        const pOrig = Number(it.precioUnitario || it.precio) || 0;
        const pAct = obtenerPrecioActualizado(catKey, it);

        subOrig += cant * pOrig;
        subAct += cant * pAct;
        qtyCat += cant;

        return {
          ...it,
          cantidad: cant,
          precioOriginal: pOrig,
          precioActualizado: pAct,
          subtotalOriginal: cant * pOrig,
          subtotalActualizado: cant * pAct
        };
      });

      totalOrig += subOrig;
      totalAct += subAct;
      totalProds += qtyCat;

      catList.push({
        key: catKey,
        nombre: nombresCategorias[catKey] || catKey,
        items: itemsConPrecio,
        cantidadTotal: qtyCat,
        subtotalOriginal: subOrig,
        subtotalActualizado: subAct,
        detalleGeneral: catData?.detalleGeneral || ''
      });
    });

    const costoEnvio = Number(pedido.costoEnvio) || 0;

    return {
      categorias: catList,
      totalOriginal: totalOrig + costoEnvio,
      totalActualizado: totalAct + costoEnvio,
      costoEnvio,
      totalProductos: totalProds
    };
  }, [pedido, preciosCliente]);

  if (!pedido) return null;

  const cliente = clienteCompleto || pedido.cliente || {};
  const refOriginal = (pedido.pedido_id || '').slice(-6).toUpperCase();

  const handleConfirmarCopia = () => {
    if (onConfirmar) {
      onConfirmar(pedido, resumen);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="bg-light border-bottom py-3">
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
          <div className="rounded-circle bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
            <i className="fa-solid fa-copy"></i>
          </div>
          <div>
            <span>Copiar Pedido a Nueva Orden</span>
            <div className="small text-muted fw-normal" style={{ fontSize: '0.8rem' }}>
              Duplicar el pedido <span className="badge bg-primary-subtle text-primary border border-primary-subtle">#{refOriginal}</span> con fecha de hoy
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4">
        {/* Banner Informativo */}
        <div className="alert alert-info border-0 rounded-3 shadow-xs mb-3 p-3" style={{ backgroundColor: '#f0fdf4', color: '#166534', borderLeft: '4px solid #16a34a' }}>
          <div className="d-flex align-items-start gap-2">
            <i className="fa-solid fa-circle-check fs-5 text-success mt-1"></i>
            <div>
              <div className="fw-bold mb-1">Copia con tarifas vigentes y fecha actualizada</div>
              <p className="mb-0 small text-secondary" style={{ lineHeight: 1.45 }}>
                Se precargarán todos los productos y cantidades de este pedido en la pantalla de <strong>Crear Pedido</strong>.
                Los precios unitarios se <strong>actualizan automáticamente a las tarifas que el cliente tiene configuradas en su tabla de clientes</strong> y la fecha se establece en el <strong>momento actual</strong>, quedando listo para guardar o ajustar.
              </p>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <Card className="border border-light-subtle rounded-3 mb-3 shadow-xs">
          <Card.Header className="bg-light bg-opacity-75 py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
            <span className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: '0.5px' }}>
              <i className="fa-solid fa-user-tag text-primary me-1"></i> Cliente Destinatario
            </span>
            <span className={`badge rounded-pill ${cliente.distribuidor ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
              {cliente.distribuidor ? 'Distribuidor' : 'Cliente Casual'}
            </span>
          </Card.Header>
          <Card.Body className="p-3">
            <Row className="g-2">
              <Col xs={12} sm={6}>
                <div className="fw-bold text-dark fs-6">{cliente.nombre || 'Sin nombre'}</div>
                <small className="text-muted d-block">
                  <i className="fa-solid fa-location-dot me-1"></i> {cliente.ciudad || 'Sin ciudad'}
                </small>
              </Col>
              <Col xs={12} sm={6} className="text-sm-end">
                {cliente.nitCC && (
                  <small className="text-muted d-block">
                    <strong>NIT/CC:</strong> {cliente.nitCC}
                  </small>
                )}
                {cliente.telefono && (
                  <small className="text-muted d-block">
                    <i className="fa-solid fa-phone me-1"></i> {cliente.telefono}
                  </small>
                )}
                {cliente.direccion && (
                  <small className="text-muted d-block text-truncate">
                    {cliente.direccion}
                  </small>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Desglose de Productos y Precios */}
        <Card className="border border-light-subtle rounded-3 mb-3 shadow-xs">
          <Card.Header className="bg-light bg-opacity-75 py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
            <span className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: '0.5px' }}>
              <i className="fa-solid fa-boxes-stacked text-primary me-1"></i> Resumen de Productos a Duplicar ({resumen.totalProductos} unds)
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
              {resumen.categorias.length} {resumen.categorias.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </Card.Header>
          <div className="table-responsive" style={{ maxHeight: '220px' }}>
            <Table hover size="sm" className="mb-0 align-middle small">
              <thead className="table-light text-secondary sticky-top">
                <tr>
                  <th className="ps-3">Categoría</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-end">Tarifa Cliente</th>
                  <th className="text-end pe-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {resumen.categorias.map(cat => (
                  <tr key={cat.key}>
                    <td className="ps-3 fw-medium">
                      <span className="badge bg-light text-dark border me-1" style={{ fontSize: '0.7rem' }}>
                        {cat.key}
                      </span>
                      {cat.nombre}
                      {cat.items.length > 1 && (
                        <span className="text-muted ms-1 small">({cat.items.length} refs)</span>
                      )}
                    </td>
                    <td className="text-center fw-bold text-primary">
                      {cat.cantidadTotal}
                    </td>
                    <td className="text-end text-muted">
                      {cat.items.length === 1
                        ? `$${formatearPrecio(cat.items[0].precioActualizado)}`
                        : 'Varios'
                      }
                    </td>
                    <td className="text-end pe-3 fw-bold text-dark">
                      ${formatearPrecio(cat.subtotalActualizado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Comparativa y Total */}
        <Row className="g-3">
          <Col xs={12} sm={6}>
            <div className="p-3 bg-light rounded-3 border h-100">
              <div className="small fw-bold text-secondary text-uppercase mb-2">
                <i className="fa-solid fa-truck-fast text-primary me-1"></i> Despacho y Pago
              </div>
              <div className="small text-muted mb-1">
                <strong>Tipo Despacho:</strong> {capitalize(pedido.tipoDespacho || 'punto')}
              </div>
              <div className="small text-muted mb-1">
                <strong>Forma de Pago:</strong> {capitalize(pedido.formaPago || 'credito')}
              </div>
              {resumen.costoEnvio > 0 && (
                <div className="small text-muted mb-1">
                  <strong>Flete / Despacho:</strong> ${formatearPrecio(resumen.costoEnvio)}
                </div>
              )}
              {pedido.detalleGeneral && (
                <div className="small text-muted text-truncate" title={pedido.detalleGeneral}>
                  <strong>Observación:</strong> {pedido.detalleGeneral}
                </div>
              )}
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 bg-success-subtle bg-opacity-25 rounded-3 border border-success-subtle h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted">Total pedido original:</span>
                  <span className="small text-muted text-decoration-line-through">
                    ${formatearPrecio(resumen.totalOriginal)}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="small fw-bold text-success text-uppercase">
                    Total con Tarifas Vigentes:
                  </span>
                  <span className="fs-4 fw-bold text-success">
                    ${formatearPrecio(resumen.totalActualizado)}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-top border-success-subtle small text-success-emphasis" style={{ fontSize: '0.75rem' }}>
                <i className="fa-regular fa-calendar-check me-1"></i> Fecha asignada: <strong>Hoy ({fechaCorta(new Date().toISOString())})</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top py-2 px-3 d-flex justify-content-between">
        <Button variant="light" className="border shadow-none rounded-pill px-3" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="success"
          className="rounded-pill px-4 fw-semibold shadow-sm d-flex align-items-center gap-2"
          onClick={handleConfirmarCopia}
          disabled={resumen.totalProductos <= 0}
        >
          <i className="fa-solid fa-copy"></i>
          <span>Confirmar y Copiar Pedido</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
