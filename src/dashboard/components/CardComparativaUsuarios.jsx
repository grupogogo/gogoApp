import React, { useState, useMemo } from 'react';
import { useAuthStore, useFuntions } from '../../hooks';

const UID_OSCAR = '679fce0ee8d1ed66d21d18c2';
const UID_LEONARDO = '6789ce1b48932f890985d1f7';
const UID_KAROL = '68cc3a0265f2a9ce640ba630';

export const CardComparativaUsuarios = ({
  pedidos = [],
  gastos = [],
  anioFiltro = new Date().getFullYear(),
}) => {
  const { user } = useAuthStore();
  const { formatearPrecio, convertirFecha } = useFuntions();
  const [seccionActiva, setSeccionActiva] = useState('todas'); // 'todas' | 'pagadas'

  // Identificar usuario activo
  const esLeonardo = user?.uid === UID_LEONARDO || (user?.name || '').toLowerCase().includes('leonardo');
  const esOscar = user?.uid === UID_OSCAR || (user?.name || '').toLowerCase().includes('oscar');
  const esKarol = user?.uid === UID_KAROL || (user?.name || '').toLowerCase().includes('karol') || (user?.email || '').toLowerCase().includes('karol');

  if (esKarol) return null;

  // Clasificador de ventas por categoría dentro de un pedido
  const clasificarVentasPedido = (pedido) => {
    let kits = 0;
    let guantes = 0;
    let otros = 0;

    if (!pedido?.itemPedido || !Array.isArray(pedido.itemPedido)) {
      return { kits, guantes, otros, total: 0 };
    }

    pedido.itemPedido.forEach(itemDoc => {
      const rawItems = itemDoc.itemPedido || itemDoc;
      Object.entries(rawItems || {}).forEach(([catKey, catVal]) => {
        const prodList = catVal?.pedido || [];
        const catUpper = (catKey || '').toUpperCase();
        const isKits = ['KCG', 'KCP', 'KB', 'CC', 'CB', 'KCE', 'K'].includes(catUpper);
        const isGuantesCat = catUpper === 'GUANTES' || catUpper.includes('GUANTE');

        prodList.forEach(prod => {
          const precio = Number(prod.precioUnitario ?? prod.precio ?? 0);
          const cant = Number(prod.cantidad ?? 0);
          const subtotal = precio * cant;
          const prodName = (prod.producto || prod.motivo || prod.nombreInput || '').toLowerCase();

          if (isKits) {
            kits += subtotal;
          } else if (isGuantesCat || prodName.includes('guante')) {
            guantes += subtotal;
          } else {
            otros += subtotal;
          }
        });
      });
    });

    return { kits, guantes, otros, total: kits + guantes + otros };
  };

  // Cálculos memorizados por usuario y categoría
  const metricas = useMemo(() => {
    const anioNum = parseInt(anioFiltro, 10);

    // 1. Filtrar pedidos por año y estado según la sección activa
    const pedidosFiltrados = (pedidos || []).filter(pedido => {
      if (!pedido.fechaCreacion) return false;
      const fecha = convertirFecha(pedido.fechaCreacion);
      if (fecha.getFullYear() !== anioNum) return false;
      if (pedido.estado === 'anulado') return false;

      if (seccionActiva === 'pagadas') {
        return pedido.estado === 'pagado';
      }
      return true;
    });

    // 2. Acumular ventas de Oscar
    let ventasOscarKits = 0;
    let ventasOscarGuantes = 0;
    let ventasOscarOtros = 0;
    let pedidosOscarCount = 0;

    // Acumular ventas de Leonardo
    let ventasLeoKits = 0;
    let ventasLeoGuantes = 0;
    let ventasLeoOtros = 0;
    let pedidosLeoCount = 0;

    let ventasKarolGuantes = 0;
    let ventasKarolKits = 0;

    pedidosFiltrados.forEach(pedido => {
      const userId = (pedido.user?._id || pedido.user)?.toString();
      const userName = (pedido.user?.name || '').toLowerCase();
      const userEmail = (pedido.user?.email || '').toLowerCase();
      const clienteStr = String(pedido.cliente?.nombre || pedido.cliente?.name || pedido.cliente || '').toUpperCase();
      const nitStr = String(pedido.cliente?.nitCC || pedido.cliente?.nit || pedido.nit || '');
      const esBrand = clienteStr.includes('BRAND DESIGN') || nitStr.includes('900879470');

      const esOscarUser = userId === UID_OSCAR || userName.includes('oscar') || (!userId && !esBrand && clienteStr);
      const esLeoUser = userId === UID_LEONARDO || userName.includes('leonardo') || (!userId && esBrand);
      const esKarolUser = userId === UID_KAROL || userName.includes('karol') || userEmail.includes('karol');

      const { kits, guantes, otros } = clasificarVentasPedido(pedido);

      if (esOscarUser) {
        ventasOscarKits += kits;
        ventasOscarGuantes += guantes;
        ventasOscarOtros += otros;
        pedidosOscarCount += 1;
      } else if (esLeoUser) {
        ventasLeoKits += kits;
        ventasLeoGuantes += guantes;
        ventasLeoOtros += otros;
        pedidosLeoCount += 1;
      } else if (esKarolUser) {
        // Regla: Ventas de Karol de KITS van a Leonardo (actúa como cliente de Leo)
        if (kits > 0) {
          ventasKarolKits += kits;
          ventasLeoKits += kits;
          pedidosLeoCount += 1;
        }
        // Regla: Guantes que venda Karol son de Oscar en el balance general
        if (guantes > 0) {
          ventasKarolGuantes += guantes;
          ventasOscarGuantes += guantes;
          pedidosOscarCount += 1;
        }
        if (otros > 0) {
          ventasLeoOtros += otros;
        }
      }
    });

    const ventasOscarTotal = ventasOscarKits + ventasOscarGuantes + ventasOscarOtros;
    const ventasLeoTotal = ventasLeoKits + ventasLeoOtros + ventasLeoGuantes + ventasKarolGuantes;

    // 3. Acumular gastos por usuario y categoría
    let gastosOscarKits = 0;
    let gastosOscarGuantes = 0;
    let gastosOscarOtros = 0;

    let gastosLeoKits = 0;

    (gastos || []).forEach(gasto => {
      if (!gasto.fecha) return;
      const fechaG = convertirFecha(gasto.fecha);
      if (fechaG.getFullYear() !== anioNum) return;

      const userId = (gasto.user?._id || gasto.user)?.toString();
      const userName = (gasto.user?.name || '').toLowerCase();
      const esOscarUser = userId === UID_OSCAR || userName.includes('oscar');
      const esLeoUser = userId === UID_LEONARDO || userName.includes('leonardo');
      const subtotal = (Number(gasto.precio) || 0) * (Number(gasto.cantidad) || 0);

      if (esOscarUser) {
        if (gasto.categoria === 'K') {
          gastosOscarKits += subtotal;
        } else if (gasto.categoria === 'G') {
          gastosOscarGuantes += subtotal;
        } else {
          gastosOscarOtros += subtotal;
        }
      } else if (esLeoUser) {
        // Regla estricta: Leonardo solo gastos de Kits
        if (gasto.categoria === 'K') {
          gastosLeoKits += subtotal;
        }
      }
    });

    const gastosOscarTotal = gastosOscarKits + gastosOscarGuantes + gastosOscarOtros;

    // Balances Oscar
    const balanceOscarKits = ventasOscarKits - gastosOscarKits;
    const balanceOscarGuantes = ventasOscarGuantes - gastosOscarGuantes;
    const balanceOscarTotal = ventasOscarTotal - gastosOscarTotal;

    // Balances Leonardo
    const balanceLeoKits = ventasLeoKits - gastosLeoKits;
    const balanceLeoTotal = ventasLeoTotal - gastosLeoKits;

    return {
      oscar: {
        pedidosCount: pedidosOscarCount,
        kits: {
          ventas: ventasOscarKits,
          gastos: gastosOscarKits,
          balance: balanceOscarKits,
          margen: ventasOscarKits > 0 ? Math.round((balanceOscarKits / ventasOscarKits) * 100) : 0,
        },
        guantes: {
          ventas: ventasOscarGuantes,
          gastos: gastosOscarGuantes,
          balance: balanceOscarGuantes,
          margen: ventasOscarGuantes > 0 ? Math.round((balanceOscarGuantes / ventasOscarGuantes) * 100) : 0,
        },
        guantesLeonardo: {
          ventas: ventasLeoGuantes,
        },
        total: {
          ventas: ventasOscarTotal,
          gastos: gastosOscarTotal,
          balance: balanceOscarTotal,
          margen: ventasOscarTotal > 0 ? Math.round((balanceOscarTotal / ventasOscarTotal) * 100) : 0,
        }
      },
      leonardo: {
        pedidosCount: pedidosLeoCount,
        kits: {
          ventas: ventasLeoKits,
          gastos: gastosLeoKits,
          balance: balanceLeoKits,
          margen: ventasLeoKits > 0 ? Math.round((balanceLeoKits / ventasLeoKits) * 100) : 0,
        },
        guantes: {
          ventasLeo: ventasLeoGuantes,
          ventasKarol: ventasKarolGuantes,
          total: ventasLeoGuantes + ventasKarolGuantes,
        },
        total: {
          ventas: ventasLeoTotal,
          gastos: gastosLeoKits,
          balance: balanceLeoTotal,
          margen: ventasLeoTotal > 0 ? Math.round((balanceLeoTotal / ventasLeoTotal) * 100) : 0,
        }
      }
    };
  }, [pedidos, gastos, anioFiltro, seccionActiva]);

  return (
    <div className="card border border-light-subtle shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
      {/* Header con Switch de Sección */}
      <div className="card-header bg-white border-bottom py-3 px-3 px-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="p-2 bg-primary-subtle text-primary rounded-3 shadow-xs">
              <i className="fas fa-scale-balanced fa-lg"></i>
            </span>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 fw-bold text-dark">
                  Comparativa Financiera: Ventas vs Gastos
                </h6>
                <span className="badge bg-light text-secondary border rounded-pill px-2 py-0" style={{ fontSize: '0.75rem' }}>
                  {anioFiltro}
                </span>
                {esLeonardo && (
                  <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2 py-0" style={{ fontSize: '0.72rem' }}>
                    <i className="fas fa-eye me-1"></i>Vista Kits
                  </span>
                )}
              </div>
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                {esLeonardo
                  ? 'Confrontación de la categoría Kits entre Oscar Gómez y Leonardo Gómez (incluye Kits de Karol Gómez como cliente)'
                  : 'Confrontación independiente por líneas de producto: Kits (Leo + Karol) y Guantes (Oscar + Karol)'}
              </small>
            </div>
          </div>

          {/* Selector de Sección */}
          <div className="bg-light p-1 rounded-pill border border-light-subtle d-inline-flex align-items-center shadow-xs">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                seccionActiva === 'todas'
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-light text-secondary border-0 bg-transparent'
              }`}
              style={{ fontSize: '0.8rem' }}
              onClick={() => setSeccionActiva('todas')}
            >
              <i className="fas fa-chart-line me-1"></i>
              Todas las Ventas
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                seccionActiva === 'pagadas'
                  ? 'btn-success text-white shadow-xs'
                  : 'btn-light text-secondary border-0 bg-transparent'
              }`}
              style={{ fontSize: '0.8rem' }}
              onClick={() => setSeccionActiva('pagadas')}
            >
              <i className="fas fa-check-double me-1"></i>
              Solo Pagados (Recaudo Real)
            </button>
          </div>
        </div>
      </div>

      {/* Cuerpo del Card */}
      <div className="card-body p-3 p-md-4">
        <div className="row g-3">
          {/* ============================================================ */}
          {/* 1. USUARIO OSCAR GÓMEZ */}
          {/* ============================================================ */}
          <div className="col-12 col-lg-6">
            <div className="card border border-light-subtle rounded-4 h-100 shadow-xs bg-white">
              <div className="card-header bg-light-subtle border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    OG
                  </span>
                  <div>
                    <strong className="text-dark d-block" style={{ fontSize: '0.88rem' }}>Oscar Gómez</strong>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>COLGUANTES GÓMEZ</span>
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1" style={{ fontSize: '0.74rem' }}>
                  {metricas.oscar.pedidosCount} {metricas.oscar.pedidosCount === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>

              <div className="card-body p-3 d-flex flex-column gap-3">
                {/* A. LÍNEA KITS (Siempre visible para Oscar y para Leonardo) */}
                <div className="p-3 rounded-3 bg-light border border-light-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark small d-flex align-items-center gap-1">
                      <i className="fas fa-box-open text-primary"></i>
                      Línea Kits
                    </span>
                    <span className={`badge rounded-pill px-2 py-0 ${metricas.oscar.kits.balance >= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`} style={{ fontSize: '0.72rem' }}>
                      {metricas.oscar.kits.margen}% margen
                    </span>
                  </div>

                  <div className="row g-2 text-center">
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Ventas Kits</small>
                        <span className="fw-bold text-dark small">{formatearPrecio(metricas.oscar.kits.ventas)}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Gastos Kits</small>
                        <span className="fw-bold text-danger small">{formatearPrecio(metricas.oscar.kits.gastos)}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Balance Kits</small>
                        <span className={`fw-bolder small ${metricas.oscar.kits.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatearPrecio(metricas.oscar.kits.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. LÍNEA GUANTES (SOLO VISIBLE PARA OSCAR, OCULTO PARA LEONARDO) */}
                {!esLeonardo ? (
                  <div className="p-3 rounded-3 bg-light border border-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-dark small d-flex align-items-center gap-1">
                        <i className="fas fa-hand-sparkles text-warning"></i>
                        Línea Guantes
                      </span>
                      <span className={`badge rounded-pill px-2 py-0 ${metricas.oscar.guantes.balance >= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`} style={{ fontSize: '0.72rem' }}>
                        {metricas.oscar.guantes.margen}% margen
                      </span>
                    </div>

                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <div className="p-2 rounded bg-white border border-light-subtle">
                          <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Ventas Guantes</small>
                          <span className="fw-bold text-dark small">{formatearPrecio(metricas.oscar.guantes.ventas)}</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 rounded bg-white border border-light-subtle">
                          <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Gastos Guantes</small>
                          <span className="fw-bold text-danger small">{formatearPrecio(metricas.oscar.guantes.gastos)}</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 rounded bg-white border border-light-subtle">
                          <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Balance Guantes</small>
                          <span className={`fw-bolder small ${metricas.oscar.guantes.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatearPrecio(metricas.oscar.guantes.balance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-center rounded-3 bg-light text-muted small border border-light-subtle" style={{ fontSize: '0.74rem' }}>
                    <i className="fas fa-lock me-1"></i>Información de Guantes reservada para el usuario Oscar.
                  </div>
                )}

                {/* Destacado especial para Oscar: Ventas Guantes de Leonardo */}
                {!esLeonardo && (
                  <div className="p-2.5 px-3 rounded-3 border border-warning-subtle bg-warning-subtle text-dark d-flex justify-content-between align-items-center">
                    <div>
                      <small className="fw-semibold d-block text-warning-emphasis" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-hand-sparkles text-warning me-1"></i>
                        Ventas Guantes Leonardo Gómez (GUANTES + OTR)
                      </small>
                      <strong className="text-dark small">
                        {formatearPrecio(metricas.oscar.guantesLeonardo.ventas)}
                      </strong>
                    </div>
                    <span className="badge bg-warning text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                      Ventas de Leo
                    </span>
                  </div>
                )}

                {/* C. CONSOLIDADO OSCAR (Si no es Leonardo, muestra el total de ambas líneas) */}
                {!esLeonardo && (
                  <div className="p-2 px-3 rounded-3 border d-flex justify-content-between align-items-center" style={{
                    backgroundColor: metricas.oscar.total.balance >= 0 ? '#f0fdf4' : '#fef2f2',
                    borderColor: metricas.oscar.total.balance >= 0 ? '#bbf7d0' : '#fecaca'
                  }}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                        Total Consolidado Oscar ({seccionActiva === 'pagadas' ? 'Cobrado' : 'Facturado'} - Gastos)
                      </small>
                      <strong className={`fs-6 ${metricas.oscar.total.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatearPrecio(metricas.oscar.total.balance)}
                      </strong>
                    </div>
                    <span className="badge bg-white text-dark border rounded-pill px-2 py-1 small">
                      {metricas.oscar.total.margen}% margen total
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. USUARIO LEONARDO GÓMEZ */}
          {/* ============================================================ */}
          <div className="col-12 col-lg-6">
            <div className="card border border-light-subtle rounded-4 h-100 shadow-xs bg-white">
              <div className="card-header bg-light-subtle border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    LG
                  </span>
                  <div>
                    <strong className="text-dark d-block" style={{ fontSize: '0.88rem' }}>Leonardo Gómez</strong>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>GRUPO COMERCIAL GOGO</span>
                  </div>
                </div>
                <span className="badge bg-info-subtle text-info rounded-pill px-2 py-1" style={{ fontSize: '0.74rem' }}>
                  {metricas.leonardo.pedidosCount} {metricas.leonardo.pedidosCount === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>

              <div className="card-body p-3 d-flex flex-column gap-3">
                {/* LÍNEA KITS DE LEONARDO */}
                <div className="p-3 rounded-3 bg-light border border-light-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark small d-flex align-items-center gap-1">
                      <i className="fas fa-box-open text-info"></i>
                      Línea Kits
                    </span>
                    <span className={`badge rounded-pill px-2 py-0 ${metricas.leonardo.kits.balance >= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`} style={{ fontSize: '0.72rem' }}>
                      {metricas.leonardo.kits.margen}% margen
                    </span>
                  </div>

                  <div className="row g-2 text-center">
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Ventas Kits</small>
                        <span className="fw-bold text-dark small">{formatearPrecio(metricas.leonardo.kits.ventas)}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Gastos Kits</small>
                        <span className="fw-bold text-danger small">{formatearPrecio(metricas.leonardo.kits.gastos)}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Balance Kits</small>
                        <span className={`fw-bolder small ${metricas.leonardo.kits.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatearPrecio(metricas.leonardo.kits.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LÍNEA GUANTES DE LEONARDO (Separado: Leo vs Karol, y Sumado) */}
                <div className="p-3 rounded-3 bg-light border border-light-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark small d-flex align-items-center gap-1">
                      <i className="fas fa-hand-sparkles text-warning"></i>
                      Línea Guantes (Leo & Karol)
                    </span>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2 py-0" style={{ fontSize: '0.72rem' }}>
                      Separado & Sumado
                    </span>
                  </div>

                  <div className="row g-2 text-center">
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Guantes Leo</small>
                        <span className="fw-bold text-dark small">{formatearPrecio(metricas.leonardo.guantes.ventasLeo)}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Guantes Karol</small>
                        <span className="fw-bold text-info small">{formatearPrecio(metricas.leonardo.guantes.ventasKarol)}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-white border border-light-subtle">
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Total Guantes</small>
                        <span className="fw-bolder text-warning small">
                          {formatearPrecio(metricas.leonardo.guantes.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informaciones adicionales / Resumen Leonardo */}
                <div className="p-3 rounded-3 border d-flex justify-content-between align-items-center mt-auto" style={{
                  backgroundColor: metricas.leonardo.total.balance >= 0 ? '#f0fdf4' : '#fef2f2',
                  borderColor: metricas.leonardo.total.balance >= 0 ? '#bbf7d0' : '#fecaca'
                }}>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                      Balance Total Leonardo ({seccionActiva === 'pagadas' ? 'Cobrado' : 'Facturado'} - Gastos Kits)
                    </small>
                    <strong className={`fs-5 ${metricas.leonardo.total.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatearPrecio(metricas.leonardo.total.balance)}
                    </strong>
                  </div>
                  <div className="text-end">
                    <span className={`badge rounded-pill px-2 py-1 ${metricas.leonardo.total.balance >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`} style={{ fontSize: '0.75rem' }}>
                      {metricas.leonardo.total.margen}% margen
                    </span>
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.68rem' }}>
                      Ventas: {formatearPrecio(metricas.leonardo.total.ventas)}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. BARRA CONSOLIDADA INFERIOR */}
        {/* ============================================================ */}
        <div className="mt-3 p-2 p-md-3 rounded-4 bg-light border border-light-subtle d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-circle-info text-primary"></i>
            <small className="text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>
              {esLeonardo
                ? `Consolidado Kits (${seccionActiva === 'pagadas' ? 'Cobros Efectivos' : 'Facturación Total'}):`
                : `Consolidado General (${seccionActiva === 'pagadas' ? 'Cobros Efectivos' : 'Facturación Total'}):`}
            </small>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-3" style={{ fontSize: '0.82rem' }}>
            <div>
              <span className="text-muted me-1">Ventas:</span>
              <strong className="text-dark">
                {formatearPrecio(
                  esLeonardo
                    ? (metricas.oscar.kits.ventas + metricas.leonardo.kits.ventas)
                    : (metricas.oscar.total.ventas + metricas.leonardo.total.ventas)
                )}
              </strong>
            </div>
            <div className="vr d-none d-sm-block"></div>
            <div>
              <span className="text-muted me-1">Gastos:</span>
              <strong className="text-danger">
                {formatearPrecio(
                  esLeonardo
                    ? (metricas.oscar.kits.gastos + metricas.leonardo.kits.gastos)
                    : (metricas.oscar.total.gastos + metricas.leonardo.total.gastos)
                )}
              </strong>
            </div>
            <div className="vr d-none d-sm-block"></div>
            <div>
              <span className="text-muted me-1">Balance:</span>
              <strong className={
                (esLeonardo
                  ? (metricas.oscar.kits.balance + metricas.leonardo.kits.balance)
                  : (metricas.oscar.total.balance + metricas.leonardo.total.balance)) >= 0 ? 'text-success' : 'text-danger'
              }>
                {formatearPrecio(
                  esLeonardo
                    ? (metricas.oscar.kits.balance + metricas.leonardo.kits.balance)
                    : (metricas.oscar.total.balance + metricas.leonardo.total.balance)
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
