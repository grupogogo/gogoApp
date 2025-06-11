import { useEffect, useState } from "react";
import { useFuntions, usePedidosStore } from "../../hooks";
import { AreaChart, BarChart, PieChart } from "../js";
import { useSelector } from "react-redux";
import { useGastosStore } from "../../hooks/useGastosStore";

export const Ventas = ({ datosUsuario }) => {

  const [filtroAnio, setfiltroAnio] = useState(2025)
  const {startLoadingPedidos } = usePedidosStore();
  const user = useSelector(state => state.auth)
  const gastos = useSelector(state => state.gastos.gastos);
  const pedidos = useSelector(state=> state.pedidos.pedidos);
  const [filtroCategoria, setFiltroCategoria] = useState('KCG');
  const { startLoadingGastos } = useGastosStore();

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
      const { monthlySales, totalSales } = totalKitsXAnio(pedidos, datosUsuario);
      const { monthlySales: monthlyGuantes, totalSales: totalSalesGuantes } = totalGuantesXAnio(pedidos, datosUsuario);
      const { monthlySales: monthlyOtros, totalSales: totalSalesOtros } = totalOtrosXAnio(pedidos, datosUsuario);
      updateDashboardState({
        totales: totalesPedidos(pedidos, datosUsuario), // Datos de usuario estado que controla si mostrar todo o solo el usuario logueado - totales de estadisticas
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
        datosUsuario
      );

      calcularTotalesPedidos('guantes', pedidos,
        (data) => updateDashboardState({ dataGuantes: data }),
        (labels) => updateDashboardState({ lablesGuantes: labels }),
        datosUsuario
      );

      calcularTotalesPedidos('otros', pedidos,
        (data) => updateDashboardState({ dataOtros: data }),
        (labels) => updateDashboardState({ lablesOtros: labels }),
        datosUsuario
      );

      calcularTotalesPedidos('todos', pedidos,
        (data) => updateDashboardState({ dataTodos: data }),
        (labels) => updateDashboardState({ lablesTodos: labels }),
        datosUsuario
      );

      updateDashboardState({
        totalesPorCategoria: calcularTotalesPedidos('todos', pedidos, () => { }, () => { }, datosUsuario),
      });

    }
    if (gastos.length > 0) {
      const categoriaKits = 'K'; // Cambiar a 'guantes' o 'otros' según sea necesario
      const categoriaGuantes = 'G'; // Cambiar a 'guantes' o 'otros' según sea necesario
      const gastosTotalesKits = totalGastosUsuarios(gastos, filtroAnio, datosUsuario, categoriaKits);
      const gastosTotalesGuantes = totalGastosUsuarios(gastos, filtroAnio, datosUsuario, categoriaGuantes);
      updateDashboardState({ gastosTotalesKits });
      updateDashboardState({ gastosTotalesGuantes });

    }

  }, [pedidos, datosUsuario, gastos]);

  // Cambio de categoría
  useEffect(() => {
    if (pedidos.length > 0) {
      updateDashboardState({
        totalCategoriaxAnio: totalesPedidosAnualesPorCategoria(pedidos, datosUsuario, filtroCategoria),
      });
    }
  }, [datosUsuario, filtroCategoria]);

  return (
    <>

      <div className="row g-3 mb-4">
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
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card card-hover border-0 shadow-lg">
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState.totalxAnio} />
              </div>
              <hr className="my-3" />
              <small className="text-muted">GENERAL {formatearPrecio(dashboardState.totales.totalSales)}</small>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card card-hover border-0 shadow-lg">
            <div className="card-body p-3">
              <div className="chartArea">
                <AreaChart totales={dashboardState} />
              </div>
              <hr className="my-3" />
              <small className="text-muted">KITS: ${number_format(dashboardState.totalSalesKits)}</small>
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
                      totales={totalesPedidosAnualesPorCategoria(pedidos, datosUsuario, categoria)}
                      porValor={true}
                    />
                  </div>
                  <hr className="my-3" />
                  <small className="text-muted">Ventas {buscarNombre(categoria)}</small>
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
