import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from "@table-library/react-table-library/pagination";
import { useAuthStore, useFuntions, usePedidosStore, useClientesStore } from '../../hooks';
import { getVisiblePageNumbers } from '../../helpers';
import { useState, useMemo } from 'react';
import { ModalImprimirPedido } from './modals/ModalImprimirPedido';
import { ModalEditarPedido } from './modals/ModalEditarPedido';
import { ModalCopiarPedido } from './modals/ModalCopiarPedido';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Col, Row as BootstrapRow } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import { useSelector } from 'react-redux';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";


export const ListarPedidos = ({ editarPedido, eliminarPedido, detallePedido, abrirModalImprimir, abrirModalGuia }) => {
  const { user } = useAuthStore();
  const esPlanta = String(user?.rol || '').toLowerCase().trim() === 'planta';
  const navegar = useNavigate();
  const [search, setSearch] = useState("");
  const { capitalize, limpiarFecha, fechaCorta, convertirFechaIngles, aTitulo, formatearPrecio, calcularTotalesPedidoCxC } = useFuntions();
  const [filtroDistribuidor, setFiltroDistribuidor] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const anioEnCurso = new Date().getFullYear();
  const aniosDisponibles = useMemo(() => {
    const list = [];
    for (let y = anioEnCurso; y >= 2025; y--) {
      list.push(String(y));
    }
    return list;
  }, [anioEnCurso]);

  const [fechaPedido, setFechaPedido] = useState(String(anioEnCurso));
  const [itemsMostrar, setItemsMostrar] = useState(esPlanta ? 30 : 20);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [pedidoEditar, setPedidoEditar] = useState(null);

  const { clientes, setClienteActivo } = useClientesStore();
  const { getPedidosCliente } = usePedidosStore();

  const [showModalCopiar, setShowModalCopiar] = useState(false);
  const [pedidoCopiar, setPedidoCopiar] = useState(null);

  const abrirModalEditar = (pedido) => {
    if (pedido.estado !== 'pendiente') {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'Solo se pueden editar pedidos que se encuentren en estado pendiente.'
      });
      return;
    }
    setPedidoEditar(pedido);
    setShowModalEditar(true);
  };

  const abrirModalCopiar = (pedido) => {
    setPedidoCopiar(pedido);
    setShowModalCopiar(true);
  };

  const clienteCompletoCopiar = useMemo(() => {
    if (!pedidoCopiar) return null;
    const cid = pedidoCopiar.cliente?.cliente_id || pedidoCopiar.cliente?._id || (typeof pedidoCopiar.cliente === 'string' ? pedidoCopiar.cliente : '');
    return (clientes || []).find(c => (c.cliente_id || c._id) === cid) || pedidoCopiar.cliente;
  }, [pedidoCopiar, clientes]);

  const confirmarCopia = (pedido, resumenCalculado) => {
    setShowModalCopiar(false);

    const cid = pedido.cliente?.cliente_id || pedido.cliente?._id || (typeof pedido.cliente === 'string' ? pedido.cliente : '');
    const clienteEncontrado = (clientes || []).find(c => (c.cliente_id || c._id) === cid) || pedido.cliente;
    const clienteParaActivo = {
      ...clienteEncontrado,
      cliente_id: cid,
      _id: cid
    };

    // Extraer y clonar la estructura de items del pedido original
    let rawItems = {};
    if (pedido.itemPedido && Array.isArray(pedido.itemPedido) && pedido.itemPedido.length > 0) {
      const block = pedido.itemPedido[0];
      rawItems = block.itemPedido || block || {};
    } else if (pedido.itemPedido && typeof pedido.itemPedido === 'object') {
      rawItems = pedido.itemPedido.itemPedido || pedido.itemPedido || {};
    }

    const itemsClonados = JSON.parse(JSON.stringify(rawItems));

    // Obtener las tarifas vigentes del cliente
    const pKits = clienteParaActivo?.precios?.precioKits || {};
    const pCirios = clienteParaActivo?.precios?.precioCirios || {};
    const pGuantes = clienteParaActivo?.precios?.precioGuantes || {};

    // Actualizar precios de cada ítem a las tarifas vigentes del cliente
    Object.entries(itemsClonados).forEach(([catKey, catData]) => {
      const catCode = String(catKey).toUpperCase().trim();
      if (!Array.isArray(catData?.pedido)) return;

      catData.pedido = catData.pedido.map(item => {
        let precioNuevo = Number(item.precioUnitario || item.precio) || 0;

        if (catCode === 'KCG' && pKits.kcg) precioNuevo = Number(pKits.kcg);
        else if (catCode === 'KCP' && pKits.kcp) precioNuevo = Number(pKits.kcp);
        else if (catCode === 'KCE' && pKits.kce) precioNuevo = Number(pKits.kce);
        else if (catCode === 'KB' && pKits.kb) precioNuevo = Number(pKits.kb);
        else if (catCode === 'CC' && pCirios.cc) precioNuevo = Number(pCirios.cc);
        else if (catCode === 'CCON' && (pCirios.ccon || pCirios.cc || pCirios.cb)) precioNuevo = Number(pCirios.ccon || pCirios.cc || pCirios.cb);
        else if (catCode === 'CB' && pCirios.cb) precioNuevo = Number(pCirios.cb);
        else if (catCode === 'GUANTES' || catCode === 'GUA') {
          const catG = String(item.categoria || '').toUpperCase().trim();
          if (catG.includes('BLANC') && pGuantes.gb) precioNuevo = Number(pGuantes.gb);
          else if (catG.includes('NEGR') && pGuantes.gn) precioNuevo = Number(pGuantes.gn);
          else if (catG.includes('MIT') && pGuantes.gm) precioNuevo = Number(pGuantes.gm);
          else if (pGuantes.gb) precioNuevo = Number(pGuantes.gb);
        }

        return {
          ...item,
          precioUnitario: precioNuevo,
          precio: precioNuevo
        };
      });
    });

    // Establecer cliente activo en el store
    setClienteActivo(clienteParaActivo);
    if (cid) {
      getPedidosCliente(cid);
    }

    // Navegar a la pantalla de crear pedidos pasando el pedido clonado con fecha actual y formato listo
    navegar('/pedidos', {
      state: {
        pedidoCopiado: {
          cliente: clienteParaActivo,
          info: {
            costoEnvio: Number(pedido.costoEnvio) || 0,
            tipoDespacho: pedido.tipoDespacho || 'punto',
            formaPago: pedido.formaPago || 'credito',
            detalleGeneral: pedido.detalleGeneral || ''
          },
          listadoPedido: itemsClonados,
          pedidoOriginalId: pedido.pedido_id
        }
      }
    });
  };


  const pedidos = useSelector(state => state.pedidos.pedidos);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };
  // Ordenar el listado de pedidos
  const data = {
    nodes: [...pedidos]
      .filter((pedido) => {
        // Validar que la fecha sea utilizable
        return pedido.fechaCreacion;
      })
      .filter((pedido) => {
        if (!fechaPedido || fechaPedido === 'todos') return true;
        const str = String(pedido.fechaCreacion || '');
        return str.toLowerCase().includes(String(fechaPedido).toLowerCase());
      })
      .sort((a, b) => {
        // Convertir las fechas para ordenarlas
        const fechaA = convertirFechaIngles(a.fechaCreacion);
        const fechaB = convertirFechaIngles(b.fechaCreacion);

        return fechaB - fechaA; // Ordenar de más reciente a más antigua
      })
      .map((pedido) => ({
        ...pedido,
        id: pedido.pedido_id || pedido._id, // Identificador único
      })),
  };

  const filteredData = {
    nodes: data.nodes.filter((item) => {
      // Filtrar por rol "planta": únicamente pedidos en estado "pendiente" para alistar
      const matchesPlanta =
        esPlanta
          ? item.estado === "pendiente"
          : user.rol === "vendedor"
            ? item.user._id === user.uid
            : true;

      const matchesEstado =
        filtroEstado === 'todos' || (item.estado && item.estado.toLowerCase() === filtroEstado.toLowerCase());

      const totalFacturaVal = (!esPlanta && calcularTotalesPedidoCxC) ? calcularTotalesPedidoCxC(item).total : 0;
      const searchNumerico = search.replace(/\D/g, '');

      // Condiciones del filtro existente
      const matchesSearch =
        item.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.fechaCreacion.toLowerCase().includes(search.toLowerCase()) ||
        item.cliente.ciudad.toLowerCase().includes(search.toLowerCase()) ||
        item.estado.toLowerCase().includes(search.toLowerCase()) ||
        item.pedido_id.toLowerCase().includes(search.toLowerCase()) ||
        item.user.name.toLowerCase().includes(search.toLowerCase()) ||
        (!esPlanta && (
          (searchNumerico.length >= 3 && totalFacturaVal.toString().includes(searchNumerico)) ||
          formatearPrecio(totalFacturaVal).toLowerCase().includes(search.toLowerCase())
        )) ||
        item.itemPedido.some(p =>
          p.itemPedido && Object.keys(p.itemPedido).some(key =>
            key.toLowerCase().includes(search.toLowerCase())
          )
        );

      const matchesDistribuidor =
        filtroDistribuidor === null ||
        item.cliente.distribuidor === filtroDistribuidor;

      // Combinar todos los filtros
      return matchesPlanta && matchesSearch && matchesDistribuidor && matchesEstado;
    }),
  };

  const conteoPorEstado = {
    todos: data.nodes.length,
    pendiente: data.nodes.filter(p => p.estado === 'pendiente').length,
    preparado: data.nodes.filter(p => p.estado === 'preparado').length,
    enviado: data.nodes.filter(p => p.estado === 'enviado').length,
    entregado: data.nodes.filter(p => p.estado === 'entregado').length,
    pagado: data.nodes.filter(p => p.estado === 'pagado').length,
  };

  const sort = useSort(
    data,
    {
      onChange: onSortChange,
    },
    {
      sortFns: {
        FECHA: (array) => array.sort((a, b) => convertirFechaIngles(a.fechaCreacion) - convertirFechaIngles(b.fechaCreacion)),
        CLIENTE: (array) => array.sort((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre)),
        CIUDAD: (array) => array.sort((a, b) => a.cliente.ciudad.localeCompare(b.cliente.ciudad)),
        ESTADO: (array) => array.sort((a, b) => a.estado.localeCompare(b.estado)),
        TOTAL: (array) => array.sort((a, b) => (calcularTotalesPedidoCxC(a).total) - (calcularTotalesPedidoCxC(b).total)),
      },
    }
  );

  function onSortChange(action, state) {
  }

  const marginTheme = {
    BaseCell: `
        padding: 6px 8px !important;
        vertical-align: middle !important;
      `,
    HeaderCell: `
        padding: 8px !important;
        background-color: #f8fafc !important;
        color: #475569 !important;
        font-weight: 600 !important;
        font-size: 0.8rem !important;
        border-bottom: 2px solid #e2e8f0 !important;
    `,
  };
  const sizeColumnTheme = !esPlanta ? {
    Table: `
        --data-table-library_grid-template-columns: 
             max-content  
             max-content  
             minmax(170px, 1.2fr) 
             max-content  
             max-content  
             minmax(190px, 1.2fr) 
             max-content  
             max-content !important; 
    `,
  }
    : {
      Table: `
        --data-table-library_grid-template-columns: 
             max-content
             max-content
             max-content
             minmax(150px, 1.2fr)
             max-content
             max-content
             max-content
             minmax(180px, 1.2fr)
             max-content !important;
    `,
    };
  const theme = useTheme(
    [marginTheme, sizeColumnTheme]
  );
  // Columnas con renderizado personalizado\
  const pagination = usePagination(filteredData, {
    state: {
      page: 0,
      size: itemsMostrar,
    },
  });

  // Cambiar el filtro desde un select
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFiltroDistribuidor(value === 'all' ? null : value === 'true');
  };

  const renderItemsTooltip = (item) => {
    // Crear un mapa para agrupar las cantidades por categoría
    const categorias = {};
    let totalProductos = 0;

    // Iterar sobre los pedidos en item.itemPedido
    item.itemPedido.forEach((pedido) => {
      for (const tipoProducto in pedido.itemPedido) {
        const producto = pedido.itemPedido[tipoProducto];

        // Verificar si la categoría es "OTR"
        if (tipoProducto === "OTR" && producto.pedido) {
          // Manejar la categoría "OTR"
          producto.pedido.forEach((detalle) => {
            const cantidad = parseInt(detalle.cantidad, 10); // Convertir cantidad a número
            if (!categorias[tipoProducto]) {
              categorias[tipoProducto] = 0;
            }
            categorias[tipoProducto] += cantidad;
            totalProductos += cantidad;
          });
        } else if (tipoProducto === "GUANTES" && producto.pedido) {
          // Manejar la categoría "GUANTES" por subcategorías
          producto.pedido.forEach((detalle) => {
            const cantidad = parseInt(detalle.cantidad, 10);
            const subCategoria = detalle.categoria; // Ej: BLANCOS, NEGROS
            const nombreCategoria = `G${subCategoria.charAt(0)}`;

            if (!categorias[nombreCategoria]) {
              categorias[nombreCategoria] = 0;
            }
            categorias[nombreCategoria] += cantidad;
            totalProductos += cantidad;
          });
        } else if (producto.pedido) {
          // Manejar las demás categorías
          producto.pedido.forEach((detalle) => {
            const cantidad = parseInt(detalle.cantidad, 10); // Convertir cantidad a número
            if (!categorias[tipoProducto]) {
              categorias[tipoProducto] = 0;
            }
            categorias[tipoProducto] += cantidad;
            totalProductos += cantidad;
          });
        }
      }
    });

    const entries = Object.entries(categorias);
    const tooltipText = entries
      .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
      .join(", ");

    const renderTooltip = (props) => (
      <Tooltip id={`tooltip-${item.id}`} {...props}>
        {tooltipText || "Sin items"}
      </Tooltip>
    );

    return { totalProductos, tooltipText, renderTooltip, categoriasList: entries };
  };

  return (
    <div className="card border border-light-subtle shadow-sm rounded-4 p-3 bg-white">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="mb-0 fw-bold text-dark">
            <i className="fas fa-boxes-stacked me-2 text-primary"></i>Listado de Pedidos
          </h5>
          <small className="text-muted">Control operativo, despacho y seguimiento de entregas</small>
        </div>
        {!esPlanta && (
          <div>
            <button
              className="btn btn-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-2"
              type="button"
              onClick={() => navegar('/pedidos')}
            >
              <i className="fa fa-plus-circle"></i>
              <span>Nuevo Pedido</span>
            </button>
          </div>
        )}
      </div>

      {/* PESTAÑAS DE FILTRO RÁPIDO POR ESTADO (SOLO ADMIN Y VENTAS) */}
      {!esPlanta && (
        <div className="scroll-horizontal-touch d-flex align-items-center gap-1 mb-3">
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroEstado === 'todos' ? 'btn-primary shadow-xs' : 'btn-light border'}`}
            onClick={() => { setFiltroEstado('todos'); pagination.fns.onSetPage(0); }}
          >
            Todos <span className="badge bg-white text-dark ms-1">{conteoPorEstado.todos}</span>
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroEstado === 'pendiente' ? 'btn-warning text-dark fw-bold shadow-xs' : 'btn-light border'}`}
            onClick={() => { setFiltroEstado('pendiente'); pagination.fns.onSetPage(0); }}
          >
            <i className="fas fa-clock me-1 text-warning"></i>Pendientes <span className="badge bg-warning-subtle text-dark ms-1">{conteoPorEstado.pendiente}</span>
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroEstado === 'preparado' ? 'btn-info text-white shadow-xs' : 'btn-light border'}`}
            onClick={() => { setFiltroEstado('preparado'); pagination.fns.onSetPage(0); }}
          >
            <i className="fas fa-boxes-packing me-1"></i>Preparados <span className="badge bg-info-subtle text-dark ms-1">{conteoPorEstado.preparado}</span>
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroEstado === 'enviado' ? 'btn-secondary text-white shadow-xs' : 'btn-light border'}`}
            onClick={() => { setFiltroEstado('enviado'); pagination.fns.onSetPage(0); }}
          >
            <i className="fas fa-truck me-1"></i>Enviados <span className="badge bg-secondary-subtle text-dark ms-1">{conteoPorEstado.enviado}</span>
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroEstado === 'entregado' ? 'btn-success text-white shadow-xs' : 'btn-light border'}`}
            onClick={() => { setFiltroEstado('entregado'); pagination.fns.onSetPage(0); }}
          >
            <i className="fas fa-handshake me-1"></i>Entregados <span className="badge bg-success-subtle text-dark ms-1">{conteoPorEstado.entregado}</span>
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroEstado === 'pagado' ? 'btn-dark text-white shadow-xs' : 'btn-light border'}`}
            onClick={() => { setFiltroEstado('pagado'); pagination.fns.onSetPage(0); }}
          >
            <i className="fas fa-dollar-sign me-1"></i>Pagados <span className="badge bg-light text-dark ms-1">{conteoPorEstado.pagado}</span>
          </button>
        </div>
      )}

      <BootstrapRow className="justify-content-between align-items-center mb-2 g-2">
        <div className="col-12 col-md-4">
          <select
            className="form-select form-select-sm rounded-3"
            onChange={handleFilterChange}
          >
            <option value="all">Todos los clientes (Distribuidor / Particular)</option>
            <option value="true">Solo Distribuidores</option>
            <option value="false">Solo Particulares / No Distribuidores</option>
          </select>
        </div>
        <div className="col-12 col-md-8">
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control rounded-start-3 ps-3"
              placeholder="Buscar por ID, cliente, ciudad, fecha o código de producto..."
              aria-label="Buscar pedidos"
              id="search"
              value={search}
              onChange={handleSearch}
            />
            <button className="btn btn-outline-secondary rounded-end-3" type="button">
              <i className="fas fa-search" />
            </button>
          </div>
        </div>
      </BootstrapRow>
      <BootstrapRow className='justify-content-between'>
        {/* Columna para el select cantidad items a mostrar */}
        <div className="col-6 col-md-3 align-items-center">

          <div className="input-group form-select-sm align-items-center">
            <span className='m-2 fw-semibold text-secondary small'>Año a filtrar</span>
            <select
              className="form-select form-select-sm w-auto rounded-3"
              title='Filtro por año (desde 2025 hasta el año en curso)'
              value={fechaPedido}
              style={{ maxWidth: 'fit-content' }}
              onChange={e => {
                setFechaPedido(e.target.value);
                pagination.fns.onSetPage(0);
              }}
            >
              {aniosDisponibles.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
              <option value="todos">Todos los años</option>
            </select>
          </div>
        </div>
        {/* Columna para el select cantidad items a mostrar */}
        <div className="col-6 col-md-2 align-items-center m-1 text-end">
          <div className="input-group form-select-sm justify-content-end">
            <span className='m-2'>
              Items
            </span>
            <select
              className="form-select form-select-sm w-auto"
              value={itemsMostrar}
              title="Cantidad de items a mostrar"
              style={{ maxWidth: 'fit-content' }}
              onChange={e => {
                const value =
                  e.target.value === "todos"
                    ? filteredData.nodes.length
                    : Number(e.target.value);

                setItemsMostrar(value);
                pagination.fns.onSetPage(0); // siempre regresar a la primera página
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="todos">Todos</option>
            </select>

          </div>
        </div>
      </BootstrapRow>

      <div className="table-responsive table-hover text-start w-100 compact-table">
        <Table
          data={filteredData}
          theme={theme}
          className="table table-hover text-left align-middle mb-0"
          pagination={pagination}
          layout={{ custom: true }}
          sort={sort}
        >
          {(tableList) => (
            <>
              <Header>
                <HeaderRow className="table-light">
                  {esPlanta ? (
                    <>
                      <HeaderCell className="text-center"></HeaderCell>
                      <HeaderCell className="text-center">ID</HeaderCell>
                      <HeaderCell className="text-center">Fecha</HeaderCell>
                      <HeaderCell className="text-start ps-2">Cliente</HeaderCell>
                      <HeaderCell className="text-center">Ciudad</HeaderCell>
                      <HeaderCell className="text-center">Despacho</HeaderCell>
                      <HeaderCell className="text-center">Estado</HeaderCell>
                      <HeaderCell className="text-start ps-2">Detalle Items</HeaderCell>
                      <HeaderCell className="text-center">Ver</HeaderCell>
                    </>
                  ) : (
                    <>
                      <HeaderCell className="text-center">Remisión</HeaderCell>
                      <HeaderCellSort sortKey="FECHA" className="text-center">Fecha</HeaderCellSort>
                      <HeaderCellSort sortKey="CLIENTE" className="text-start ps-2">Cliente</HeaderCellSort>
                      <HeaderCellSort sortKey="CIUDAD" className="text-center">Ciudad</HeaderCellSort>
                      <HeaderCellSort sortKey="ESTADO" className="text-center">Estado</HeaderCellSort>
                      <HeaderCell className="text-start ps-2">Detalle de Items</HeaderCell>
                      <HeaderCellSort sortKey="TOTAL" className="text-end pe-3">Total Factura ($)</HeaderCellSort>
                      <HeaderCell className="text-center">Acciones</HeaderCell>
                    </>
                  )}
                </HeaderRow>
              </Header>

              <Body>
                {tableList.map((item) => {
                  const { totalProductos, renderTooltip, categoriasList } = renderItemsTooltip(item);
                  const totalFactura = calcularTotalesPedidoCxC(item).total;
                  return (
                    <Row key={item.id} item={item}>
                      {esPlanta ? (
                        <>
                          <Cell className="text-center">
                            <div className='rounded-circle bg-primary-subtle text-primary fw-bold text-center align-items-center d-flex justify-content-center' style={{ width: '28px', height: '28px', fontSize: '0.8rem' }} title={`Vendedor: ${item.user.name}`}>
                              {item.user.name.slice(0, 1).toUpperCase()}
                            </div>
                          </Cell>
                          <Cell className="text-center">
                            <span className='badge bg-light text-primary border border-primary-subtle rounded-pill fw-semibold'>
                              #{(item.pedido_id).slice(-6).toUpperCase()}
                            </span>
                          </Cell>
                          <Cell className="text-center small text-muted">
                            <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{fechaCorta(limpiarFecha(item.fechaCreacion))}</span>
                          </Cell>
                          <Cell className="ps-2">
                            <span className="fw-medium text-dark" title={`Cliente: ${item.cliente.nombre}`}>{aTitulo(item.cliente.nombre)}</span>
                          </Cell>
                          <Cell className="text-center">
                            <span className="badge bg-light text-dark border">{aTitulo(item.cliente.ciudad)}</span>
                          </Cell>
                          <Cell className="text-center">
                            {(() => {
                              const tipoDespacho = {
                                punto: 'E. Punto',
                                urbano: 'D. Urbano',
                                envio: 'Despacho',
                                recogida: 'E. Planta',
                              };
                              const despacho = tipoDespacho[item.tipoDespacho] || 'Desconocido';
                              return <span className="badge bg-light text-secondary border small">{despacho}</span>;
                            })()}
                          </Cell>
                          <Cell className="text-center">
                            {item.estado === 'pagado' ? (
                              <span
                                className="badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-xs"
                                style={{
                                  fontSize: '0.74rem',
                                  minWidth: '95px',
                                  justifyContent: 'center',
                                  cursor: 'not-allowed',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1'
                                }}
                                title="Pedido Pagado (Finalizado - No modificable)"
                              >
                                <i className="fas fa-lock text-muted" style={{ fontSize: '0.7rem' }}></i>
                                <span className="fw-bold">Pagado</span>
                              </span>
                            ) : (
                              <select
                                className="form-select form-select-sm rounded-pill fw-medium text-center"
                                style={{
                                  fontSize: '0.78rem',
                                  backgroundColor: item.estado === 'pendiente' ? '#fef3c7' : '#ede9fe',
                                  color: item.estado === 'pendiente' ? '#92400e' : '#6b21a8',
                                  border: '1px solid transparent'
                                }}
                                onChange={(event) => editarPedido(item, event)}
                                name={`tipoDespacho${item.pedido_id}`}
                                value={item.estado}
                                disabled={['pagado', 'devuelto', 'anulado'].includes(item.estado)}
                                title={`Estado actual: ${item.estado}`}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="preparado">Preparado</option>
                              </select>
                            )}
                          </Cell>
                          <Cell className="ps-2">
                            <OverlayTrigger placement="top" overlay={renderTooltip}>
                              <div className="d-flex align-items-center flex-wrap gap-1" style={{ maxWidth: '240px', cursor: 'pointer' }}>
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0 fw-bold" style={{ fontSize: '0.74rem' }}>
                                  {totalProductos} unds
                                </span>
                                {categoriasList.slice(0, 3).map(([cat, qty], i) => (
                                  <span key={i} className="badge bg-light text-secondary border px-1 py-0" style={{ fontSize: '0.68rem' }}>
                                    {cat}: {qty}
                                  </span>
                                ))}
                                {categoriasList.length > 3 && (
                                  <span className="badge bg-light text-muted border px-1 py-0" style={{ fontSize: '0.68rem' }}>
                                    +{categoriasList.length - 3}
                                  </span>
                                )}
                              </div>
                            </OverlayTrigger>
                          </Cell>
                          <Cell className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-circle p-1"
                              onClick={() => detallePedido(item)}
                              title="Ver detalles del pedido"
                              style={{ width: '32px', height: '32px', fontSize: '0.92rem', lineHeight: '1' }}
                            >
                              <i className="fa fa-magnifying-glass"></i>
                            </button>
                          </Cell>
                        </>
                      ) : (
                        <>
                          {/* 1. Remisión e inicial de asesor */}
                          <Cell className="text-center">
                            <div className="d-flex align-items-center gap-1">
                              <span
                                className="rounded-circle bg-primary-subtle text-primary fw-bold d-inline-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}
                                title={`Asesor: ${item.user.name}`}
                              >
                                {item.user.name.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill fw-semibold" style={{ fontSize: '0.78rem' }}>
                                #{(item.pedido_id).slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </Cell>

                          {/* 2. Fecha */}
                          <Cell className="text-center small text-muted">
                            <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{fechaCorta(limpiarFecha(item.fechaCreacion))}</span>
                          </Cell>

                          {/* 3. Cliente */}
                          <Cell className="ps-2">
                            <div className='d-flex align-items-center justify-content-between gap-1'>
                              <span className="text-start fw-medium text-dark text-truncate" style={{ maxWidth: '170px' }} title={`Cliente: ${item.cliente.nombre}`}>
                                {aTitulo(item.cliente.nombre)}
                              </span>
                              {item.cliente.distribuidor ? (
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-1 py-0" style={{ fontSize: '0.68rem' }} title="Cliente distribuidor">D</span>
                              ) : (
                                <span className="badge bg-light text-secondary border px-1 py-0" style={{ fontSize: '0.68rem' }} title="Cliente particular">U</span>
                              )}
                            </div>
                          </Cell>

                          {/* 4. Ciudad */}
                          <Cell className="text-center">
                            <button
                              className="btn btn-outline-secondary btn-sm py-0 px-2 rounded-pill"
                              style={{ fontSize: '0.74rem' }}
                              onClick={() => abrirModalGuia(item)}
                              title="Ver guía / despacho"
                            >
                              {aTitulo(item.cliente.ciudad)}
                            </button>
                          </Cell>
                          {/* 5. Estado */}
                          <Cell className="text-center">
                            {item.estado === 'pagado' ? (
                              <span
                                className="badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-xs"
                                style={{
                                  fontSize: '0.74rem',
                                  minWidth: '102px',
                                  justifyContent: 'center',
                                  cursor: 'not-allowed',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1'
                                }}
                                title="Pedido Pagado (Finalizado - No modificable)"
                              >
                                <i className="fas fa-lock text-muted" style={{ fontSize: '0.7rem' }}></i>
                                <span className="fw-bold">Pagado</span>
                              </span>
                            ) : (
                              <select
                                className="form-select form-select-sm rounded-pill fw-semibold text-center py-0"
                                style={{
                                  fontSize: '0.75rem',
                                  minWidth: '102px',
                                  backgroundColor: item.estado === 'pendiente' ? '#fef3c7' : item.estado === 'preparado' ? '#ede9fe' : item.estado === 'enviado' ? '#e0f2fe' : item.estado === 'entregado' ? '#dcfce7' : '#fee2e2',
                                  color: item.estado === 'pendiente' ? '#92400e' : item.estado === 'preparado' ? '#6b21a8' : item.estado === 'enviado' ? '#075985' : item.estado === 'entregado' ? '#166534' : '#991b1b',
                                  border: '1px solid transparent'
                                }}
                                onChange={(event) => editarPedido(item, event)}
                                name={`tipoDespacho${item.pedido_id}`}
                                value={item.estado}
                                disabled={['devuelto', 'anulado'].includes(item.estado)}
                                title={`Estado actual: ${item.estado}`}
                              >
                                {(item.estado === 'entregado') && (
                                  <>
                                    <option value="entregado">Entregado</option>
                                    <option value="pagado">Pagado</option>
                                  </>
                                )}
                                {(item.estado !== 'entregado' && item.estado !== 'enviado') && (
                                  <>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="preparado">Preparado</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="anulado">Anulado</option>
                                    <option value="devuelto">Devuelto</option>
                                    <option value="pagado">Pagado</option>
                                  </>
                                )}
                                {(item.estado === 'enviado') && (
                                  <>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="devuelto">Devuelto</option>
                                    <option value="pagado">Pagado</option>
                                  </>
                                )}
                              </select>
                            )}
                          </Cell>

                          {/* 6. Detalle de Items */}
                          <Cell className="ps-2">
                            <OverlayTrigger placement="top" overlay={renderTooltip}>
                              <div className="d-flex align-items-center flex-wrap gap-1" style={{ maxWidth: '220px', cursor: 'pointer' }}>
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0 fw-bold" style={{ fontSize: '0.74rem' }}>
                                  {totalProductos} unds
                                </span>
                                {categoriasList.slice(0, 3).map(([cat, qty], i) => (
                                  <span key={i} className="badge bg-light text-secondary border px-1 py-0" style={{ fontSize: '0.68rem' }}>
                                    {cat}: {qty}
                                  </span>
                                ))}
                                {categoriasList.length > 3 && (
                                  <span className="badge bg-light text-muted border px-1 py-0" style={{ fontSize: '0.68rem' }}>
                                    +{categoriasList.length - 3}
                                  </span>
                                )}
                              </div>
                            </OverlayTrigger>
                          </Cell>

                          {/* 7. Total ($) */}
                          <Cell className="text-end pe-3 fw-bold text-dark">
                            {formatearPrecio(totalFactura)}
                          </Cell>

                          {/* 8. Acciones */}
                          <Cell className="text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-sm btn-light border text-primary px-2 py-1"
                                style={{ fontSize: '0.92rem' }}
                                onClick={() => detallePedido(item)}
                                title="Ver detalle del pedido"
                              >
                                <i className="fa-solid fa-eye"></i>
                              </button>
                              {item.estado === 'pendiente' && (
                                <button
                                  className="btn btn-sm btn-light border text-warning px-2 py-1"
                                  style={{ fontSize: '0.92rem' }}
                                  onClick={() => abrirModalEditar(item)}
                                  title="Editar pedido (Solo en estado pendiente)"
                                >
                                  <i className="fa-solid fa-pencil"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-light border text-success px-2 py-1"
                                style={{ fontSize: '0.92rem' }}
                                onClick={() => abrirModalCopiar(item)}
                                title="Copiar este pedido a un nuevo pedido con fecha actual y tarifas vigentes"
                              >
                                <i className="fa-solid fa-copy"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-light border text-info px-2 py-1"
                                style={{ fontSize: '0.92rem' }}
                                onClick={() => abrirModalImprimir(item)}
                                title="Imprimir remisión"
                              >
                                <i className="fa fa-print"></i>
                              </button>
                              {item.estado === 'pendiente' && (
                                <button
                                  className="btn btn-sm btn-light border text-danger px-2 py-1"
                                  style={{ fontSize: '0.92rem' }}
                                  onClick={() => eliminarPedido(item)}
                                  title="Eliminar pedido"
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </Cell>
                        </>
                      )}
                    </Row>
                  );
                })}
              </Body>
            </>
          )}
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
        <div className="small text-muted">
          Mostrando {filteredData.nodes.length} pedidos • Página {pagination.state.page + 1} de {pagination.state.getTotalPages(filteredData.nodes) || 1}
        </div>
        <div className="d-flex align-items-center gap-1 flex-wrap">
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

      <ModalImprimirPedido />
      <ModalEditarPedido
        show={showModalEditar}
        handleClose={() => setShowModalEditar(false)}
        pedido={pedidoEditar}
      />
      <ModalCopiarPedido
        show={showModalCopiar}
        handleClose={() => setShowModalCopiar(false)}
        pedido={pedidoCopiar}
        clienteCompleto={clienteCompletoCopiar}
        onConfirmar={confirmarCopia}
      />
    </div >
  );
};
