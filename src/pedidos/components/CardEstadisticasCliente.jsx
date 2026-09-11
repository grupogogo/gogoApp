import React, { useMemo } from 'react';
import { useFuntions } from '../../hooks';

export const CardEstadisticasCliente = ({ cliente, pedidosActivo, todosPedidos = [] }) => {
  const { formatearPrecio, limpiarFecha, calcularTotalesPedidoCxC } = useFuntions();

  const stats = useMemo(() => {
    if (!cliente?.cliente_id) return null;
    const cid = cliente.cliente_id;
    const currentYearStr = new Date().getFullYear().toString();

    // Prefer pedidosActivo if available, or filter from all pedidos
    const lista = (pedidosActivo && pedidosActivo.length > 0)
      ? pedidosActivo
      : (todosPedidos || []).filter(p => {
          const c = p.cliente;
          if (!c) return false;
          return c === cid || c._id === cid || c.cliente_id === cid;
        });

    let totalFacturado = 0;
    let pedidosEsteAnio = 0;
    let pedidosPendientes = 0;
    let saldoPendiente = 0;
    let totalItems = 0;

    lista.forEach(p => {
      const calculos = calcularTotalesPedidoCxC ? calcularTotalesPedidoCxC(p) : null;
      const total = calculos?.total || 0;
      const items = calculos?.totalItems || 0;

      totalFacturado += total;
      totalItems += items;

      const fechaStr = p.fechaCreacion || '';
      if (fechaStr.includes(currentYearStr)) {
        pedidosEsteAnio++;
      }

      const estado = (p.estado || p.info?.estado || '').toLowerCase();
      const formaPago = (p.formaPago || p.info?.formaPago || '').toLowerCase();
      if (estado === 'pendiente' || (formaPago === 'credito' && estado !== 'pagado') || formaPago === 'alcobro') {
        pedidosPendientes++;
        saldoPendiente += total;
      }
    });

    const ticketPromedio = lista.length > 0 ? Math.round(totalFacturado / lista.length) : 0;
    const ultimoPedido = lista[0];
    const ultimoPedidoFecha = ultimoPedido?.fechaCreacion ? limpiarFecha(ultimoPedido.fechaCreacion) : 'Sin compras';
    const ultimoPedidoTotal = ultimoPedido && calcularTotalesPedidoCxC ? (calcularTotalesPedidoCxC(ultimoPedido)?.total || 0) : 0;

    return {
      totalPedidos: lista.length,
      pedidosEsteAnio,
      totalFacturado,
      ticketPromedio,
      pedidosPendientes,
      saldoPendiente,
      ultimoPedidoFecha,
      ultimoPedidoTotal,
      totalItems
    };
  }, [cliente, pedidosActivo, todosPedidos, calcularTotalesPedidoCxC, limpiarFecha]);

  if (!stats) return null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="row g-3 mb-4">
      {/* 1. Pedidos Realizados */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="p-2 bg-primary-subtle text-primary rounded-3">
              <i className="fa-solid fa-boxes-stacked fa-lg"></i>
            </span>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
              {stats.pedidosEsteAnio} en {currentYear}
            </span>
          </div>
          <small className="text-muted fw-medium">Historial de Compras</small>
          <h4 className="fw-bolder text-dark mb-0 mt-1">
            {stats.totalPedidos} <small className="fs-6 fw-normal text-muted">pedidos</small>
          </h4>
          <small className="text-muted mt-1 d-block" style={{ fontSize: '0.74rem' }}>
            Ticket prom: <strong className="text-dark">${formatearPrecio(stats.ticketPromedio)}</strong>
          </small>
        </div>
      </div>

      {/* 2. Total Facturado */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="p-2 bg-success-subtle text-success rounded-3">
              <i className="fa-solid fa-chart-line fa-lg"></i>
            </span>
            <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
              Acumulado
            </span>
          </div>
          <small className="text-muted fw-medium">Total Facturado</small>
          <h4 className="fw-bolder text-success mb-0 mt-1">
            ${formatearPrecio(stats.totalFacturado)}
          </h4>
          <small className="text-muted mt-1 d-block" style={{ fontSize: '0.74rem' }}>
            {stats.totalItems} artículos adquiridos
          </small>
        </div>
      </div>

      {/* 3. Estado de Cartera / Pendientes */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className={`p-2 rounded-3 ${stats.saldoPendiente > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary'}`}>
              <i className="fa-solid fa-hand-holding-dollar fa-lg"></i>
            </span>
            <span className={`badge rounded-pill px-2 py-1 small ${stats.saldoPendiente > 0 ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : 'bg-success-subtle text-success border border-success-subtle'}`}>
              {stats.saldoPendiente > 0 ? 'Con saldo pendiente' : 'Al día'}
            </span>
          </div>
          <small className="text-muted fw-medium">Cartera / Pendientes</small>
          <h4 className={`fw-bolder mb-0 mt-1 ${stats.saldoPendiente > 0 ? 'text-warning-emphasis' : 'text-dark'}`}>
            {stats.pedidosPendientes} <small className="fs-6 fw-normal text-muted">por cobrar</small>
          </h4>
          <small className="text-muted mt-1 d-block" style={{ fontSize: '0.74rem' }}>
            {stats.saldoPendiente > 0 ? (
              <span className="text-danger fw-semibold">Saldo: ${formatearPrecio(stats.saldoPendiente)}</span>
            ) : (
              <span className="text-success fw-medium"><i className="fa-solid fa-check me-1"></i>Sin saldos pendientes</span>
            )}
          </small>
        </div>
      </div>

      {/* 4. Última Compra y Perfil */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="p-2 bg-info-subtle text-info rounded-3">
              <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
            </span>
            <span className="badge bg-light text-secondary border rounded-pill px-2 py-1 small">
              {cliente.distribuidor ? 'Distribuidor' : 'Casual'}
            </span>
          </div>
          <small className="text-muted fw-medium">Última Compra</small>
          <h4 className="fw-bolder text-dark mb-0 mt-1 text-truncate" title={stats.ultimoPedidoFecha} style={{ fontSize: '1.05rem' }}>
            {stats.ultimoPedidoFecha}
          </h4>
          <small className="text-muted mt-1 d-block" style={{ fontSize: '0.74rem' }}>
            {stats.ultimoPedidoTotal > 0 ? `Total: $${formatearPrecio(stats.ultimoPedidoTotal)}` : 'Primer pedido a registrar'}
          </small>
        </div>
      </div>
    </div>
  );
};
