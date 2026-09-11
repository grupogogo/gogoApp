import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAuthStore, useFuntions, usePedidosStore } from '../../hooks';
import { getVisiblePageNumbers } from '../../helpers';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import { LayoutApp } from '../../layout/LayoutApp';
import html2canvas from "html2canvas";
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import { ModalDetallePedido } from '../../pedidos/components/modals/ModalDetallePedido';
import { Button, Row as Fila } from 'react-bootstrap';
import { ModalUserDetail } from '../components/ModalUserDetail';

export const CuentasXCobrar = () => {
  const { limpiarFecha, calcularTotalesPedidoCxC, formatearPrecio, buscarNombre, convertirFechaIngles, aTitulo } = useFuntions();
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
  const { startLoadingPedidos } = usePedidosStore();
  const [estado, setEstado] = useState("entregado");
  const modalRef = useRef();
  const [pedido, setPedido] = useState({});
  const [showModal, setShowModal] = useState(false)
  const [fechaPedido, setFechaPedido] = useState(new Date().getFullYear());
  const [itemsMostrar, setItemsMostrar] = useState(20);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const abrirModalDetalle = (pedido) => {
    setPedido(pedido);
    setShowModal(true);
  }

  const pedidos = useSelector(state => state.pedidos.pedidos);
  const data = { nodes: pedidos };


  const handleEstadoChange = (event) => {
    setEstado(event.target.value);
  };

  const filteredData = {
    nodes: pedidos
      .filter((pedido) =>
        pedido.estado === estado &&
        pedido.user._id === user.uid &&
        (
          pedido.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
          pedido.fechaCreacion.toLowerCase().includes(search.toLowerCase()) ||
          pedido.pedido_id.toLowerCase().includes(search.toLowerCase())
        ) &&
        pedido.fechaCreacion.toLowerCase().includes(fechaPedido)
      )
      .filter((pedido) => pedido.fechaCreacion) // Validar que la fecha sea utilizable
      .sort((a, b) => {
        const fechaA = convertirFechaIngles(a.fechaCreacion);
        const fechaB = convertirFechaIngles(b.fechaCreacion);
        return fechaB - fechaA; // Ordenar de más reciente a más antigua
      })
      .map((pedido) => ({
        ...pedido,
        id: pedido.pedido_id || pedido._id, // Identificador único
      })),
  };

  const sort = useSort(
    filteredData,
    {
      onChange: onSortChange,
    },
    {
      sortFns: {
        FECHA: (array) => array.sort((a, b) => convertirFechaIngles(a.fechaCreacion) - convertirFechaIngles(b.fechaCreacion)),
        CLIENTE: (array) => array.sort((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre)),
        GASTO: (array) => array.sort((a, b) => a.gasto.localeCompare(b.gasto)),
        CATEGORIA: (array) => array.sort((a, b) => a.subCategoria.localeCompare(b.subCategoria)),
        PRECIO: (array) =>
          array.sort((a, b) => a.precio - b.precio),
        CANTIDAD: (array) =>
          array.sort((a, b) => a.cantidad - b.cantidad),
        TOTAL: (array) =>
          array.sort((a, b) => (a.cantidad * a.precio) - (b.cantidad * b.precio)),
      },
    }
  );

  function onSortChange(action, state) {
    //console.log(action, state);
  }
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };
  const pagination = usePagination(filteredData, {
    state: {
      page: 0,
      size: itemsMostrar,
    },
  });
  const sizeColumnTheme = {
    Table: `
              --data-table-library_grid-template-columns: 
                  auto auto auto auto auto auto !important;
          `,
  };
  const theme = useTheme([sizeColumnTheme]);

  const handleDownloadPDF = () => {
    let timerInterval;
    Swal.fire({
      title: "Generando PDF!",
      html: '<l-quantum   size="25"   speed="1.75"   color="black"  ></l-quantum>',
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {
          timer.textContent = `${Swal.getTimerLeft()}`;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log("I was closed by the timer");
      }
    });
    html2canvas(modalRef.current, { scale: 3 }).then(canvas => { // Aumenta la escala para más detalle
      const imgData = canvas.toDataURL("image/jpeg", 1); // Cambia a JPEG con calidad 90%
      const pdf = new jsPDF("p", "mm", "letter");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 10; // Deja margen de 5mm en cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 5, 5, imgWidth, imgHeight);
      pdf.save(`CxC_${new Date().getTime()}.pdf`);
    });
  };

  // Nueva función para calcular los totales agrupados
  const calcularTotalesAgrupados = (nodes) => {
    const totales = {
      guantes: [0, 0, 0], // GB, GN, GM
      kits: [0, 0, 0, 0, 0, 0], // KCG, KCP, KB, CC, CB
      otros: 0,
    };
    nodes.forEach(item => {
      const totalesPedido = calcularTotalesPedidoCxC(item);
      totales.guantes = totales.guantes.map((val, idx) => val + (totalesPedido.totalGuantes[idx] || 0));
      totales.kits = totales.kits.map((val, idx) => val + (totalesPedido.totalKits[idx] || 0));
      totales.otros += totalesPedido.totalOtros || 0;
    });
    return totales;
  };
  const totalesAgrupados = calcularTotalesAgrupados(filteredData.nodes);
  const totalCartera = filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0);
  const totalGuantesCartera = (totalesAgrupados.guantes[0] || 0) + (totalesAgrupados.guantes[1] || 0) + (totalesAgrupados.guantes[2] || 0);
  const totalKitsCartera = (totalesAgrupados.kits || []).reduce((acc, val) => acc + (val || 0), 0);
  const totalOtrosCartera = totalesAgrupados.otros || 0;

  // Escapa adecuadamente las celdas para evitar errores con caracteres especiales
  const escapeCsvCell = (cell) => {
    if (cell == null) {
      return "";
    }
    const sc = cell.toString().trim();
    if (sc === "" || sc === '""') {
      return sc;
    }
    if (
      sc.includes('"') ||
      sc.includes(";") || // También escapa el nuevo delimitador
      sc.includes("\n") ||
      sc.includes("\r")
    ) {
      return '"' + sc.replace(/"/g, '""') + '"';
    }
    return sc;
  };

  // Genera los datos CSV usando ";" como delimitador de columnas
  const makeCsvData = (columns, data) => {
    const delimiter = ";"; // ← CAMBIO CLAVE

    // Encabezado
    const header = columns.map(({ name }) => escapeCsvCell(name)).join(delimiter) + "\r\n";

    // Filas de datos
    const rows = data.map((rowItem) =>
      columns.map(({ accessor }) => escapeCsvCell(accessor(rowItem))).join(delimiter)
    ).join("\r\n");

    return header + rows + "\r\n";
  };

  // Descarga el archivo CSV generado
  const downloadAsCsv = (columns, data, filename) => {
    const csvData = makeCsvData(columns, data);
    const csvFile = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const downloadLink = document.createElement("a");

    downloadLink.style.display = "none";
    downloadLink.download = filename;
    downloadLink.href = URL.createObjectURL(csvFile);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Llama esta función cuando quieras generar y descargar el archivo CSV
  const handleDownloadCsv = () => {
    const columns = [
      { accessor: (item) => item.fechaCreacion, name: "FECHA" },
      { accessor: (item) => (item.pedido_id).slice(-6), name: "REMISION" },
      { accessor: (item) => item.cliente.nombre, name: "CLIENTE" },
      { accessor: (item) => (calcularTotalesPedidoCxC(item).totalItems), name: "ITEMS" },
      { accessor: (item) => (calcularTotalesPedidoCxC(item).total), name: "TOTAL" },
    ];

    downloadAsCsv(columns, filteredData.nodes, "Tabla CXC.csv");
  };
  const handleViewDetail = (userId) => {
    const userOrders = pedidos.filter(p => p.user._id === userId);
    const quantities = {};
    const totals = {};
    let grandTotal = 0;
    const allItems = [];

    userOrders.forEach(order => {
      if (!order.itemPedido) return;
      order.itemPedido.forEach(item => {
        if (!item.itemPedido) return;
        Object.entries(item.itemPedido).forEach(([catKey, catData]) => {
          if (!totals[catKey]) totals[catKey] = 0;
          if (!quantities[catKey]) quantities[catKey] = 0;

          const catTotal = (catData.pedido || []).reduce((acc, prod) => {
            return acc + ((prod.cantidad || 0) * (prod.precio || prod.precioUnitario || 0));
          }, 0);

          const catQuantity = (catData.pedido || []).reduce((acc, prod) => {
            return acc + (prod.cantidad || 0);
          }, 0);

          totals[catKey] += catTotal;
          quantities[catKey] += catQuantity;
          grandTotal += catTotal;

          if (catData.pedido) {
            allItems.push(...catData.pedido);
          }
        });
      });
    });

    const user = userOrders[0]?.user || {};
    setSelectedUserDetail({ user, totals, quantities, grandTotal, allItems });
    setShowDetailModal(true);
  };

  useEffect(() => {
    startLoadingPedidos();
  }, []);

  return (
    <LayoutApp>
      <div className="container-fluid px-2 px-md-3 py-2">
        {/* TARJETAS KPI DE CARTERA */}
        <div className="row g-3 mb-4">
          {/* 1. TOTAL CARTERA */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="p-2 bg-primary-subtle text-primary rounded-3">
                  <i className="fas fa-hand-holding-usd fa-lg"></i>
                </span>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                  {filteredData.nodes.length} remisiones
                </span>
              </div>
              <small className="text-muted fw-medium">Total Cartera ({aTitulo(estado)})</small>
              <h4 className="fw-bolder text-dark mb-0 mt-1">
                {formatearPrecio(totalCartera)}
              </h4>
            </div>
          </div>

          {/* 2. KITS EN CARTERA */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="p-2 bg-info-subtle text-info rounded-3">
                  <i className="fas fa-box-open fa-lg"></i>
                </span>
                <span className="badge bg-info-subtle text-info rounded-pill px-2 py-1 small">
                  Kits
                </span>
              </div>
              <small className="text-muted fw-medium">Kits en Cartera</small>
              <h4 className="fw-bolder text-dark mb-0 mt-1">
                {formatearPrecio(totalKitsCartera)}
              </h4>
            </div>
          </div>

          {/* 3. GUANTES EN CARTERA */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="p-2 bg-warning-subtle text-warning rounded-3">
                  <i className="fas fa-hand-sparkles fa-lg"></i>
                </span>
                <span className="badge bg-warning-subtle text-warning rounded-pill px-2 py-1 small">
                  Guantes
                </span>
              </div>
              <small className="text-muted fw-medium">Guantes en Cartera</small>
              <h4 className="fw-bolder text-dark mb-0 mt-1">
                {formatearPrecio(totalGuantesCartera)}
              </h4>
            </div>
          </div>

          {/* 4. OTROS EN CARTERA */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="p-2 bg-secondary-subtle text-secondary rounded-3">
                  <i className="fas fa-tags fa-lg"></i>
                </span>
                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 small">
                  Otros
                </span>
              </div>
              <small className="text-muted fw-medium">Otros Productos</small>
              <h4 className="fw-bolder text-dark mb-0 mt-1">
                {formatearPrecio(totalOtrosCartera)}
              </h4>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS Y CONTROLES */}
        <div className="card border border-light-subtle shadow-sm rounded-4 mb-4 bg-white">
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
              <div>
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-receipt me-2 text-primary"></i>Listado de Cuentas por Cobrar
                </h5>
                <small className="text-muted">Filtra por estado, cliente o rango de fecha</small>
              </div>

              {/* Botones de Exportación */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  className="btn btn-sm btn-outline-success rounded-pill d-flex align-items-center gap-2 px-3 shadow-xs"
                  onClick={handleDownloadCsv}
                >
                  <i className="fa-solid fa-file-csv"></i>
                  <span>Exportar CSV</span>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center gap-2 px-3 shadow-xs"
                  onClick={handleDownloadPDF}
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>

            <div className="row g-2 align-items-end">
              {/* Filtro Estado */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold small text-muted mb-1">Estado de Pedido:</label>
                <select
                  id="estadoSelect"
                  className="form-select form-select-sm rounded-3"
                  value={estado}
                  onChange={handleEstadoChange}
                >
                  <option value="entregado">Entregado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="enviado">Enviado</option>
                  <option value="preparado">Preparado</option>
                </select>
              </div>

              {/* Buscador */}
              <div className="col-12 col-sm-6 col-md-4">
                <label className="form-label fw-semibold small text-muted mb-1">Buscador:</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control rounded-start-3 ps-3"
                    placeholder="Cliente, fecha, remisión..."
                    value={search}
                    onChange={handleSearch}
                  />
                  <button className="btn btn-outline-secondary rounded-end-3" type="button">
                    <i className="fas fa-search" />
                  </button>
                </div>
              </div>

              {/* Año */}
              <div className="col-6 col-sm-6 col-md-2">
                <label className="form-label fw-semibold small text-muted mb-1">Año:</label>
                <select
                  className="form-select form-select-sm rounded-3"
                  value={fechaPedido}
                  onChange={e => {
                    const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                    setFechaPedido(value);
                    pagination.fns.onSetPage(0);
                  }}
                >
                  <option value={'2026'}>2026</option>
                  <option value={'2025'}>2025</option>
                </select>
              </div>

              {/* Items por página */}
              <div className="col-6 col-sm-6 col-md-3">
                <label className="form-label fw-semibold small text-muted mb-1">Mostrar por página:</label>
                <select
                  className="form-select form-select-sm rounded-3"
                  value={itemsMostrar}
                  onChange={e => {
                    const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                    setItemsMostrar(value);
                    pagination.fns.onSetPage(0);
                  }}
                >
                  <option value={5}>5 registros</option>
                  <option value={10}>10 registros</option>
                  <option value={20}>20 registros</option>
                  <option value={50}>50 registros</option>
                  <option value={100}>100 registros</option>
                  <option value={100000}>Todos los registros</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA PRINCIPAL DE CUENTAS POR COBRAR */}
        <div className="card border border-light-subtle shadow-sm rounded-4 mb-4 bg-white p-3">
          <div ref={modalRef} className="table-responsive">
            {/* Mobile Card View */}
            <div className="d-block d-md-none">
              {filteredData.nodes.map((item, index) => (
                <div key={index} className="card border border-light-subtle rounded-3 mb-3 shadow-xs" onClick={() => abrirModalDetalle(item)}>
                  <div className="card-header d-flex justify-content-between align-items-center bg-light rounded-top-3 py-2">
                    <span className="fw-bold text-primary">{aTitulo(item.cliente.nombre)}</span>
                    <small className="text-muted">{limpiarFecha(item.fechaCreacion)}</small>
                  </div>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Remisión:</span>
                      <span className="badge bg-primary-subtle text-primary rounded-pill">#{(item.pedido_id).slice(-6)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Ciudad:</span>
                      <span className="fw-medium text-dark small">{aTitulo(item.cliente?.ciudad)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Items:</span>
                      <span className="badge bg-light text-dark border">{calcularTotalesPedidoCxC(item).totalItems}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold small text-muted">Total:</span>
                      <span className="fs-6 fw-bold text-dark">{formatearPrecio(calcularTotalesPedidoCxC(item).total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="d-none d-md-block">
              <Table
                className="table table-hover text-start w-100 compact-table table-sm align-middle"
                style={{ maxWidth: "100%" }}
                data={filteredData}
                theme={theme}
                pagination={pagination}
                sort={sort}
              >
                {(tableList) => (
                  <>
                    <Header>
                      <HeaderRow className="table-light text-center fw-semibold">
                        <HeaderCellSort sortKey="FECHA" className="text-center fw-semibold">Fecha</HeaderCellSort>
                        <HeaderCell className="text-center fw-semibold">Remisión</HeaderCell>
                        <HeaderCellSort sortKey="CLIENTE" className="text-start ps-3 fw-semibold">Cliente</HeaderCellSort>
                        <HeaderCell className="text-center fw-semibold">Ciudad</HeaderCell>
                        <HeaderCellSort sortKey="CANTIDAD" className="text-center fw-semibold">Items</HeaderCellSort>
                        <HeaderCellSort sortKey="TOTAL" className="text-end pe-3 fw-semibold">Total ($)</HeaderCellSort>
                      </HeaderRow>
                    </Header>

                    <Body>
                      {tableList.map((item, index) => (
                        <Row key={index} item={item}>
                          <Cell className="text-center small text-muted" title={item.fechaCreacion}>{limpiarFecha(item.fechaCreacion)}</Cell>
                          <Cell className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fw-semibold"
                              style={{ fontSize: '0.78rem' }}
                              onClick={() => abrirModalDetalle(item)}
                            >
                              #{(item.pedido_id).slice(-6)}
                            </button>
                          </Cell>
                          <Cell className="ps-3 fw-medium text-dark" title={item.cliente.nombre}>{aTitulo(item.cliente.nombre)}</Cell>
                          <Cell className="text-center text-muted small" title={item.cliente?.ciudad}>{aTitulo(item.cliente?.ciudad)}</Cell>
                          <Cell className='text-center'>
                            <span className="badge bg-light text-secondary border px-2 py-1">
                              {calcularTotalesPedidoCxC(item).totalItems}
                            </span>
                          </Cell>
                          <Cell className='text-end pe-3 fw-bold text-dark' title={item.cliente.nombre}>
                            {formatearPrecio(calcularTotalesPedidoCxC(item).total)}
                          </Cell>
                        </Row>
                      ))}
                      <Row className="table-light fw-bold border-top">
                        <Cell colSpan={4} className="text-end fw-bold pe-3">Total Cuentas por Cobrar:</Cell>
                        <Cell className="text-center">
                          <span className="badge bg-primary-subtle text-primary">
                            {filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).totalItems, 0)} unds
                          </span>
                        </Cell>
                        <Cell className="text-end pe-3 fw-bolder text-primary fs-6">
                          {formatearPrecio(totalCartera)}
                        </Cell>
                      </Row>
                    </Body>
                  </>
                )}
              </Table>
            </div>

            {/* PAGINACIÓN */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
              <div className="small text-muted">
                Mostrando {filteredData.nodes.length} registros • Página {pagination.state.page + 1} de {pagination.state.getTotalPages(filteredData.nodes) || 1}
              </div>
              <div className="d-flex align-items-center gap-1">
                {pagination.state.page > 0 && (
                  <button
                    className="btn btn-light btn-sm border rounded-pill px-3"
                    onClick={() => pagination.fns.onSetPage(pagination.state.page - 1)}
                  >
                    &laquo; Anterior
                  </button>
                )}
                {getVisiblePageNumbers(pagination.state.page, pagination.state.getTotalPages(filteredData.nodes) || 1, 5).map((pageIndex) => (
                  <button
                    key={pageIndex}
                    className={`btn btn-sm rounded-circle px-2 py-1 ${pagination.state.page === pageIndex ? 'btn-primary' : 'btn-light border'}`}
                    style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                    onClick={() => pagination.fns.onSetPage(pageIndex)}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                {pagination.state.page < pagination.state.getTotalPages(filteredData.nodes) - 1 && (
                  <button
                    className="btn btn-light btn-sm border rounded-pill px-3"
                    onClick={() => pagination.fns.onSetPage(pagination.state.page + 1)}
                  >
                    Siguiente &raquo;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DISTRIBUCIÓN DE CARTERA POR PRODUCTO */}
        <div className="card border border-light-subtle shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h6 className="mb-0 fw-bold text-dark">
                <i className="fas fa-chart-pie me-2 text-primary"></i>Distribución de Cartera por Tipo de Producto
              </h6>
              <small className="text-muted">Proporción del valor por cobrar según referencia</small>
            </div>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold">
              Total Cartera: {formatearPrecio(totalCartera)}
            </span>
          </div>

          <div className="card-body p-3">
            {/* Barra de progreso apilada */}
            <div className="progress rounded-pill mb-3" style={{ height: '14px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {totalesAgrupados.guantes[0] > 0 && (
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.guantes[0] * 100) / totalCartera : 0}%` }}
                  title={`Guantes Blancos: ${formatearPrecio(totalesAgrupados.guantes[0])}`}
                ></div>
              )}
              {totalesAgrupados.guantes[1] > 0 && (
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.guantes[1] * 100) / totalCartera : 0}%` }}
                  title={`Guantes Negros: ${formatearPrecio(totalesAgrupados.guantes[1])}`}
                ></div>
              )}
              {totalesAgrupados.guantes[2] > 0 && (
                <div
                  className="progress-bar bg-info"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.guantes[2] * 100) / totalCartera : 0}%` }}
                  title={`Guantes Mitón: ${formatearPrecio(totalesAgrupados.guantes[2])}`}
                ></div>
              )}
              {totalesAgrupados.kits[0] > 0 && (
                <div
                  className="progress-bar bg-danger"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.kits[0] * 100) / totalCartera : 0}%` }}
                  title={`Kit Comunión Grande: ${formatearPrecio(totalesAgrupados.kits[0])}`}
                ></div>
              )}
              {totalesAgrupados.kits[1] > 0 && (
                <div
                  className="progress-bar bg-warning text-dark"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.kits[1] * 100) / totalCartera : 0}%` }}
                  title={`Kit Comunión Pequeño: ${formatearPrecio(totalesAgrupados.kits[1])}`}
                ></div>
              )}
              {totalesAgrupados.kits[5] > 0 && (
                <div
                  className="progress-bar"
                  style={{ backgroundColor: '#ec4899', width: `${totalCartera > 0 ? (totalesAgrupados.kits[5] * 100) / totalCartera : 0}%` }}
                  title={`Kit Comunión Económico: ${formatearPrecio(totalesAgrupados.kits[5])}`}
                ></div>
              )}
              {totalesAgrupados.kits[2] > 0 && (
                <div
                  className="progress-bar bg-secondary"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.kits[2] * 100) / totalCartera : 0}%` }}
                  title={`Kit de Bautizo: ${formatearPrecio(totalesAgrupados.kits[2])}`}
                ></div>
              )}
              {totalesAgrupados.kits[3] > 0 && (
                <div
                  className="progress-bar bg-dark"
                  style={{ width: `${totalCartera > 0 ? (totalesAgrupados.kits[3] * 100) / totalCartera : 0}%` }}
                  title={`Cirio Comunión: ${formatearPrecio(totalesAgrupados.kits[3])}`}
                ></div>
              )}
              {totalesAgrupados.kits[4] > 0 && (
                <div
                  className="progress-bar"
                  style={{ backgroundColor: '#f97316', width: `${totalCartera > 0 ? (totalesAgrupados.kits[4] * 100) / totalCartera : 0}%` }}
                  title={`Cirio Bautizo: ${formatearPrecio(totalesAgrupados.kits[4])}`}
                ></div>
              )}
              {totalesAgrupados.otros > 0 && (
                <div
                  className="progress-bar"
                  style={{ backgroundColor: '#8b5cf6', width: `${totalCartera > 0 ? (totalesAgrupados.otros * 100) / totalCartera : 0}%` }}
                  title={`Otros Productos: ${formatearPrecio(totalesAgrupados.otros)}`}
                ></div>
              )}
            </div>

            {/* Badges de desglose en Title Case */}
            <div className="d-flex flex-wrap gap-2 pt-2">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                Guantes Blancos: {formatearPrecio(totalesAgrupados.guantes[0])}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                Guantes Negros: {formatearPrecio(totalesAgrupados.guantes[1])}
              </span>
              <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                Guantes Mitón: {formatearPrecio(totalesAgrupados.guantes[2])}
              </span>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                Kit Comunión Grande: {formatearPrecio(totalesAgrupados.kits[0])}
              </span>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                Kit Comunión Pequeño: {formatearPrecio(totalesAgrupados.kits[1])}
              </span>
              <span className="badge bg-pink-subtle text-dark border px-2 py-1" style={{ backgroundColor: '#fce7f3' }}>
                Kit Comunión Económico: {formatearPrecio(totalesAgrupados.kits[5])}
              </span>
              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                Kit Bautizo: {formatearPrecio(totalesAgrupados.kits[2])}
              </span>
              <span className="badge bg-dark-subtle text-dark border px-2 py-1">
                Cirio Comunión: {formatearPrecio(totalesAgrupados.kits[3])}
              </span>
              <span className="badge bg-light text-dark border px-2 py-1">
                Cirio Bautizo: {formatearPrecio(totalesAgrupados.kits[4])}
              </span>
              <span className="badge bg-light text-dark border px-2 py-1">
                Otros Productos: {formatearPrecio(totalesAgrupados.otros)}
              </span>
            </div>

            <div className="row g-2 mt-3 pt-3 border-top">
              <div className="col-12 col-md-6">
                <div className="p-2 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-dark small"><i className="fas fa-hand-sparkles me-2 text-primary"></i>Total Guantes en Cartera:</span>
                  <strong className="text-primary">{formatearPrecio(totalGuantesCartera)}</strong>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-2 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-dark small"><i className="fas fa-box-open me-2 text-danger"></i>Total Kits en Cartera:</span>
                  <strong className="text-danger">{formatearPrecio(totalKitsCartera)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA: RESUMEN GENERAL VENTAS POR ESTADO */}
        <div className="card border border-light-subtle shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-0 pt-3 px-3 pb-2">
            <h6 className="mb-0 fw-bold text-dark">
              <i className="fas fa-layer-group me-2 text-primary"></i>Resumen General Ventas {fechaPedido} por Estado
            </h6>
            <small className="text-muted">Consolidado de ventas según el estado del pedido</small>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: '13px' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Estado</th>
                  <th className="text-end">Guantes</th>
                  <th className="text-end">Kits</th>
                  <th className="text-end">Otros</th>
                  <th className="text-end pe-3">Total Facturado</th>
                </tr>
              </thead>
              <tbody>
                {['entregado', 'pendiente', 'pagado', 'enviado', 'preparado', 'devuelto', 'anulado'].map((estadoIteracion) => {
                  const pedidosUsuario = pedidos.filter(p => p.user._id === user.uid && p.estado === estadoIteracion);
                  const totalesUsuario = calcularTotalesAgrupados(pedidosUsuario);
                  const totalGuantes = totalesUsuario.guantes.reduce((a, b) => a + b, 0);
                  const totalKits = totalesUsuario.kits.reduce((a, b) => a + b, 0);
                  const totalGeneral = totalGuantes + totalKits + totalesUsuario.otros;

                  const badgeClass = estadoIteracion === 'pagado'
                    ? 'bg-success-subtle text-success'
                    : estadoIteracion === 'entregado'
                      ? 'bg-primary-subtle text-primary'
                      : estadoIteracion === 'pendiente'
                        ? 'bg-warning-subtle text-warning'
                        : estadoIteracion === 'anulado'
                          ? 'bg-danger-subtle text-danger'
                          : 'bg-light text-secondary border';

                  return (
                    <tr key={estadoIteracion}>
                      <td className="ps-3">
                        <span className={`badge rounded-pill px-2 py-1 ${badgeClass}`}>
                          {aTitulo(estadoIteracion)}
                        </span>
                      </td>
                      <td className="text-end">{formatearPrecio(totalGuantes)}</td>
                      <td className="text-end">{formatearPrecio(totalKits)}</td>
                      <td className="text-end">{formatearPrecio(totalesUsuario.otros)}</td>
                      <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(totalGeneral)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA: RESUMEN POR ASESOR COMERCIAL (Si es SuperAdmin o Admin) */}
        {(user.rol === 'superAdmin' || user.rol === 'admin') && (
          <div className="card border border-light-subtle shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
            <div className="card-header bg-white border-0 pt-3 px-3 pb-2">
              <h6 className="mb-0 fw-bold text-dark">
                <i className="fas fa-users me-2 text-primary"></i>Rendimiento y Cartera por Asesor Comercial
              </h6>
              <small className="text-muted">Desglose acumulado por cada distribuidor</small>
            </div>

            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: '13px' }}>
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Asesor</th>
                    <th className="text-center">Pedidos</th>
                    <th className="text-center">Items</th>
                    <th className="text-end">Guantes</th>
                    <th className="text-end">Kits</th>
                    <th className="text-end">Otros</th>
                    <th className="text-end">Total Venta</th>
                    <th className="text-center pe-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(pedidos.reduce((acc, pedido) => {
                    const userId = pedido.user._id;
                    if (!acc[userId]) {
                      acc[userId] = {
                        user: pedido.user,
                        count: 0,
                        totalItems: 0,
                        totalVenta: 0,
                        nodes: [],
                      };
                    }
                    acc[userId].count += 1;
                    const totales = calcularTotalesPedidoCxC(pedido);
                    acc[userId].totalItems += totales.totalItems;
                    acc[userId].totalVenta += totales.total;
                    acc[userId].nodes.push(pedido);
                    return acc;
                  }, {})).map((userSummary, index) => {
                    const categorias = calcularTotalesAgrupados(userSummary.nodes);
                    const totalGuantes = categorias.guantes.reduce((a, b) => a + b, 0);
                    const totalKits = categorias.kits.reduce((a, b) => a + b, 0);

                    return (
                      <tr key={index}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white small"
                              style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}
                            >
                              {(userSummary.user.nombre || userSummary.user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{aTitulo(userSummary.user.nombre || userSummary.user.email)}</div>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{userSummary.user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center"><span className="badge bg-light text-dark border">{userSummary.count}</span></td>
                        <td className="text-center">{userSummary.totalItems}</td>
                        <td className="text-end">{formatearPrecio(totalGuantes)}</td>
                        <td className="text-end text-danger">{formatearPrecio(totalKits)}</td>
                        <td className="text-end text-secondary">{formatearPrecio(categorias.otros)}</td>
                        <td className="text-end fw-bold text-dark">{formatearPrecio(userSummary.totalVenta)}</td>
                        <td className="text-center pe-3">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => handleViewDetail(userSummary.user._id)}
                          >
                            <i className="fas fa-eye me-1"></i>Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ModalDetallePedido
        show={showModal}
        setShow={setShowModal}
        pedido={pedido}
      />
      <ModalUserDetail
        show={showDetailModal}
        handleClose={() => setShowDetailModal(false)}
        data={selectedUserDetail}
        formatearPrecio={formatearPrecio}
        buscarNombre={buscarNombre}
      />
    </LayoutApp>
  );
};
