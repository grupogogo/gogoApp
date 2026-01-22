import { useFuntions } from "../../hooks";


export const Estadisticas = ({ totales, tipo, gastoUsuarios = 0 }) => {
    const { number_format } = useFuntions();
    const { formatearPrecio } = useFuntions();

    //console.log(gastoUsuarios)
    return (
        <>
            <div className="row">
                {(tipo === 1) && (
                    <>
                        {/* Ventas (Mensual) */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom border-primary" style={{ fontSize: "0.85rem" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Ventas (Mensual)</div>
                                            <div className="fw-bold text-primary">
                                                <span className="badge bg-primary text-light">
                                                    {formatearPrecio(totales.currentMonthSales)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-calendar fa-lg text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Ventas en el año */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Ventas en el año</div>
                                            <div className="fw-bold text-success">
                                                <span className="badge bg-success text-light">
                                                    {formatearPrecio(totales.totalSales)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-dollar-sign fa-lg text-success"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pedidos pendientes */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom border-danger" style={{ fontSize: "0.85rem" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small">Pedidos pendientes</div>

                                            
                                            <div className="d-flex align-items-center justify-content-between gap-2">
                                                <div className="fw-bold text-danger" style={{ whiteSpace: "nowrap" }}>
                                                    <span className="badge bg-danger text-light">
                                                        {number_format((totales.pendientes / totales.totalOrders) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="progress" style={{ height: "6px" }}>
                                                        <div
                                                            className="progress-bar progress-bar-striped bg-danger"
                                                            role="progressbar"
                                                            style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}
                                                            aria-valuenow={number_format((totales.pendientes / totales.totalOrders) * 100)}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div>
                                            <i className="fas fa-clipboard-list fa-lg text-danger"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pedidos durante el año */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Pedidos durante el año</div>
                                            <span className="badge bg-warning text-light">
                                                {totales.totalOrders}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {(tipo === 2) && (
                    <>
                        {/* Enviado */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom border-primary" style={{ fontSize: "0.85rem" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Enviado</div>
                                            <div className="fw-bold text-primary">
                                                <span className="badge bg-primary text-light">
                                                    {totales.enviado}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-calendar fa-lg text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pagado */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Pagado</div>
                                            <div className="fw-bold text-success">
                                                <span className="badge bg-success text-light">
                                                    {totales.pagado}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-dollar-sign fa-lg text-success"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pedidos pendientes */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "red" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Pedidos pendientes</div>
                                            <div className="fw-bold text-danger">
                                                <span className="badge bg-danger text-light">
                                                    {totales.pendientes}
                                                </span>
                                            </div>
                                            <div className="progress mt-1" style={{ height: "6px" }}>
                                                <div
                                                    className="progress-bar progress-bar-striped bg-danger"
                                                    role="progressbar"
                                                    style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}
                                                    aria-valuenow={number_format((totales.pendientes / totales.totalOrders) * 100)}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-clipboard-list fa-lg text-danger"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pedidos realizados 2025 */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Pedidos realizados 2025</div>
                                            <div className="fw-bold text-warning">
                                                <span className="badge bg-warning text-light">
                                                    {totales.totalOrders}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-list fa-lg text-warning"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {(tipo === 3) && (
                    <>
                        {/* KCG */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom border-primary" style={{ fontSize: "0.85rem" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">KCG</div>
                                            <div className="fw-bold text-primary">
                                                <span className="badge bg-primary text-light">
                                                    {totales.enviado}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-calendar fa-lg text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pagado */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Pagado</div>
                                            <div className="fw-bold text-success">
                                                <span className="badge bg-success text-light">
                                                    {totales.pagado}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-dollar-sign fa-lg text-success"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pedidos pendientes */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3">
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "red" }}>
                                <div className="card-body"></div>
                                <div className="d-flex align-items-center justify-content-between"></div>
                                <div>
                                    <div className="text-muted small mb-1">Pedidos pendientes</div>
                                    <div className="fw-bold text-danger">
                                        <span className="badge bg-danger text-light">
                                            {totales.pendientes}
                                        </span>
                                    </div>
                                    <div className="progress mt-1" style={{ height: "6px" }}>
                                        <div
                                            className="progress-bar progress-bar-striped bg-danger"
                                            role="progressbar"
                                            style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}
                                            aria-valuenow={number_format((totales.pendientes / totales.totalOrders) * 100)}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <i className="fas fa-clipboard-list fa-lg text-danger"></i>
                                </div>
                            </div>
                        </div>

                        {/* Pedidos realizados 2025 */}
                        <div className="col-6 col-md-6 col-xl-3 mb-3" >
                            <div className="card shadow-sm border-start-custom" style={{ fontSize: "0.85rem", borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small mb-1">Pedidos realizados 2025</div>
                                            <div className="fw-bold text-warning">
                                                <span className="badge bg-warning text-light">
                                                    {totales.totalOrders}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-list fa-lg text-warning"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
export default Estadisticas;
