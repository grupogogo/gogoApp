import { useEffect, useState, useMemo } from "react";
import { useAuthStore, useFuntions, usePedidosStore } from "../../hooks";
import { LayoutApp } from "../../layout/LayoutApp";
import { TablaPedidos } from "../components/TablaPedidos";
import { PanelAlistamientoPlanta } from "../components/planta/PanelAlistamientoPlanta";

export const ListaPedidos = () => {
    const { user } = useAuthStore();
    const { startLoadingPedidos, pedidos } = usePedidosStore();
    const { formatearPrecio, calcularTotalesPedidoCxC } = useFuntions();

    useEffect(() => {
        startLoadingPedidos();
    }, []);

    const anioActual = new Date().getFullYear();
    const aniosDisponibles = useMemo(() => {
        const list = [];
        for (let y = anioActual; y >= 2025; y--) {
            list.push(String(y));
        }
        return list;
    }, [anioActual]);

    const [filtroAnio, setFiltroAnio] = useState(String(anioActual));

    const extractYear = (p) => {
        const str = String(p.fechaCreacion || p.createdAt || '');
        const match = str.match(/\b(20\d\d)\b/);
        if (match) return match[1];
        try {
            const d = new Date(str);
            if (!isNaN(d.getFullYear())) return String(d.getFullYear());
        } catch (e) {}
        return null;
    };

    const esPlanta = String(user?.rol || '').toLowerCase().trim() === 'planta';

    // Filtrar pedidos según el rol del usuario (para planta solo pendientes de alistar)
    const pedidosUsuario = (pedidos || []).filter(p => {
        if (user.rol === 'vendedor') return p.user?._id === user.uid;
        if (esPlanta) return p.estado === 'pendiente';
        return true;
    });

    const pedidosAnio = pedidosUsuario.filter(p => {
        if (filtroAnio === 'todos') return true;
        const y = extractYear(p);
        return y ? y === filtroAnio : p.fechaCreacion && p.fechaCreacion.includes(filtroAnio);
    });

    const totalPedidos = pedidosAnio.length;
    const pendientes = pedidosAnio.filter(p => p.estado === 'pendiente').length;
    const preparados = pedidosAnio.filter(p => p.estado === 'preparado').length;
    const enviados = pedidosAnio.filter(p => p.estado === 'enviado').length;
    const entregados = pedidosAnio.filter(p => p.estado === 'entregado').length;
    const pagados = pedidosAnio.filter(p => p.estado === 'pagado').length;
    const completados = entregados + pagados;

    let montoTotal = 0;
    let totalKits = 0;
    let totalGuantes = 0;

    pedidosAnio.forEach(p => {
        const cxc = calcularTotalesPedidoCxC ? calcularTotalesPedidoCxC(p) : { total: 0 };
        montoTotal += Number(cxc.total || 0);

        if (p.itemPedido && Array.isArray(p.itemPedido)) {
            p.itemPedido.forEach(item => {
                if (item.itemPedido) {
                    Object.keys(item.itemPedido).forEach(cat => {
                        const catData = item.itemPedido[cat];
                        if (catData?.pedido && Array.isArray(catData.pedido)) {
                            catData.pedido.forEach(prod => {
                                const qty = parseInt(prod.cantidad) || 0;
                                if (cat === 'GUANTES' || (prod.producto && prod.producto.toLowerCase().includes('guante'))) {
                                    totalGuantes += qty;
                                } else if (cat.startsWith('K') || cat === 'CC' || cat === 'CB' || cat === 'CCON') {
                                    totalKits += qty;
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    return (
        <LayoutApp>
            <div className="container-fluid px-2 px-md-3 py-2">
                {/* TARJETAS DE ESTADÍSTICAS COMERCIALES (SOLO ADMIN Y VENDEDOR) */}
                {!esPlanta && (
                    <>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                            <h5 className="fw-bolder text-dark mb-0">Tablero de Pedidos</h5>
                            <small className="text-muted">Resumen estadístico y facturación comercial</small>
                        </div>
                        <div className="d-flex align-items-center gap-2 bg-white p-1.5 px-3 rounded-pill border shadow-xs">
                            <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                                <i className="fa-regular fa-calendar-days text-primary me-1"></i>Año:
                            </span>
                            <select
                                className="form-select form-select-sm border-0 bg-transparent fw-bold text-primary shadow-none py-0"
                                style={{ width: 'auto', cursor: 'pointer' }}
                                value={filtroAnio}
                                onChange={(e) => setFiltroAnio(e.target.value)}
                            >
                                {aniosDisponibles.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                                <option value="todos">Todos los años</option>
                            </select>
                        </div>
                    </div>

                    <div className="row g-2 g-md-3 mb-3 mb-md-4">
                        {/* 1. TOTAL FACTURACIÓN Y PEDIDOS */}
                        <div className="col-6 col-md-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-2.5 p-sm-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-1 mb-sm-2">
                                <span className="p-1.5 p-sm-2 bg-primary-subtle text-primary rounded-3">
                                    <i className="fas fa-clipboard-list"></i>
                                </span>
                                <span className="badge bg-primary-subtle text-primary rounded-pill px-1.5 px-sm-2 py-0.5 small" style={{ fontSize: '0.68rem' }}>
                                    {totalPedidos} ord.
                                </span>
                            </div>
                            <small className="text-muted fw-medium d-block text-truncate" style={{ fontSize: '0.72rem' }}>Total Pedidos ({filtroAnio === 'todos' ? 'Todos' : filtroAnio})</small>
                            <h5 className="fw-bolder text-dark mb-1 mt-1 fs-6 fs-sm-5">
                                {formatearPrecio(montoTotal)}
                            </h5>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                                <i className="fas fa-box me-1 text-info"></i>{totalKits}k • <i className="fas fa-hand-sparkles me-1 text-warning"></i>{totalGuantes}g
                            </small>
                        </div>
                    </div>

                    {/* 2. EN PROCESO (PENDIENTES + PREPARADOS) */}
                    <div className="col-6 col-md-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-2.5 p-sm-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-1 mb-sm-2">
                                <span className="p-1.5 p-sm-2 bg-warning-subtle text-warning rounded-3">
                                    <i className="fas fa-clock"></i>
                                </span>
                                <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-1.5 px-sm-2 py-0.5 small" style={{ fontSize: '0.68rem' }}>
                                    Despacho
                                </span>
                            </div>
                            <small className="text-muted fw-medium d-block text-truncate" style={{ fontSize: '0.72rem' }}>En Preparación</small>
                            <h5 className="fw-bolder text-dark mb-1 mt-1 fs-6 fs-sm-5">
                                {pendientes + preparados} pedidos
                            </h5>
                            <small className="text-muted d-flex gap-1 flex-wrap" style={{ fontSize: '0.68rem' }}>
                                <span className="badge bg-danger-subtle text-danger">{pendientes} pend.</span>
                                <span className="badge rounded-pill" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>{preparados} prep.</span>
                            </small>
                        </div>
                    </div>

                    {/* 3. EN RUTA / ENVIADOS */}
                    <div className="col-6 col-md-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-2.5 p-sm-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-1 mb-sm-2">
                                <span className="p-1.5 p-sm-2 bg-info-subtle text-info rounded-3">
                                    <i className="fas fa-truck-fast"></i>
                                </span>
                                <span className="badge bg-info-subtle text-info rounded-pill px-1.5 px-sm-2 py-0.5 small" style={{ fontSize: '0.68rem' }}>
                                    En Ruta
                                </span>
                            </div>
                            <small className="text-muted fw-medium d-block text-truncate" style={{ fontSize: '0.72rem' }}>Despachados / Guía</small>
                            <h5 className="fw-bolder text-dark mb-1 mt-1 fs-6 fs-sm-5">
                                {enviados} pedidos
                            </h5>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                                Seguimiento en tránsito
                            </small>
                        </div>
                    </div>

                    {/* 4. COMPLETADOS (ENTREGADOS + PAGADOS) */}
                    <div className="col-6 col-md-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-2.5 p-sm-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-1 mb-sm-2">
                                <span className="p-1.5 p-sm-2 bg-success-subtle text-success rounded-3">
                                    <i className="fas fa-circle-check"></i>
                                </span>
                                <span className="badge bg-success-subtle text-success rounded-pill px-1.5 px-sm-2 py-0.5 small" style={{ fontSize: '0.68rem' }}>
                                    {totalPedidos > 0 ? Math.round((completados / totalPedidos) * 100) : 0}% efec.
                                </span>
                            </div>
                            <small className="text-muted fw-medium d-block text-truncate" style={{ fontSize: '0.72rem' }}>Entregados & Pagados</small>
                            <h5 className="fw-bolder text-dark mb-1 mt-1 fs-6 fs-sm-5">
                                {completados} pedidos
                            </h5>
                            <small className="text-muted d-flex gap-1 flex-wrap" style={{ fontSize: '0.68rem' }}>
                                <span className="badge bg-success-subtle text-success">{entregados} entr.</span>
                                <span className="badge bg-primary-subtle text-primary">{pagados} pag.</span>
                            </small>
                        </div>
                    </div>
                </div>
                </>
                )}

                {/* VISTA DE ALISTAMIENTO CONSOLIDADAS PARA EL ROL DE PLANTA */}
                {esPlanta && (
                    <PanelAlistamientoPlanta pedidos={pedidosUsuario} />
                )}

                {/* TABLA PRINCIPAL DE PEDIDOS */}
                <div>
                    <TablaPedidos />
                </div>
            </div>
        </LayoutApp>
    );
};
