import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from "@table-library/react-table-library/pagination";
import { useAuthStore, useFuntions, usePedidosStore } from '../../hooks';
import { useState } from 'react';
import { ModalImprimirPedido } from './modals/ModalImprimirPedido';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Button, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSort } from "@table-library/react-table-library/sort";
import { useSelector } from 'react-redux';


export const ListarPedidos = ({ editarPedido, eliminarPedido, detallePedido, direccionarPedido, abrirModalImprimir, abrirModalGuia }) => {
  const [search, setSearch] = useState("");
  const { capitalize, convertirFecha } = useFuntions();
  const [filtroDistribuidor, setFiltroDistribuidor] = useState(null);
  const { user } = useAuthStore();
  const navegar = useNavigate();

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
      .filter((pedido) => pedido.fechaCreacion)
      .sort((a, b) => {
        // Convertir las fechas para ordenarlas
        const fechaA = convertirFecha(a.fechaCreacion);
        const fechaB = convertirFecha(b.fechaCreacion);

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
        user.rol !== "planta" || item.estado === "pendiente" || item.estado === "preparado";

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
        FECHA: (array) => array.sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion)),
        CLIENTE: (array) => array.sort((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre)),
        CIUDAD: (array) => array.sort((a, b) => a.cliente.ciudad.localeCompare(b.cliente.ciudad)),
        ESTADO: (array) => array.sort((a, b) => a.estado.localeCompare(b.estado)),
      },
    }
  );

  function onSortChange(action, state) {
    console.log(action, state);
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
             7%  
             13%  
             23% 
             10% 
             8%             
             5.5%
             5.5%
             5.5%
             5.5%
             12%
             5%
    `,
  }
    : {
      Table: `
        --data-table-library_grid-template-columns: 
             8%  
             13% 
             auto 
             7% 
             7%             
             5%
             auto
             8%             
    `,
    }
  const theme = useTheme(
    [marginTheme, sizeColumnTheme]
  );
  // Columnas con renderizado personalizado\
  const pagination = usePagination(filteredData, {
    state: {
      page: 0,
      size: 10,
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
        label: 'ID',
        renderCell: (item) => (
          <span className='fw-semibold ' title={`ID del pedido: ${(item.pedido_id)}`}>{((item.pedido_id).slice(-6).toUpperCase())}</span>
        ),
      },
      {
        label: 'Fecha',
        renderCell: (item) => (
          <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{capitalize(item.fechaCreacion)}</span>
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
          <div className="text-center"> <span title={`Ciudad: ${item.cliente.ciudad}`}>{item.cliente.ciudad}</span></div>
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
                className="btn btn-warning text-white"
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
        label: 'Cantidad',
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
          // Generar texto para el tooltip         
          const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
              {Object.entries(categorias)
                .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
                .join(', ')}
            </Tooltip>
          );
          return (
            <OverlayTrigger
              placement="left"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <span className=" text-dark" variant="secondary">
                {
                  <div className="text-center"> <span className='fw-bold fs-3 font-monospace'>{totalProductos}</span> </div>}
              </span>
            </OverlayTrigger>
          );

        },
      }
    ] : [
      {
        label: 'ID',
        renderCell: (item) => (
          <span className='fw-semibold ' title={`ID del pedido: ${(item.pedido_id)}`}>{((item.pedido_id).slice(-6).toUpperCase())}</span>
        ),
      },
      {
        label: 'Fecha',
        renderCell: (item) => (
          <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{(capitalize(item.fechaCreacion))}</span>
        ),
        sort: { sortKey: "FECHA" },
      },
      {
        label: 'Cliente',
        renderCell: (item) => (
          <span className="text-start" title={`Cliente: ${item.cliente.nombre}`}>{item.cliente.nombre}</span>
        ),
        sort: { sortKey: "CLIENTE" },
      },
      {
        label: <i className="fa fa-location-dot"></i>,
        renderCell: (item) => (
          <div className="text-center">
            <button
              className="btn"
              onClick={() => abrirModalGuia(item)}
              title="Ver detalles del pedido"
            >
              <span title={`Ciudad: ${item.cliente.ciudad}`}>{item.cliente.ciudad}</span>
            </button>
          </div>
        ),
        sort: { sortKey: "CIUDAD" },
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
                className="btn btn-warning text-white btn-sm"
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
                className="btn btn-info btn-sm"
                onClick={() => abrirModalImprimir(item)}
                title="Ver detalles del pedido"
              >
                <i className="fa fa-print" style={{ color: 'white' }}></i>
              </button>
            </div>
          );
        }
      },
      {
        label: <i className="fa fa-edit"></i>,
        renderCell: (item) => (
          <div className="text-center">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => direccionarPedido(item)}
              title="Editar pedido"
            >
              <i className="fa fa-edit"></i>
            </button>
          </div>
        ),
      },
      {
        label: <i className="fa fa-trash"></i>,
        renderCell: (item) => (
          item.estado === 'pendiente' && (
            <div className="text-center">
              <button
                className="btn btn-danger btn-sm"
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
            style={{ borderWidth: '3px' }}
            className={`form-select form-select-sm text-center rounded ${item.estado === 'pendiente'
              ? 'border-danger text-danger'
              : item.estado === 'preparado'
                ? 'border-primary text-primary'
                : item.estado === 'enviado'
                  ? 'border-info text-info'
                  : item.estado === 'entregado'
                    ? 'border-warning text-dark'
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

          // Generar texto para el tooltip         
          const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
              {Object.entries(categorias)
                .map(([categoria, cantidad]) => `${categoria}: ${cantidad}`)
                .join(', ')}
            </Tooltip>
          );
          return (
            <>
              <OverlayTrigger
                className='text-left'
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
              >
                <Button className='badge rounded-pill bg-secondary' variant="secondary">{totalProductos}</Button>
              </OverlayTrigger>
            </>
          );
        },
      }
    ];

  return (
    <div className="card shadow-none p-2 mb-5 bg-body-light rounded">
      <div className="card-header py-3 mb-1">
        <Row>
          <Col>
            <h5 className="m-0 font-weight-bold text-black">Listado Pedidos</h5>
          </Col>
          <Col>
            <div>
              <div className="text-end">
                <button
                  className="btn btn-success"
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
      </div>
      <div className="row justify-content-between align-items-center">
        <div className="col-md-6 col-6 mb-2">
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

        <div className="col-md-5 col-6">
          <div className="input-group mb-3 mt-3">
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
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
      <br />
      <div style={{ display: "flex", justifyContent: "space-between", width: "99%" }}>
        <span className="fw-bold">Total registros: {filteredData.nodes.length}</span>
        <span className="fw-bold">Páginas: {pagination.state.getTotalPages(filteredData.nodes)}</span>
        <span>
          Página:{" "}
          {pagination.state.getPages(filteredData.nodes).map((_, index) => (
            <button
              className={(pagination.state.page === index) ? 'btn btn-secondary btn-sm m-1 border' : 'btn btn-light btn-sm m-1'}
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
      <ModalImprimirPedido />
    </div>
  );
};
