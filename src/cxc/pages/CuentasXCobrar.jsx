import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAuthStore, useFuntions, usePedidosStore } from '../../hooks';
import { Table, Header, HeaderRow, Body, Row, Cell } from "@table-library/react-table-library/table";
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
  const { limpiarFecha, calcularTotalesPedidoCxC, formatearPrecio, buscarNombre, convertirFechaIngles } = useFuntions();
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
  const { startLoadingPedidos } = usePedidosStore();
  const [estado, setEstado] = useState("entregado");
  const modalRef = useRef();
  const [pedido, setPedido] = useState({});
  const [showModal, setShowModal] = useState(false)
  const [fechaPedido, setFechaPedido] = useState('2025');
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
    const totals = {};
    let grandTotal = 0;
    const allItems = [];

    userOrders.forEach(order => {
      if (!order.itemPedido) return;
      order.itemPedido.forEach(item => {
        if (!item.itemPedido) return;
        Object.entries(item.itemPedido).forEach(([catKey, catData]) => {
          if (!totals[catKey]) totals[catKey] = 0;

          const catTotal = (catData.pedido || []).reduce((acc, prod) => {
            return acc + ((prod.cantidad || 0) * (prod.precio || prod.precioUnitario || 0));
          }, 0);

          totals[catKey] += catTotal;
          grandTotal += catTotal;

          if (catData.pedido) {
            allItems.push(...catData.pedido);
          }
        });
      });
    });

    const user = userOrders[0]?.user || {};
    setSelectedUserDetail({ user, totals, grandTotal, allItems });
    setShowDetailModal(true);
  };

  useEffect(() => {
    startLoadingPedidos();
  }, [])


  return (
    <LayoutApp>
      <div>
        <div className='container'>
          <div className="card shadow-none p-3 mb-5 rounded">
            {/* header */}
            <div className="card-header bg-white py-3">
              <div className="row align-items-center">
                <div className="col-12 col-md-6 mb-2 mb-md-0">
                  <h5 className="m-0 font-weight-bold text-primary text-center text-md-start">Listado de cuentas por estado</h5>
                </div>
                <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end flex-wrap">
                  <Button variant='danger-outline' className='btn btn-sm d-flex align-items-center gap-2 btn-outline-success m-1' onClick={handleDownloadCsv}>
                    <i className="fa-solid fa-file-csv"></i>
                    <span>Descargar CSV</span>
                  </Button>
                  <Button variant='danger-outline' className='btn btn-sm d-flex align-items-center gap-2 btn-outline-danger m-1' onClick={handleDownloadPDF}>
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>Descargar PDF</span>
                  </Button>
                </div>
              </div>
            </div>
            <Fila className="p-3 justify-content-between">
              {/* Columna para el Select */}
              <div className="col-12 col-md-3 mb-3 mb-md-0">
                <label htmlFor="estadoSelect" className="form-label fw-semibold">Filtrar por estado:</label>
                <select
                  id="estadoSelect"
                  className="form-select"
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
              {/* Columna para el input */}
              <div className="col-12 col-md-5">
                <label htmlFor="estadoSelect" className="form-label fw-semibold">Buscar:</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filtro (Fecha, Cliente)"
                    value={search}
                    onChange={handleSearch}
                  />
                  <div className="input-group-append">
                    <button className="btn border" type="button">
                      <i className="fas fa-search fa-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </Fila>
            <Fila className='justify-content-between'>
              {/* Columna para el select cantidad items a mostrar */}
              <div className="col-12 col-md-3 align-items-center mb-2 mb-md-0">

                <div className="input-group form-select-sm">
                  <span className='m-2'>Año a filtrar</span>
                  <select
                    className="form-select form-select-sm w-auto"
                    title='Filtro por año'
                    value={fechaPedido}
                    style={{ maxWidth: 'fit-content' }}
                    onChange={e => {
                      const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                      setFechaPedido(value);
                      pagination.fns.onSetPage(0);
                    }}
                  >
                    <option value={'2025'}>2025</option>
                    <option value={'2024'}>2024</option>
                    <option value={'2023'}>2023</option>
                    <option value={'2022'}>2022</option>
                    <option value={'2021'}>2021</option>
                    <option value={'2020'}>2020</option>
                    <option value={'2019'}>2019</option>
                    <option value={'2018'}>2018</option>
                    <option value={'2017'}>2017</option>
                  </select>
                </div>
              </div>
              {/* Columna para el select cantidad items a mostrar */}
              <div className="col-12 col-md-2 align-items-center m-1 text-md-end">
                <div className="input-group form-select-sm justify-content-md-end">
                  <span className='m-2'>
                    Items
                  </span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={itemsMostrar}
                    title='Cantidad de items a mostrar'
                    style={{ maxWidth: 'fit-content' }}
                    onChange={e => {
                      const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                      setItemsMostrar(value);
                      pagination.fns.onSetPage(0);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={100000}>Todos</option>
                  </select>
                </div>
              </div>
            </Fila>
            <div
              ref={modalRef}
              className="table-responsive"
            >
              <div className='text-center fs-4'>
                <div className="alert alert-primary" role="alert">
                  <span className='fw-semibold'></span>
                  <span className='fw-semibold'>Listado de cuentas por cobrar</span>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="d-block d-md-none">
                {filteredData.nodes.map((item, index) => (
                  <div key={index} className="card mb-3 shadow-sm" onClick={() => abrirModalDetalle(item)}>
                    <div className="card-header d-flex justify-content-between align-items-center bg-light">
                      <span className="fw-bold text-primary">{item.cliente.nombre}</span>
                      <small className="text-muted">{limpiarFecha(item.fechaCreacion)}</small>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Remisión:</span>
                        <span className="fw-semibold">{(item.pedido_id).slice(-6)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Ciudad:</span>
                        <span>{(item.cliente?.ciudad).toUpperCase()}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Items:</span>
                        <span>{calcularTotalesPedidoCxC(item).totalItems}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Total:</span>
                        <span className="fs-5 fw-bold text-success">{formatearPrecio(calcularTotalesPedidoCxC(item).total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="d-none d-md-block">
                <Table
                  className="table table-hover text-start w-100 compact-table"
                  style={{ maxWidth: "100%" }}
                  data={filteredData}
                  theme={theme}
                  pagination={pagination}
                  sort={sort}
                >
                  {(tableList) => (
                    <>
                      <Header>
                        {/* Fila de encabezados de la tabla */}
                        <HeaderRow className="text-center"
                          style={{ background: 'red' }}
                        >
                          <HeaderCellSort sortKey="FECHA" className="text-center fw-semibold">Fecha</HeaderCellSort>
                          <HeaderCellSort className="text-center fw-semibold">Ver remisión</HeaderCellSort>
                          <HeaderCellSort sortKey="CLIENTE" className="text-center fw-semibold">Cliente</HeaderCellSort>
                          <HeaderCellSort className="text-center fw-semibold">Ciudad</HeaderCellSort>
                          <HeaderCellSort sortKey="CANTIDAD" className="text-center fw-semibold">Items</HeaderCellSort>
                          <HeaderCellSort sortKey="TOTAL" className="text-center fw-semibold">Total $</HeaderCellSort>
                        </HeaderRow>
                      </Header>

                      <Body>
                        {tableList.map((item, index) => (
                          <Row key={index} item={item}>
                            <Cell title={item.fechaCreacion}>{limpiarFecha(item.fechaCreacion)}</Cell>
                            <Cell className="cursor-pointer"
                              onClick={() => abrirModalDetalle(item)}
                            ><button className="btn btn-xs">{(item.pedido_id).slice(-6)}</button></Cell>
                            <Cell title={item.cliente.nombre}>{item.cliente.nombre}</Cell>
                            <Cell title={item.ciudad?.ciudad}>{(item.cliente?.ciudad).toUpperCase()}</Cell>
                            <Cell className='text-center' title={item.cliente.nombre}>{(calcularTotalesPedidoCxC(item).totalItems)}</Cell>
                            <Cell className='text-end fw-semibold' title={item.cliente.nombre}>{formatearPrecio(calcularTotalesPedidoCxC(item).total)}</Cell>
                          </Row>

                        ))}
                        <Row>
                          <Cell></Cell>
                          <Cell></Cell>
                          <Cell></Cell>
                          <Cell colSpan={3} className="text-end fw-semibold">Total CXC:</Cell>
                          <Cell className="text-end fw-bold">
                            {formatearPrecio(filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0))}
                          </Cell>
                        </Row>
                      </Body>
                    </>
                  )}
                </Table>
              </div>
              <div className="d-flex flex-column flex-md-row justify-content-between width-99">
                <span className="fw-semibold mb-2 mb-md-0">Total registros: {filteredData.nodes.length}</span>
                <span className="fw-semibold mb-2 mb-md-0">Páginas: {pagination.state.getTotalPages(filteredData.nodes)}</span>
                <span className="d-flex flex-wrap align-items-center">
                  Página:{" "}
                  {pagination.state.getPages(filteredData.nodes).map((_, index) => (
                    <button
                      className={(pagination.state.page === index) ? 'btn btn-secondary btn-sm m-1 border' : 'btn btn-light btn-sm m-1 border'}
                      key={index}
                      type="button"
                      style={{
                        fontWeight: pagination.state.page === index ? "bold" : "normal",
                      }}
                      onClick={() => pagination.fns.onSetPage(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='container'>
          <div className="card">
            <div className="card-header text-center fw-semibold text-gray-800">Total cuentas por cobrar: {formatearPrecio(filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0))}</div>
            <div className="card-body">
              <div className="progress-stacked ">
                <div className="progress" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.guantes[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-primary" title={`${buscarNombre('GB')}: (${formatearPrecio(totalesAgrupados.guantes[0])}) ${`${parseInt((totalesAgrupados.guantes[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>GB {`${parseInt((totalesAgrupados.guantes[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.guantes[1] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-success" title={`${buscarNombre('GN')}: (${formatearPrecio(totalesAgrupados.guantes[1])}) ${`${parseInt((totalesAgrupados.guantes[1] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>GN {`${parseInt((totalesAgrupados.guantes[1] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.guantes[2] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-info" title={`${buscarNombre('GM')}: (${formatearPrecio(totalesAgrupados.guantes[2])}) ${`${parseInt((totalesAgrupados.guantes[2] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>GM {`${parseInt((totalesAgrupados.guantes[2] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.kits[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-danger" title={`${buscarNombre('KCG')}: ${`${parseInt((totalesAgrupados.kits[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>KCG {`${parseInt((totalesAgrupados.kits[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.kits[1] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-warning" title={`${buscarNombre('KCP')}: ${`${parseInt((totalesAgrupados.kits[1] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>KCP {`${parseInt((totalesAgrupados.kits[1] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.kits[4] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-light text-black" title={`${buscarNombre('KCE')}: ${`${parseInt((totalesAgrupados.kits[5] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>KCE {`${parseInt((totalesAgrupados.kits[5] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="secondary" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.kits[2] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-secondary" title={`${buscarNombre('KB')}: ${`${parseInt((totalesAgrupados.kits[2] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>KB {`${parseInt((totalesAgrupados.kits[2] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="black" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.kits[3] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-black" title={`${buscarNombre('CC')}: ${`${parseInt((totalesAgrupados.kits[3] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>CC {`${parseInt((totalesAgrupados.kits[3] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.kits[4] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-orange" title={`${buscarNombre('CB')}: ${`${parseInt((totalesAgrupados.kits[4] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>CB {`${parseInt((totalesAgrupados.kits[4] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
                <div className="progress" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{ width: `${(totalesAgrupados.otros * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0)}%` }}>
                  <div className="progress-bar fw-bold bg-indigo" title={`${buscarNombre('OTROS')}: ${`${parseInt((totalesAgrupados.otros * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>OTROS {`${parseInt((totalesAgrupados.otros * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
                </div>
              </div>
            </div>
            <div className="card-footer text-muted">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr className='small'>
                      <td style={{ borderBottom: '3px solid #0d6efd' }}>GB: {formatearPrecio(totalesAgrupados.guantes[0])}</td>
                      <td style={{ borderBottom: '3px solid #198754' }}>GN: {formatearPrecio(totalesAgrupados.guantes[1])}</td>
                      <td style={{ borderBottom: '3px solid #0dcaf0' }}>GM: {formatearPrecio(totalesAgrupados.guantes[2])}</td>
                      <td style={{ borderBottom: '3px solid #dc3545' }}>KCG: {formatearPrecio(totalesAgrupados.kits[0])}</td>
                      <td style={{ borderBottom: '3px solid #ffc107' }}>KCP: {formatearPrecio(totalesAgrupados.kits[1])}</td>
                      <td style={{ borderBottom: '3px solid #f00db7ff' }}>KCE: {formatearPrecio(totalesAgrupados.kits[5])}</td>
                      <td style={{ borderBottom: '3px solid #6c757d' }}>KB: {formatearPrecio(totalesAgrupados.kits[2])}</td>
                      <td style={{ borderBottom: '3px solid #000' }}>CC: {formatearPrecio(totalesAgrupados.kits[3])}</td>
                      <td style={{ borderBottom: '3px solid orange' }}>CB: {formatearPrecio(totalesAgrupados.kits[4])}</td>
                      <td style={{ borderBottom: '3px solid indigo' }}>OTROS: {formatearPrecio(totalesAgrupados.otros)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <br />
              <div className="table-responsive">
                <table className='border w-100 text-center rounded'>
                  <tbody>
                    <tr className='fw-semibold'>
                      <td style={{ borderBottom: '3px solid #0d6efd', minWidth: '150px' }}>TOTAL GUANTES: {formatearPrecio((totalesAgrupados.guantes[0]) + (totalesAgrupados.guantes[1]) + (totalesAgrupados.guantes[2]))}</td>
                      <td style={{ borderBottom: '3px solid #dc3545', minWidth: '150px' }}>TOTAL KITS: {formatearPrecio((totalesAgrupados.kits[0]) + (totalesAgrupados.kits[1]) + (totalesAgrupados.kits[2]) + (totalesAgrupados.kits[3]) + (totalesAgrupados.kits[4]) + (totalesAgrupados.kits[5]))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container mt-4 text-center'>
        <div className="card shadow border-1">
          <table class="table table-sm table-hover border" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th colSpan="5">Resumen general ventas {new Date().getFullYear()}</th>
              </tr>
              <tr>
                <th>Estado</th>
                <th className="text-end">Guantes</th>
                <th className="text-end">Kits</th>
                <th className="text-end">Otros</th>
                <th className="text-end">Total ($)</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              {['entregado', 'pendiente', 'pagado', 'enviado', 'preparado', 'devuelto', 'anulado'].map((estadoIteracion) => {
                const pedidosUsuario = pedidos.filter(p => p.user._id === user.uid && p.estado === estadoIteracion);
                const totalesUsuario = calcularTotalesAgrupados(pedidosUsuario);
                const totalGuantes = totalesUsuario.guantes.reduce((a, b) => a + b, 0);
                const totalKits = totalesUsuario.kits.reduce((a, b) => a + b, 0);
                const totalGeneral = totalGuantes + totalKits + totalesUsuario.otros;

                return (
                  <tr key={estadoIteracion}>
                    <td className="text-capitalize text-center">{estadoIteracion}</td>
                    <td className="text-end">{formatearPrecio(totalGuantes)}</td>
                    <td className="text-end">{formatearPrecio(totalKits)}</td>
                    <td className="text-end">{formatearPrecio(totalesUsuario.otros)}</td>
                    <td className="text-end fw-bold">{formatearPrecio(totalGeneral)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card mt-4">
          <table className="table table-hover table-sm mt-4"
            style={{ fontSize: '12px' }}
          >
            <thead className="bg-light">
              <tr>
                <th>Usuario</th>
                <th className="text-center">Pedidos</th>
                <th className="text-center">Items</th>
                <th className="text-end">Guantes</th>
                <th className="text-end">Kits</th>
                <th className="text-end">Otros</th>
                <th className="text-end">Total Venta</th>
                <th className="text-center">Acciones</th>
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
                    // Consider adding a property here if table size was dynamically controlled by this data,
                    // e.g., tableSize: 'sm' or isSmallTable: true,
                    // but for static Bootstrap classes, modifications are made directly on the <table> elements.
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
                    <td>
                      <div className="fw-semibold">{userSummary.user.nombre || userSummary.user.email}</div>
                      <small className="text-muted">{userSummary.user.email}</small>
                    </td>
                    <td className="text-center align-middle">{userSummary.count}</td>
                    <td className="text-center align-middle">{userSummary.totalItems}</td>
                    <td className="text-end align-middle">{formatearPrecio(totalGuantes)}</td>
                    <td className="text-end align-middle text-danger">{formatearPrecio(totalKits)}</td>
                    <td className="text-end align-middle text-secondary">{formatearPrecio(categorias.otros)}</td>
                    <td className="text-end align-middle fw-bold text-success">{formatearPrecio(userSummary.totalVenta)}</td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => handleViewDetail(userSummary.user._id)}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
    </LayoutApp >
  );
}
