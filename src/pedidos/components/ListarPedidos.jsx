import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from "@table-library/react-table-library/pagination";
import { useAuthStore, useFuntions, usePedidosStore } from '../../hooks';
import { useState } from 'react';
import { ModalImprimirPedido } from './modals/ModalImprimirPedido';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSort } from "@table-library/react-table-library/sort";
import { useSelector } from 'react-redux';


export const ListarPedidos = ({ editarPedido, eliminarPedido, detallePedido, abrirModalImprimir, abrirModalGuia }) => {
  const [search, setSearch] = useState("");
  const { capitalize, limpiarFecha, fechaCorta, convertirFechaIngles } = useFuntions();
  const [filtroDistribuidor, setFiltroDistribuidor] = useState(null);
  const { user } = useAuthStore();
  const navegar = useNavigate();
  const [fechaPedido, setFechaPedido] = useState('2025');
  const [itemsMostrar, setItemsMostrar] = useState(user.rol === "planta" ? 30 : 20);

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
      .filter((pedido) => pedido.fechaCreacion &&
        pedido.fechaCreacion.toLowerCase().includes(fechaPedido)
      )
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
      // Filtrar por rol "planta" y estado "pendiente"
      const matchesPlanta =
        user.rol === "planta"
          ? (item.estado === "pendiente" || item.estado === "preparado")
          : user.rol === "vendedor"
            ? item.user._id === user.uid
            : true;


      // Condiciones del filtro existente
      const matchesSearch =
        item.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.fechaCreacion.toLowerCase().includes(search.toLowerCase()) ||
        item.cliente.ciudad.toLowerCase().includes(search.toLowerCase()) ||
        item.estado.toLowerCase().includes(search.toLowerCase()) ||
        item.pedido_id.toLowerCase().includes(search.toLowerCase()) ||
        item.user.name.toLowerCase().includes(search.toLowerCase());

      const matchesDistribuidor =
        filtroDistribuidor === null ||
        item.cliente.distribuidor === filtroDistribuidor;

      // Combinar todos los filtros
      return matchesPlanta && matchesSearch && matchesDistribuidor;
    }),
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
      },
    }
  );

  function onSortChange(action, state) {
  }

  const marginTheme = {
    BaseCell: `
        margin: 0.5px;
        padding: 0.5px;
      `,
  };
  const sizeColumnTheme = user.rol !== "planta" ? {
    Table: `
        --data-table-library_grid-template-columns: 
             max-content  
             max-content 
             max-content  
             1fr 
             max-content
             max-content
             max-content
             max-content
             max-content
             max-content
             max-content
    `,
  }
    : {
      Table: `
        --data-table-library_grid-template-columns: 
             max-content
             max-content
             max-content
             1fr
             max-content
             max-content
             max-content
             max-content
             max-content
             max-content
    `,
    }
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

  const COLUMNS = (user.rol === "planta") ?
    [
      {
        renderCell: (item) => (
          <div className='border border-2 border-primary text-primary rounded text-center align-items-center d-flex justify-content-center' style={{ width: '30px', height: '30px', lineHeight: '30px' }}>
            <span className='fw-bold' title={`Vendedor: ${(item.user.name)}`}>{item.user.name.slice(0, 1).toUpperCase()}</span>
          </div>
        ),
      },
      {
        label: 'ID',
        renderCell: (item) => (
          <span className='fw-semibold ' title={`ID del pedido: ${(item.pedido_id)}`}>{((item.pedido_id).slice(-6).toUpperCase())}</span>
        ),
      },
      {
        label: 'Fecha',
        renderCell: (item) => (
          <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{fechaCorta(limpiarFecha(item.fechaCreacion))}</span>
        ),
      },
      {
        label: 'Cliente',
        renderCell: (item) => (
          <span title={`Cliente: ${item.cliente.nombre}`}>{item.cliente.nombre}</span>
        ),
      },
      {
        label: <i className="fa fa-location-dot"></i>,
        renderCell: (item) => (
          <div className="text-center"> <span title={`Ciudad: ${item.cliente.ciudad}`}>{(item.cliente.ciudad).toUpperCase()}</span></div>
        ),
      },
      {
        label: <i className="fa fa-truck-ramp-box"></i>,
        renderCell: (item) => {
          const tipoDespacho = {
            punto: 'E. Punto',
            urbano: 'D. Urbano',
            envio: 'Despacho',
            recogida: 'E. planta',
          };
          const despacho = tipoDespacho[item.tipoDespacho] || 'Desconocido';
          return <div className="text-center"> <span title={`Tipo de despacho: ${despacho}`}>{despacho}</span></div>
        },
      },
      {
        label: <i className="fa fa-eye"></i>,
        renderCell: (item) => {
          return (
            <div className="text-center">
              <button
                className="btn btn-outline-warning btn-sm py-1"
                onClick={() => detallePedido(item)}
                title="Ver detalles del pedido"
              >
                <i className="fa fa-magnifying-glass"></i>
              </button>
            </div>
          );
        },
      },
      {
        label: 'Estado',
        renderCell: (item) => (
          <select
            style={{ borderWidth: '3px' }}
            className={`form-select form-select-sm text-center rounded ${item.estado === 'pendiente'
              ? 'border-danger text-danger'
              : 'border-primary text-primary'
              }`}
            onChange={(event) => editarPedido(item, event)}
            name={`tipoDespacho${item.pedido_id}`}
            value={item.estado}
            disabled={[
              'pagado',
              'devuelto',
              'anulado',
            ].includes(item.estado)}
            title={`Estado actual: ${item.estado}`}
          >
            <>
              <option value="pendiente">Pendiente</option>
              <option value="preparado">Preparado</option>
            </>
          </select>
        ),
      },
      {
        label: 'Items',
        renderCell: (item) => {
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

          const tooltipText = Object.entries(categorias)
            .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
            .join(", ");

          const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
              {tooltipText}
            </Tooltip>
          );

          return (
            <OverlayTrigger
              placement="left"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <div className="text-end" style={{ cursor: 'pointer' }} title={`Detalle de productos: ${tooltipText}`}>
                <span className="fs-2 font-monospace text-dark">
                  {totalProductos}|
                </span>
              </div>
            </OverlayTrigger>
          );
        },
      },
      {
        label: 'Detalle',
        renderCell: (item) => {
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

          const tooltipText = Object.entries(categorias)
            .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
            .join(", ");

          const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
              {tooltipText}
            </Tooltip>
          );

          return (
            <OverlayTrigger
              placement="left"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <div className="text-left fs-4 font-monospace text-dark" style={{ cursor: 'pointer' }} title={`Detalle de productos: ${tooltipText}`}>
                <span>
                  ({tooltipText})
                </span>
              </div>
            </OverlayTrigger>
          );
        },
      },
    ] : [
      {
        renderCell: (item) => (
          <div className='border border-2 border-primary text-primary rounded text-center align-items-center d-flex justify-content-center' style={{ width: '30px', height: '30px', lineHeight: '30px' }}>
            <span className='fw-bold' title={`Vendedor: ${(item.user.name)}`}>
              {item.user.name.slice(0, 1).toUpperCase()}</span>
          </div>
        ),
      },
      {
        label: 'ID',
        renderCell: (item) => (
          <span className='fw-semibold ' title={`ID del pedido: ${(item.pedido_id)}`}>{((item.pedido_id).slice(-6).toUpperCase())}</span>
        ),
      },
      {
        label: 'Fecha',
        renderCell: (item) => (
          <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{fechaCorta(limpiarFecha(item.fechaCreacion))}</span>
        ),
        sort: { sortKey: "FECHA" },
      },
      {
        label: 'Cliente',
        renderCell: (item) => (
          <div className='d-flex align-items-center justify-content-center gap-1 justify-content-between'>
            <span className="text-start" title={`Cliente: ${item.cliente.nombre}`}>{item.cliente.nombre}</span>
            {(item.cliente.distribuidor) && (<span className="fw-bold text-primary  rounded" title="Cliente distribuidor">| D</span>)}
            {!(item.cliente.distribuidor) && (<span className="fw-bold text-secondary rounded" title="Cliente no distribuidor">| U</span>)}
          </div>
        ),
        sort: { sortKey: "CLIENTE" },
      },
      {
        label: <i className="fa fa-location-dot"></i>,
        renderCell: (item) => (
          <div className="text-center">
            <button
              className="btn btn-outline-secondary btn-sm py-1 w-100"
              onClick={() => abrirModalGuia(item)}
              title="Ver detalles del pedido"
            >
              <span className='fw-semibold' title={`Ciudad: ${item.cliente.ciudad}`}>{(item.cliente.ciudad).toUpperCase()}</span>
            </button>
          </div>
        ),
        sort: { sortKey: "CIUDAD" },
      },
      {
        label: <i className="fa fa-eye"></i>,
        renderCell: (item) => {
          return (
            <div className="text-center">
              <button
                className="btn btn-outline-warning btn-sm py-1"
                onClick={() => detallePedido(item)}
                title="Ver detalles del pedido"
              >
                <i className="fa fa-magnifying-glass"></i>
              </button>
            </div>
          );
        },
      },
      {
        label: <i className="fa fa-print"></i>,
        renderCell: (item) => {
          return (
            <div className="text-center">
              <button
                className="btn btn-outline-info py-1"
                onClick={() => abrirModalImprimir(item)}
                title="Ver detalles del pedido"
              >
                <i className="fa fa-print"></i>
              </button>
            </div>
          );
        }
      },
      /* {
        label: <i className="fa fa-edit"></i>,
        renderCell: (item) => (
          <div className="text-center">
            <button
              className="btn btn-outline-primary btn-sm py-1"
              onClick={() => direccionarPedido(item)}
              title="Editar pedido"
            >
              <i className="fa fa-edit"></i>
            </button>
          </div>
        ),
      }, */
      {
        label: <i className="fa fa-trash"></i>,
        renderCell: (item) => (
          item.estado === 'pendiente' && (
            <div className="text-center">
              <button
                className="btn btn-outline-danger btn-sm py-1"
                onClick={() => eliminarPedido(item)}
                title="Eliminar pedido"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          )
        ),
        resize: true,
        className: 'column-eliminar',
      },
      {
        label: 'Estado',
        renderCell: (item) => (
          <select
            style={{ borderWidth: '2px' }}
            className={`form-select form-select-sm text-center rounded ${item.estado === 'pendiente'
              ? 'border-danger text-danger'
              : item.estado === 'preparado'
                ? 'border-primary text-primary'
                : item.estado === 'enviado'
                  ? 'border-info text-info'
                  : item.estado === 'entregado'
                    ? 'border-warning text-warning'
                    : item.estado === 'anulado'
                      ? 'border-dark text-dark'
                      : item.estado === 'devuelto'
                        ? 'border-warning text-warning'
                        : item.estado === 'pagado'
                          ? 'border-success text-success'
                          : 'border-light text-light'
              }`}
            onChange={(event) => editarPedido(item, event)}
            name={`tipoDespacho${item.pedido_id}`}
            value={item.estado}
            disabled={[
              'pagado',
              'devuelto',
              'anulado',
            ].includes(item.estado)}
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
        ),
        sort: { sortKey: "ESTADO" },
      },
      {
        label: 'Items',
        renderCell: (item) => {
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

          const tooltipText = Object.entries(categorias)
            .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
            .join(", ");

          const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
              {tooltipText}
            </Tooltip>
          );

          return (
            <OverlayTrigger
              placement="left"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <div className="text-end " style={{ cursor: 'pointer' }} title={`Detalle de productos: ${tooltipText}`}>
                <div className="fs-4 font-monospace text-dark d-flex justify-content-between align-items-center">
                  {<span> {totalProductos} </span>}
                </div>
              </div>
            </OverlayTrigger>
          );
        },
      },
      {
        label: 'Detalle',
        renderCell: (item) => {
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

          const tooltipText = Object.entries(categorias)
            .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
            .join(", ");

          const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
              {tooltipText}
            </Tooltip>
          );

          return (
            <OverlayTrigger
              placement="left"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <div className="text-left text-dark" style={{ cursor: 'pointer' }} title={`Detalle de productos: ${tooltipText}`}>
                <span>
                  ({tooltipText})
                </span>
              </div>
            </OverlayTrigger>
          );
        },
      },
    ];

  return (
    <div className="card shadow p-3 rounded">
      <Row className=' card-header bg-white justify-content-between align-items-middle'>
        <Col>
          <h5 className="text-secondary">Listado Pedidos</h5>
        </Col>
        <Col>
          <div>
            <div className="text-end">
              <button
                className="btn btn-outline-success"
                type="button"
                id="dropdownMenuButton1"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={() => navegar('/pedidos')}
              >
                Crear pedido &nbsp;
                <i className="fa fa-clipboard-list"></i>
              </button>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-between align-items-center">
        <div className="col-md-6 col-6">
          <select
            className="form-select"
            onChange={handleFilterChange}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            <option value="all">Todos</option>
            <option value="true">Distribuidores</option>
            <option value="false">No Distribuidores</option>
          </select>
        </div>

        <div className="col-md-6 col-6">
          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Filtro (ID, Estado, Cliente, Ciudad o fecha)"
              aria-label="Filtro (ID, Estado, Cliente, Ciudad o fecha)"
              aria-describedby="basic-addon2"
              id="search"
              value={search}
              onChange={handleSearch}
            />
            <div className="input-group-append">
              <span className="btn btn-outline-primary" type="button">
                <i className="fas fa-search fa-sm" />
              </span>
            </div>
          </div>
        </div>
      </Row>
      <Row className='justify-content-between'>
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
      </Row>

      <div className="table-responsive table table-hover text-start w-100 compact-table">
        <CompactTable
          columns={COLUMNS}
          data={filteredData}
          theme={theme}
          className="table table-bordered table-hover text-left align-middle"
          pagination={pagination}
          layout={{ custom: true }}
          sort={sort}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "99%" }}>
        <span>Total registros: {filteredData.nodes.length}</span>
        <span>Páginas: {pagination.state.getTotalPages(filteredData.nodes)}</span>
        <span>
          Página:{" "}
          {(() => {
            const totalPages = pagination.state.getTotalPages(filteredData.nodes);
            const currentPage = pagination.state.page;
            const maxVisible = 3; // Número de páginas visibles
            const startPage = Math.max(0, currentPage - 1);
            const endPage = Math.min(totalPages, startPage + maxVisible);

            const pages = [];
            // Botón para retroceder
            if (startPage > 0) {
              pages.push(
                <button
                  key="prev"
                  className="btn btn-light btn-sm m-1 border"
                  onClick={() => pagination.fns.onSetPage(currentPage - 1)}
                >
                  &laquo;
                </button>
              );
            }

            // Rango de páginas visibles
            for (let i = startPage; i < endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={
                    currentPage === i
                      ? "btn btn-secondary btn-sm m-1 border"
                      : "btn btn-light btn-sm m-1 border"
                  }
                  style={{
                    fontWeight: currentPage === i ? "bold" : "normal",
                  }}
                  onClick={() => pagination.fns.onSetPage(i)}
                >
                  {i + 1}
                </button>
              );
            }

            // Botón para avanzar
            if (endPage < totalPages) {
              pages.push(
                <button
                  key="next"
                  className="btn btn-light btn-sm m-1 border"
                  onClick={() => pagination.fns.onSetPage(currentPage + 1)}
                >
                  &raquo;
                </button>
              );
            }

            return pages;
          })()}
        </span>
      </div>

      <ModalImprimirPedido />
    </div>
  );
};
