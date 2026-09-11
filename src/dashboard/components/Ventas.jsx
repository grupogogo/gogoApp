import { useEffect, useState } from "react";
import { useFuntions, usePedidosStore } from "../../hooks";
import { AreaChart, BarChart, PieChart, PieChartGastosUsuarios } from "../js";
import { useSelector } from "react-redux";
import { useGastosStore } from "../../hooks/useGastosStore";
import { TablaClientes } from "../../clients/components/TablaClientes";
import { TablaOtros } from "./TablaOtros";
import { KpiGrid } from "./KpiGrid";


export const Ventas = ({ datosUsuario }) => {

  const { startLoadingPedidos } = usePedidosStore();
  const user = useSelector(state => state.auth)
  const gastos = useSelector(state => state.gastos.gastos);
  const pedidos = useSelector(state => state.pedidos.pedidos);
  const [pedidosUsuario, setPedidosUsuario] = useState([]);

  useEffect(() => {
    if (pedidos && user.user.uid) {
      const filteredPedidos = pedidos.filter(pedido => pedido.user._id === user.user.uid);
      setPedidosUsuario(filteredPedidos);
    }
  }, [pedidos, user.user.uid]);
  const [filtroCategoria, setFiltroCategoria] = useState('KCG');
  const { startLoadingGastos } = useGastosStore();
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [vistaKpi, setVistaKpi] = useState(true);
  const oldOrders = useSelector(state => state.pedidos.oldOrders) || [];
  const { startLoadingOldOrders } = usePedidosStore();
  const [ventasOtros, setVentasOtros] = useState([]);
  const { buscarPrecioxCategoriaAnio } = useFuntions();

  const [dashboardState, setDashboardState] = useState({
    lablesKits: [],
    lablesGuantes: [],
    dataKits: [],
    dataGuantes: [],
    lablesOtros: [],
    dataOtros: [],
    lablesTodos: [],
    dataTodos: [],
    totalxAnio: [],
    TotalesCurrentYearKits: [],
    totalCategoriaxAnio: [],
    totales: [],
    totalesPorCategoria: [],
    totalSalesKits: 0,
    gastosTotalesKits: [],
    gastosTotalesGuantes: [],
    gastosMensuales: [],
    totalGastosAnual: 0,
  });

  const busquedaPorCategoria = (e) => {
    setFiltroCategoria(e.target.value);
  };
  // Actualizador parcial del estado
  const updateDashboardState = (updates) => {
    setDashboardState(prev => ({ ...prev, ...updates }));
  };

  const cargarPedidos = async () => {
    await startLoadingPedidos();
  }

  // Cargar datos
  useEffect(() => {
    startLoadingOldOrders();
    startLoadingOldOrders();
    cargarPedidos();
    startLoadingGastos();
  }, []);

  const {
    calcularTotalesPedidos,
    totalesPedidos,
    totalesPedidosAnuales,
    totalesPedidosAnualesPorCategoria,
    buscarNombre,
    totalKitsXAnio,
    number_format,
    formatearPrecio,
    totalOtrosXAnio,
    totalGuantesXAnio,
    mensualGastos,
    totalGastosUsuarios,
    totalizarPreciosFabrica,
    convertirFecha,
    aTitulo,
    esOscar,
    esLeonardo,
    esKarol
  } = useFuntions();

  // Procesar pedidos y gastos cuando llegan o cambian los filtros
  useEffect(() => {
    let pedidosUpdates = {};

    if (pedidos !== undefined && pedidos.length > 0) {
      const { monthlySales, totalSales } = totalKitsXAnio(pedidos, datosUsuario, anioFiltro);
      const {
        monthlySales: monthlyGuantes,
        totalSales: totalSalesGuantes,
        totalSalesLeo,
        totalSalesKarol,
        totalSalesGuantesLeo,
        unidadesLeo,
        unidadesKarol,
        unidadesGuantesLeo,
        monthlySalesLeo,
        monthlySalesKarol,
        monthlySalesGuantesLeo
      } = totalGuantesXAnio(pedidos, datosUsuario, anioFiltro);
      const { monthlySales: monthlyOtros, totalSales: totalSalesOtros } = totalOtrosXAnio(pedidos, datosUsuario, anioFiltro);

      let dataKits = [], lablesKits = [];
      let dataGuantes = [], lablesGuantes = [];
      let dataOtros = [], lablesOtros = [];
      let dataTodos = [], lablesTodos = [];

      calcularTotalesPedidos('kits', pedidos, (data) => { dataKits = data; }, (labels) => { lablesKits = labels; }, datosUsuario, anioFiltro);
      const detallesGuantes = calcularTotalesPedidos('guantes', pedidos, (data) => { dataGuantes = data; }, (labels) => { lablesGuantes = labels; }, datosUsuario, anioFiltro);
      calcularTotalesPedidos('otros', pedidos, (data) => { dataOtros = data; }, (labels) => { lablesOtros = labels; }, datosUsuario, anioFiltro);
      const totalesPorCategoria = calcularTotalesPedidos('todos', pedidos, (data) => { dataTodos = data; }, (labels) => { lablesTodos = labels; }, datosUsuario, anioFiltro);

      const otrosItems = calcularTotalesPedidos('otros', pedidos, null, null, datosUsuario, anioFiltro);
      setVentasOtros(otrosItems);

      pedidosUpdates = {
        totales: totalesPedidos(pedidos, datosUsuario, anioFiltro),
        totalxAnio: totalesPedidosAnuales(pedidos, datosUsuario, anioFiltro),
        monthlySales,
        totalSalesKits: totalSales,
        monthlyGuantes,
        totalSalesGuantes,
        totalSalesLeo,
        totalSalesKarol,
        totalSalesGuantesLeo,
        unidadesLeo,
        unidadesKarol,
        unidadesGuantesLeo,
        monthlySalesLeo,
        monthlySalesKarol,
        monthlySalesGuantesLeo,
        monthlyOtros,
        totalSalesOtros,
        dataKits,
        lablesKits,
        dataGuantes,
        lablesGuantes,
        detallesGuantes,
        dataOtros,
        lablesOtros,
        dataTodos,
        lablesTodos,
        totalesPorCategoria
      };
    }

    let gastosUpdates = {};

    if (gastos && gastos.length > 0) {
      const categoriaKits = 'K';
      const categoriaGuantes = 'G';
      const gastosTotalesKits = mensualGastos(gastos, anioFiltro, categoriaKits);
      const gastosTotalesGuantes = mensualGastos(gastos, anioFiltro, categoriaGuantes);
      const gastosXusuario = totalGastosUsuarios(gastos, anioFiltro, datosUsuario, 'K');

      // CÁLCULO DE GASTOS MENSUALES
      const gastosMensuales = Array(12).fill(0);
      let totalGastosAnual = 0;

      gastos.forEach(gasto => {
        const fechaGasto = convertirFecha(gasto.fecha);
        const anio = fechaGasto.getFullYear();

        if (anio === anioFiltro) {
          const gastoUserId = (gasto.user?._id || gasto.user)?.toString();
          if (!datosUsuario && gastoUserId !== user.user.uid) return;

          // En los gastos de Leonardo ('6789ce1b48932f890985d1f7'), solamente ver lo referente a categoría KITS ('K')
          if (gastoUserId === '6789ce1b48932f890985d1f7' && gasto.categoria !== 'K') return;

          const mes = fechaGasto.getMonth();
          const total = (Number(gasto.precio) || 0) * (Number(gasto.cantidad) || 0);
          gastosMensuales[mes] += total;
          totalGastosAnual += total;
        }
      });

      gastosUpdates = {
        gastosTotalesKits,
        gastosTotalesGuantes,
        gastosXusuario: gastosXusuario.data || gastosXusuario,
        gastosLabels: gastosXusuario.labels || (datosUsuario ? ['OG', 'LG'] : ['KITS', 'GUANTES']),
        gastosTitle: gastosXusuario.title || `GASTOS KITS: ${formatearPrecio(gastosXusuario.totalGastos || 0)}`,
        gastosMensuales,
        totalGastosAnual
      };
    }

    updateDashboardState({
      ...pedidosUpdates,
      ...gastosUpdates
    });

  }, [pedidos, datosUsuario, gastos, anioFiltro]);

  // Cambio de categoría
  useEffect(() => { //Llena el barchar final del dashboard
    if (pedidos.length > 0) {
      updateDashboardState({
        totalCategoriaxAnio: totalesPedidosAnualesPorCategoria(pedidos, datosUsuario, filtroCategoria),
      });
    }
    //console.log(dashboardState.totalesPorCategoria);

  }, [datosUsuario, filtroCategoria, anioFiltro]);

  return (
    <>
      <div className="row align-items-center mb-3">
        <div className="col-12 col-md-6 d-flex align-items-center gap-2">
          <div className="input-group form-select-sm d-flex align-items-center">
            <span className='me-2 fw-semibold text-secondary'>Año a filtrar:</span>
            <select
              className="form-select form-select-sm shadow-xs rounded-2"
              title="Filtro por año"
              style={{ maxWidth: 'fit-content' }}
              value={anioFiltro}
              onChange={e => {
                setAnioFiltro(parseInt(e.target.value));
              }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2017">2017</option>
            </select>
          </div>
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-md-end mt-2 mt-md-0">
          <div className="btn-group btn-group-sm shadow-xs rounded-3 p-1 bg-white border" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-2 fw-semibold ${vistaKpi ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
              onClick={() => setVistaKpi(true)}
            >
              <i className="fas fa-th-large me-1"></i> Tarjetas KPI
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-2 fw-semibold ${!vistaKpi ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
              onClick={() => setVistaKpi(false)}
            >
              <i className="fas fa-chart-pie me-1"></i> Gráficos
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN SUPERIOR: VISTA KPI (RECOMENDADA) O VISTA GRÁFICOS CIRCULARES */}
      {vistaKpi ? (
        <KpiGrid
          dashboardState={dashboardState}
          datosUsuario={datosUsuario}
          anioFiltro={anioFiltro}
          userRole={user.user.rol}
          userName={user.user.name}
          userUid={user.user.uid}
        />
      ) : (
      /* PIECHARTS */
      <div className="row g-3 mb-4">
        {/* GENERAL */}
        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="card card-hover border-0 shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-gray m-3">General</h6>
            </div>
            <div className="card-body p-1">
              <PieChart
                arrayLabels={dashboardState.lablesTodos}
                arrayData={dashboardState.dataTodos}
                title={`${formatearPrecio(dashboardState.totales.totalSales)}`}
              />
            </div>
          </div>
        </div>
        {/* KITS */}
        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="card card-hover border-0 shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-gray m-3">Venta Kits</h6>
            </div>
            <div className="card-body p-1">
              <PieChart
                arrayLabels={dashboardState.lablesKits}
                arrayData={dashboardState.dataKits}
                title={`${formatearPrecio(dashboardState.totalSalesKits)} | fabrica: ${formatearPrecio(totalizarPreciosFabrica(dashboardState.lablesKits, dashboardState.dataKits))}`}
                anio={anioFiltro}
              />
            </div>
          </div>
        </div>
        {/* GUANTES */}
        <div className="col-xl-3 col-lg-4 col-md-6">
          <div className="card card-hover border-0 shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-gray m-3">Venta Guantes</h6>
            </div>
            <div className="card-body p-1">
              <PieChart
                arrayLabels={dashboardState.lablesGuantes}
                arrayData={dashboardState.dataGuantes}
                title={`GUANTES ${formatearPrecio(dashboardState.totalSalesGuantes)}`}
              />
            </div>
          </div>
        </div>
        {/* OTROS */}
        <div className="col-xl-3 col-lg-4 col-md-6">
          <div className="card card-hover border-0 shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-gray m-3">Venta Otros</h6>
            </div>
            <div className="card-body p-1">
              <PieChart
                arrayLabels={dashboardState.lablesOtros}
                arrayData={dashboardState.dataOtros}
                title={`OTROS ${formatearPrecio(dashboardState.totalSalesOtros)}`}
              />
            </div>
          </div>
        </div>
        {/* GASTOS KITS */}
        {(user.user.rol === 'admin' || user.user.rol === 'superAdmin') && (
          <>
            <div className="col-xl-6 col-lg-4 col-md-12">
              <div className="card card-hover border-0 shadow-lg">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-gray m-3">
                    {!datosUsuario ? `Gastos ${user.user.name || 'Usuario'}` : 'Gastos Kits (OG / LG)'}
                  </h6>
                </div>
                <div className="card-body p-1">
                  <PieChartGastosUsuarios
                    arrayLabels={dashboardState.gastosLabels && dashboardState.gastosLabels.length > 0 ? dashboardState.gastosLabels : (datosUsuario ? ['OG', 'LG'] : ['KITS', 'GUANTES'])}
                    arrayData={dashboardState.gastosXusuario}
                    title={dashboardState.gastosTitle || `GASTOS KITS: ${formatearPrecio(dashboardState.gastosXusuario?.[0] || 0)}`}
                    gastosXusuario={dashboardState.gastosXusuario}
                  />
                </div>
              </div>
            </div>
          </>

        )}
        {(user.user.rol === 'vendedor') && (
          <>
            <div className="col-xl-6 col-lg-4 col-md-12">
              <div className="card card-hover border-0 shadow-lg">
                <div className="card-body p-1">
                  <TablaOtros ventasOtros={ventasOtros} pedidosUsuario={pedidosUsuario} />
                </div>
              </div>
            </div>
          </>
        )}

      </div>
      )}
      {/* AREA CHARTS */}
      <div className="row g-3 mb-4">
        {/* EXPENSES AREA CHART */}
        <div className="col-12">
          <div className="card border border-light-subtle shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 bg-danger-subtle text-danger rounded-3">
                  <i className="fas fa-file-invoice-dollar"></i>
                </span>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Gastos Operativos Mensuales</h6>
                  <small className="text-muted">Evolución de gastos año {anioFiltro}</small>
                </div>
              </div>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-bold">
                Total Gastos: {formatearPrecio(dashboardState.totalGastosAnual)}
              </span>
            </div>
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState.gastosTotalesKits} anioFiltro={anioFiltro} tipo={5} />
              </div>
            </div>
          </div>
        </div>

        {/* GENERAL */}
        <div className="col-md-6 col-12">
          <div className="card border border-light-subtle shadow-sm rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 bg-primary-subtle text-primary rounded-3">
                  <i className="fas fa-chart-line"></i>
                </span>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Ventas Generales</h6>
                  <small className="text-muted">Facturación mensual consolidada</small>
                </div>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold">
                {formatearPrecio(dashboardState.totales?.totalSales || 0)}
              </span>
            </div>
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState.totalxAnio} anioFiltro={anioFiltro} tipo={0} />
              </div>
            </div>
          </div>
        </div>

        {/* KITS */}
        <div className="col-md-6 col-12">
          <div className="card border border-light-subtle shadow-sm rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 bg-info-subtle text-info rounded-3">
                  <i className="fas fa-box-open"></i>
                </span>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Venta de Kits</h6>
                  <small className="text-muted">Comportamiento mensual de kits</small>
                </div>
              </div>
              <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2 rounded-pill fw-bold">
                {formatearPrecio(dashboardState.totalSalesKits)}
              </span>
            </div>
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState} anioFiltro={anioFiltro} tipo={0} />
              </div>
            </div>
          </div>
        </div>

        {/* GUANTES */}
        <div className="col-md-6 col-12">
          <div className="card border border-light-subtle shadow-sm rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 bg-warning-subtle text-warning rounded-3">
                  <i className="fas fa-hand-sparkles"></i>
                </span>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Venta de Guantes</h6>
                  <small className="text-muted">
                    {esLeonardo ? 'Comportamiento mensual (Leonardo + Karol Gómez)' : 'Comportamiento mensual de guantes'}
                  </small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {esLeonardo && (
                  <div className="d-flex gap-1">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill small">
                      Leo: {formatearPrecio(dashboardState.totalSalesLeo || 0)}
                    </span>
                    <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill small">
                      Karol: {formatearPrecio(dashboardState.totalSalesKarol || 0)}
                    </span>
                  </div>
                )}
                {esOscar && dashboardState.totalSalesGuantesLeo > 0 && (
                  <span className="badge bg-warning-subtle text-dark border border-warning px-2 py-1 rounded-pill small" title="Ventas de guantes de Leonardo Gómez (GUANTES + OTR)">
                    Guantes Leo: {formatearPrecio(dashboardState.totalSalesGuantesLeo)}
                  </span>
                )}
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill fw-bold">
                  {formatearPrecio(dashboardState.totalSalesGuantes)}
                </span>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState.monthlyGuantes} anioFiltro={anioFiltro} tipo={3} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Area charts por categorías */}
      {pedidos && (
        <div className="row g-3 mb-4">
          <div className="col-12 mt-2 mb-1">
            <h5 className="fw-bold text-dark mb-1">
              <i className="fas fa-layer-group me-2 text-primary"></i>Tendencia Mensual por Producto
            </h5>
            <p className="text-muted small mb-0">Evolución en unidades y valor proyectado por categoría</p>
          </div>
          {[
            'KCG',
            'KCP',
            'KCE',
            'KB',
            'CC',
            'CB',
            'GUANTES-BLANCOS',
            'GUANTES-NEGROS',
            'GUANTES-MITON',
            'OTR'
          ].map((categoria, index) => {

            const totales = totalesPedidosAnualesPorCategoria(
              pedidos,
              datosUsuario,
              categoria,
              oldOrders,
              anioFiltro
            );

            const totalUnidades = totales?.monthlySales?.reduce((a, b) => a + b, 0) || 0;
            const totalValor = totalUnidades * buscarPrecioxCategoriaAnio(buscarNombre(categoria));
            const nombreCategoria = aTitulo(categoria);

            return (
              <div className="col-lg-4 col-md-6 col-12" key={index}>
                <div className="card border border-light-subtle shadow-sm rounded-4 h-100 overflow-hidden">
                  <div className="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                      {nombreCategoria}
                    </h6>
                    <span className="badge bg-light text-dark border rounded-pill px-2 py-1 small">
                      {totalUnidades} unds
                    </span>
                  </div>

                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div className="chartArea">
                      <AreaChart
                        totales={totales}
                        porValor={true}
                        anioFiltro={anioFiltro}
                        tipo={0}
                      />
                    </div>

                    <div className="mt-3 p-2 bg-light rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-1 text-secondary" style={{ fontSize: '0.78rem' }}>
                      <span>Valor: <strong className="text-dark">{formatearPrecio(totalValor)}</strong></span>
                      {(categoria === 'KCG' || categoria === 'KCP' || categoria === 'KCE' || categoria === 'KB' || categoria === 'CC' || categoria === 'CB') && (
                        <span>Niño: <strong className="text-primary">{totales?.totalNino || 0}</strong> • Niña: <strong className="text-danger">{totales?.totalNina || 0}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Bar chart totales por categoría */}
      <div className="row g-3">
        {(user.user.rol === 'superAdmin' || user.user.rol === 'admin') && (
          <>
            <div className="col-md-12">
              <div className="chartArea" style={{ height: 'auto', overflow: 'visible' }}>
                <TablaOtros ventasOtros={ventasOtros} pedidosUsuario={pedidos} anioFiltro={anioFiltro} />
              </div>
            </div>
          </>
        )}
      </div>
      {/* Bar chart totales por categoría */}
      <div className="row d-flex g-3 mb-4">
        <div className="col-12">
          <div className="card border border-light-subtle shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 pt-3 px-3 pb-0">
              <h6 className="mb-0 fw-bold text-dark">
                <i className="fas fa-chart-bar me-2 text-primary"></i>Distribución Comparativa por Categoría
              </h6>
              <small className="text-muted">Consolidado general de unidades vendidas</small>
            </div>
            <div className="card-body p-3">
              <div className="chartArea">
                <BarChart totales={dashboardState.totalesPorCategoria} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
