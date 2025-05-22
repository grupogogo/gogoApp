import { useFuntions } from "../../hooks";


export const Estadisticas = ({ totales, tipo, gastoUsuarios = 0  }) => {
    const { number_format } = useFuntions();
    const { formatearPrecio } = useFuntions();

    //console.log(gastoUsuarios)
    return (
        <>
            <div className="row">
                {(tipo === 1) && (
                    <>
                        {/* Earnings (Monthly) Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#4e73df" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                                                Ventas (Mensual)
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-primary text-light">
                                                    {formatearPrecio(totales.currentMonthSales)
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-calendar fa-2x text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Earnings (Anual) Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-success text-uppercase mb-1">
                                                Ventas en el año
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-success text-light">
                                                    {formatearPrecio(totales.totalSales)}</span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-success" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Orders Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "red" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                                                Pedidos pendientes
                                            </div>
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="h5 mb-0 fw-bold text-center">
                                                        <span className="badge text-bg-danger text-light">
                                                            {number_format((totales.pendientes / totales.totalOrders) * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar progress-bar-striped bg-danger"
                                                            role="progressbar"
                                                            style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}

                                                            aria-valuenow="50"
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        >{totales.pendientes}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-clipboard-list fa-2x text-danger" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Requests Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                                                pedidos durante el año
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-warning text-light">
                                                    {totales.totalOrders}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-list fa-2x text-warning" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {(tipo === 2) && (
                    <>
                        {/* Earnings (Monthly) Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#4e73df" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                                                Enviado
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-primary text-light">
                                                    {totales.enviado}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-calendar fa-2x text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Earnings (Anual) Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-success text-uppercase mb-1">
                                                Pagado
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-success text-light">
                                                    {totales.pagado}</span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-success" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Orders Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "red" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                                                Pedidos pendientes
                                            </div>
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="h5 mb-0 fw-bold text-center">
                                                        <span className="badge text-bg-danger text-light">
                                                            {totales.pendientes}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar progress-bar-striped bg-danger text-black"
                                                            role="progressbar"
                                                            style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}
                                                            aria-valuenow="50"
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-clipboard-list fa-2x text-danger" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Requests Card Example */}
                        <div className="col-xl-3 col-md-6 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                                                Pedidos realizados 2025
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center ">
                                                <span className="badge text-bg-warning text-light">
                                                    {totales.totalOrders}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-list fa-2x text-warning" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {(tipo === 3) && (
                    <>
                        {/* Earnings (Monthly) Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow py-2 border-primary text-center align-middle">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="fs-3 fw-bold text-primary text-uppercase">
                                                KCG {' '}
                                                <span className="badge text-bg-primary text-light">
                                                    {totales.enviado}
                                                </span>
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Earnings (Anual) Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-success text-uppercase mb-1">
                                                Pagado
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-success text-light">
                                                    {totales.pagado}</span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-success" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Orders Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "red" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                                                Pedidos pendientes
                                            </div>
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="h5 mb-0 fw-bold text-center">
                                                        <span className="badge text-bg-danger text-light">
                                                            {totales.pendientes}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar progress-bar-striped bg-danger text-black"
                                                            role="progressbar"
                                                            style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}
                                                            aria-valuenow="50"
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-clipboard-list fa-2x text-danger" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Requests Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                                                Pedidos realizados 2025
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center ">
                                                <span className="badge text-bg-warning text-light">
                                                    {totales.totalOrders}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-list fa-2x text-warning" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Earnings (Monthly) Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#4e73df" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                                                Enviado
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-primary text-light">
                                                    {totales.enviado}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-calendar fa-2x text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Earnings (Anual) Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#1cc88a" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-success text-uppercase mb-1">
                                                Pagado
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center">
                                                <span className="badge text-bg-success text-light">
                                                    {totales.pagado}</span>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-success" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Orders Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "red" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                                                Pedidos pendientes
                                            </div>
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="h5 mb-0 fw-bold text-center">
                                                        <span className="badge text-bg-danger text-light">
                                                            {totales.pendientes}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar progress-bar-striped bg-danger text-black"
                                                            role="progressbar"
                                                            style={{ width: `${(totales.pendientes / totales.totalOrders) * 100}%` }}
                                                            aria-valuenow="50"
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-clipboard-list fa-2x text-danger" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pending Requests Card Example */}
                        <div className="col-md-2 mb-4 col-6">
                            <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#f6c23e" }}>
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                                                Pedidos realizados 2025
                                            </div>
                                            <div className="h5 mb-0 fw-bold text-center ">
                                                <span className="badge text-bg-warning text-light">
                                                    {totales.totalOrders}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-list fa-2x text-warning" />
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
