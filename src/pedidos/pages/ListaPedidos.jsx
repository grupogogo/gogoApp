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
                                } else if (cat.startsWith('K') || cat === 'CC' || cat === 'CB') {
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

                    <div className="row g-3 mb-4">
                        {/* 1. TOTAL FACTURACIÓN Y PEDIDOS */}
                        <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="p-2 bg-primary-subtle text-primary rounded-3">
                                    <i className="fas fa-clipboard-list fa-lg"></i>
                                </span>
                                <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                                    {totalPedidos} órdenes
                                </span>
                            </div>
                            <small className="text-muted fw-medium">Total Pedidos ({filtroAnio === 'todos' ? 'Todos' : filtroAnio})</small>
                            <h4 className="fw-bolder text-dark mb-1 mt-1">
                                {formatearPrecio(montoTotal)}
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                <i className="fas fa-box me-1 text-info"></i>{totalKits} kits • <i className="fas fa-hand-sparkles me-1 text-warning"></i>{totalGuantes} doc. guantes
                            </small>
                        </div>
                    </div>

                    {/* 2. EN PROCESO (PENDIENTES + PREPARADOS) */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="p-2 bg-warning-subtle text-warning rounded-3">
                                    <i className="fas fa-clock fa-lg"></i>
                                </span>
                                <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 small">
                                    Por Despachar
                                </span>
                            </div>
                            <small className="text-muted fw-medium">En Preparación / Pendientes</small>
                            <h4 className="fw-bolder text-dark mb-1 mt-1">
                                {pendientes + preparados} pedidos
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                <span className="badge bg-danger-subtle text-danger me-1">{pendientes} pendientes</span>
                                <span className="badge rounded-pill px-2 py-0" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>{preparados} preparados</span>
                            </small>
                        </div>
                    </div>

                    {/* 3. EN RUTA / ENVIADOS */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="p-2 bg-info-subtle text-info rounded-3">
                                    <i className="fas fa-truck-fast fa-lg"></i>
                                </span>
                                <span className="badge bg-info-subtle text-info rounded-pill px-2 py-1 small">
                                    En Ruta
                                </span>
                            </div>
                            <small className="text-muted fw-medium">Despachados con Guía</small>
                            <h4 className="fw-bolder text-dark mb-1 mt-1">
                                {enviados} pedidos
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Monitoreo y seguimiento en tránsito
                            </small>
                        </div>
                    </div>

                    {/* 4. COMPLETADOS (ENTREGADOS + PAGADOS) */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="p-2 bg-success-subtle text-success rounded-3">
                                    <i className="fas fa-circle-check fa-lg"></i>
                                </span>
                                <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                                    {totalPedidos > 0 ? Math.round((completados / totalPedidos) * 100) : 0}% efectividad
                                </span>
                            </div>
                            <small className="text-muted fw-medium">Entregados & Pagados</small>
                            <h4 className="fw-bolder text-dark mb-1 mt-1">
                                {completados} pedidos
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                <span className="badge bg-success-subtle text-success me-1">{entregados} entregados</span>
                                <span className="badge bg-primary-subtle text-primary">{pagados} pagados</span>
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
