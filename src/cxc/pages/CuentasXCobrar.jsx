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
import { Row as Fila } from 'react-bootstrap';

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
  const [itemsMostrar, setItemsMostrar] = useState(10);

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
                  auto auto auto auto auto !important;
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
      kits: [0, 0, 0, 0, 0], // KCG, KCP, KB, CC, CB
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

  useEffect(() => {
    startLoadingPedidos();
  }, [])


  return (
    <LayoutApp>
      <div className='container'>
        <div className="card shadow-none p-3 mb-5 rounded">
          {/* header */}
          <div className="card-header bg-white py-3">
            <div className="row">
              <div className="col-md-6">
                <h5 className="m-0 font-weight-bold text-primary">Listado de cuentas por estado</h5>
              </div>
              <div className="col-md-6 d-flex justify-content-end">
                <button className='btn btn-sm d-flex align-items-center gap-2 btn-outline-danger' onClick={handleDownloadPDF}>
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>
          </div>
          <Fila className="p-3 justify-content-between">
            {/* Columna para el Select */}
            <div className="col-3">
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
            <div className="col-md-5">
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
            <div className="col-3 align-items-center">

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
            <div className="col-md-2 align-items-center m-1 text-end">
              <div className="input-group form-select-sm">
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
                      <HeaderCellSort className="text-center fw-semibold">Remisión</HeaderCellSort>
                      <HeaderCellSort sortKey="CLIENTE" className="text-center fw-semibold">Cliente</HeaderCellSort>
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
                        >{(item.pedido_id).slice(-6)}</Cell>
                        <Cell title={item.cliente.nombre}>{item.cliente.nombre}</Cell>
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
            <div style={{ display: "flex", justifyContent: "space-between", width: "99%" }}>
              <span className="fw-semibold">Total registros: {filteredData.nodes.length}</span>
              <span className="fw-semibold">Páginas: {pagination.state.getTotalPages(filteredData.nodes)}</span>
              <span>
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
                <div className="progress-bar fw-bold bg-primary" title={`${buscarNombre('GB')}: (${formatearPrecio(totalesAgrupados.guantes[0])}) ${`${parseInt((totalesAgrupados.guantes[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}`}>GN {`${parseInt((totalesAgrupados.guantes[0] * 100) / filteredData.nodes.reduce((acc, item) => acc + calcularTotalesPedidoCxC(item).total, 0), 10)}%`}</div>
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
            <table className="table table-sm mb-0">
              <tbody>
                <tr className='small'>
                  <td style={{ borderBottom: '3px solid #0d6efd' }}>GB: {formatearPrecio(totalesAgrupados.guantes[0])}</td>
                  <td style={{ borderBottom: '3px solid #198754' }}>GN: {formatearPrecio(totalesAgrupados.guantes[1])}</td>
                  <td style={{ borderBottom: '3px solid #0dcaf0' }}>GM: {formatearPrecio(totalesAgrupados.guantes[2])}</td>
                  <td style={{ borderBottom: '3px solid #dc3545' }}>KCG: {formatearPrecio(totalesAgrupados.kits[0])}</td>
                  <td style={{ borderBottom: '3px solid #ffc107' }}>KCP: {formatearPrecio(totalesAgrupados.kits[1])}</td>
                  <td style={{ borderBottom: '3px solid #6c757d' }}>KB: {formatearPrecio(totalesAgrupados.kits[2])}</td>
                  <td style={{ borderBottom: '3px solid #000' }}>CC: {formatearPrecio(totalesAgrupados.kits[3])}</td>
                  <td style={{ borderBottom: '3px solid orange' }}>CB: {formatearPrecio(totalesAgrupados.kits[4])}</td>
                  <td style={{ borderBottom: '3px solid indigo' }}>OTROS: {formatearPrecio(totalesAgrupados.otros)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ModalDetallePedido
        show={showModal}
        setShow={setShowModal}
        pedido={pedido}
      />
    </LayoutApp>
  );
}
