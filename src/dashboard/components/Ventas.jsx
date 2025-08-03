import { useEffect, useState } from "react";
import { useFuntions, usePedidosStore } from "../../hooks";
import { AreaChart, BarChart, PieChart } from "../js";
import { useSelector } from "react-redux";
import { useGastosStore } from "../../hooks/useGastosStore";


export const Ventas = ({ datosUsuario }) => {

  const { startLoadingPedidos } = usePedidosStore();
  const user = useSelector(state => state.auth)
  const gastos = useSelector(state => state.gastos.gastos);
  const pedidos = useSelector(state => state.pedidos.pedidos);
  const [filtroCategoria, setFiltroCategoria] = useState('KCG');
  const { startLoadingGastos } = useGastosStore();
  const [anioFiltro, setAnioFiltro] = useState(2025);
  const oldOrders = useSelector(state => state.pedidos.oldOrders) || [];
  const { startLoadingOldOrders } = usePedidosStore();

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
    totalGastosUsuarios,
    totalizarPreciosFabrica
  } = useFuntions();


  // Procesar pedidos cuando llegan
  useEffect(() => {
    if (pedidos !== undefined && pedidos.length > 0) {
      const { monthlySales, totalSales } = totalKitsXAnio(pedidos, datosUsuario, anioFiltro);
      const { monthlySales: monthlyGuantes, totalSales: totalSalesGuantes } = totalGuantesXAnio(pedidos, datosUsuario, anioFiltro);
      const { monthlySales: monthlyOtros, totalSales: totalSalesOtros } = totalOtrosXAnio(pedidos, datosUsuario, anioFiltro);
      updateDashboardState({
        totales: totalesPedidos(pedidos, datosUsuario, anioFiltro), // Datos de usuario estado que controla si mostrar todo o solo el usuario logueado - totales de estadisticas
        totalxAnio: totalesPedidosAnuales(pedidos, datosUsuario),
        monthlySales,
        totalSalesKits: totalSales, // Nueva variable para almacenar totalSales
        monthlyGuantes,
        totalSalesGuantes,
        monthlyOtros,
        totalSalesOtros,
      });
      calcularTotalesPedidos('kits', pedidos,
        (data) => updateDashboardState({ dataKits: data }),
        (labels) => updateDashboardState({ lablesKits: labels }),
        datosUsuario,
        anioFiltro
      );

      calcularTotalesPedidos('guantes', pedidos,
        (data) => updateDashboardState({ dataGuantes: data }),
        (labels) => updateDashboardState({ lablesGuantes: labels }),
        datosUsuario,
        anioFiltro
      );

      calcularTotalesPedidos('otros', pedidos,
        (data) => updateDashboardState({ dataOtros: data }),
        (labels) => updateDashboardState({ lablesOtros: labels }),
        datosUsuario,
        anioFiltro
      );

      calcularTotalesPedidos('todos', pedidos,
        (data) => updateDashboardState({ dataTodos: data }),
        (labels) => updateDashboardState({ lablesTodos: labels }),
        datosUsuario,
        anioFiltro
      );

      updateDashboardState({
        totalesPorCategoria: calcularTotalesPedidos('todos', pedidos,
          (data) => updateDashboardState({ dataTodos: data }),
          (labels) => updateDashboardState({ lablesTodos: labels }),
          datosUsuario,
          anioFiltro
        )
      });

    }
    if (gastos.length > 0) {
      const categoriaKits = 'K'; // Cambiar a 'guantes' o 'otros' según sea necesario
      const categoriaGuantes = 'G'; // Cambiar a 'guantes' o 'otros' según sea necesario
      const gastosTotalesKits = totalGastosUsuarios(gastos, anioFiltro, datosUsuario, categoriaKits);
      const gastosTotalesGuantes = totalGastosUsuarios(gastos, anioFiltro, datosUsuario, categoriaGuantes);
      updateDashboardState({ gastosTotalesKits });
      updateDashboardState({ gastosTotalesGuantes });

    }

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
      <div className="row">
        <div className="col-3 align-items-center">
          <div className="input-group form-select-sm">
            <span className='m-2'>Año a filtrar</span>
            <select
              className="form-select form-select-sm"
              title="Filtro por año"
              style={{ maxWidth: 'fit-content' }}
              value={anioFiltro} // solo el año
              onChange={e => {
                setAnioFiltro(parseInt(e.target.value)); // actualiza el año como string                                                     
              }}
            >
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
      </div>
      {/* !PIECHARTS */}
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
        <div className="col-xl-6 col-lg-4 col-md-12">
          <div className="card card-hover border-0 shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-gray m-3">{(user.user.uid === '679fce0ee8d1ed66d21d18c2' && !datosUsuario) ? 'Gastos Generales' : 'Gastos Kits'}</h6>
            </div>
            <div className="card-body p-1">
              <PieChart
                arrayLabels={(user.user.uid === '679fce0ee8d1ed66d21d18c2' && !datosUsuario) ? ['TOTAL GASTOS', 'KITS', 'GUANTES'] : ['TOTAL KITS', 'OG', 'LG']}
                arrayData={dashboardState.gastosTotalesKits}
                title={(user.user.uid === '679fce0ee8d1ed66d21d18c2' && !datosUsuario) ? `GASTOS GENERALES ${formatearPrecio(dashboardState.gastosTotalesKits[0])}` : `GASTOS KITS ${formatearPrecio(dashboardState.gastosTotalesKits[0])}`}
              />
            </div>
          </div>
        </div>
      </div>
      {/* AREA CHARTS */}
      <div className="row g-3 mb-4">
        {/* GENERAL */}
        <div className="col-md-6">
          <div className="card card-hover border-0 shadow-lg">
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState.totalxAnio} />
              </div>
              <hr className="my-3" />
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-center bg-primary text-white p-1 rounded w-100">GENERAL <span className="fw-bold">{formatearPrecio(dashboardState.totales.totalSales)}</span></small>
              </div>
            </div>
          </div>
        </div>
        {/* KITS */}
        <div className="col-md-6">
          <div className="card card-hover border-0 shadow-lg">
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState} />
              </div>
              <hr className="my-3" />
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-center bg-primary text-white p-1 rounded w-100">KITS: $ <span className="fw-bold">{formatearPrecio(dashboardState.totalSalesKits)}</span></small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Area charts por categorías */}
      {pedidos && (
        <div className="row g-3 mb-4">
          {['KCG', 'KCP', 'KB', 'CC', 'CB', 'GUANTES-BLANCOS', 'GUANTES-NEGROS', 'GUANTES-MITON', 'OTR'].map((categoria, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="card card-hover border-0 shadow-lg">
                <div className="card-body p-3">
                  <div className="chartArea">
                    <AreaChart
                      totales={totalesPedidosAnualesPorCategoria(pedidos, datosUsuario, categoria, oldOrders)}
                      porValor={true}
                    />
                  </div>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-center bg-primary text-white p-1 rounded w-100">Hasta {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} | <span className="fw-semibold"> {(buscarNombre(categoria)).toLocaleLowerCase()} </span> | Unidades:  <span className="fw-bold"> {totalesPedidosAnualesPorCategoria(pedidos, datosUsuario, categoria, oldOrders).monthlySales2025.reduce((a, b) => a + b, 0)} </span></small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bar chart totales por categoría */}
      <div className="row">
        <div className="col-md-12 col-lg-12">
          <div className="card card-hover shadow-sm">
            <div className="card-body p-3">
              <BarChart totales={dashboardState.totalesPorCategoria} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
