import * as React from 'react';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from "@table-library/react-table-library/pagination";
import { useAuthStore, useFuntions, usePedidosStore } from '../../hooks';
import { useState } from 'react';
import { ModalImprimirPedido } from './modals/ModalImprimirPedido';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Button } from 'react-bootstrap';



export const ListarPedidos = ({ editarPedido, eliminarPedido, detallePedido, direccionarPedido, abrirModalImprimir, abrirModalGuia }) => {
  const { pedidos } = usePedidosStore();
  const [search, setSearch] = React.useState("");
  const { capitalize, convertirFecha } = useFuntions();
  const [filtroDistribuidor, setFiltroDistribuidor] = useState(null);
  const { user } = useAuthStore();

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
      // Condiciones del filtro existente
      const matchesSearch =
        item.cliente.nombre.toLowerCase().includes(search.toLowerCase()) || // Filtra por nombre del cliente
        item.fechaCreacion.toLowerCase().includes(search.toLowerCase()) || // Filtra por fecha
        item.cliente.ciudad.toLowerCase().includes(search.toLowerCase()) || // Filtra por ciudad
        item.estado.toLowerCase().includes(search.toLowerCase()) || // Filtra por estado
        item.pedido_id.toLowerCase().includes(search.toLowerCase()) || // Filtra por pedido ID
        item.user.name.toLowerCase().includes(search.toLowerCase()); // Filtra por pedido ID

      // Condición para filtrar por distribuidor (true o false)
      const matchesDistribuidor =
        filtroDistribuidor === null || // Si no hay filtro seleccionado, incluye todos
        item.cliente.distribuidor === filtroDistribuidor; // Compara si el cliente es distribuidor según el filtro

      // Combinar ambos filtros
      return matchesSearch && matchesDistribuidor;
    }),
  };

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
             20%  
             26% 
             8% 
             10%             
             6%
             15%
             5%             
    `,
    }
  const theme = useTheme(
    [marginTheme, sizeColumnTheme]
  );

  // Columnas con renderizado personalizado

  const pagination = usePagination(data, {
    state: {
      page: 0,
      size: 30,
    },
  });

  // Cambiar el filtro desde un select
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFiltroDistribuidor(value === 'all' ? null : value === 'true');
  };

  const COLUMNS = user.rol === "planta" ?
    [
      {
        label: 'ID',
        renderCell: (item) => (
          <span className='fw-semibold ' title={`ID del pedido: ${(item.pedido_id)}`}>{((item.pedido_id).slice(-6).toUpperCase())}</span>
        ),
      },
      {
        label: 'FECHA',
        renderCell: (item) => (
          <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{capitalize(item.fechaCreacion)}</span>
        ),
      },
      {
        label: 'CLIENTE',
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
            urbano: 'E. Urbano',
            envio: 'Transportadora',
            recogida: 'Recogen',
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
                className="btn btn-success"
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
        label: 'ESTADO',
        renderCell: (item) => (
          <select
            style={{ borderWidth: '3px' }}
            className={`form-select form-select-sm text-center rounded ${item.estado === 'pendiente'
              ? 'border-danger text-danger'
              : item.estado === 'preparado'
                ? 'border-secondary text-secondary'
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
            title={`Estado actual: ${item.estado}`}
          >
            <option value="pendiente">{capitalize(item.estado)}</option>
          </select>
        ),
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
    ] : [
      {
        label: 'ID',
        renderCell: (item) => (
          <span className='fw-semibold ' title={`ID del pedido: ${(item.pedido_id)}`}>{((item.pedido_id).slice(-6).toUpperCase())}</span>
        ),
      },
      {
        label: 'FECHA',
        renderCell: (item) => (
          <span title={`Creado el: ${capitalize(item.fechaCreacion)}`}>{capitalize(item.fechaCreacion)}</span>
        ),
      },
      {
        label: 'CLIENTE',
        renderCell: (item) => (
          <span title={`Cliente: ${item.cliente.nombre}`}>{item.cliente.nombre}</span>
        ),
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
      },
      {
        label: <i className="fa fa-truck-ramp-box"></i>,
        renderCell: (item) => {
          const tipoDespacho = {
            punto: 'E. Punto',
            urbano: 'E. Urbano',
            envio: 'Transportadora',
            recogida: 'Recogen',
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
                className="btn btn-success"
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
                className="btn btn-info"
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
              className="btn btn-primary"
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
                className="btn btn-danger"
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
        label: 'ESTADO',
        renderCell: (item) => (
          <select
            style={{ borderWidth: '3px' }}
            className={`form-select form-select-sm text-center rounded ${item.estado === 'pendiente'
              ? 'border-danger text-danger'
              : item.estado === 'preparado'
                ? 'border-secondary text-secondary'
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
                <option value="preparado">Preparado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="devuelto">Devuelto</option>
                <option value="pagado">Pagado</option>
              </>
            )}
          </select>
        ),
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
    <>
      <div className="row justify-content-between align-items-center">
        <div className="col-auto mb-3">
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

        <div className="col-md-4 col-12">
          <div className="input-group mb-3">
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
          </div>
        </div>
      </div>

      <CompactTable
        columns={COLUMNS}
        data={filteredData}
        theme={theme}
        className="table table-bordered table-hover text-left align-middle"
        pagination={pagination}
        layout={{ custom: true }}
      />
      <br />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Páginas totales: {pagination.state.getTotalPages(data.nodes)}</span>
        <span>
          Página:{" "}
          {pagination.state.getPages(data.nodes).map((_, index) => (
            <button
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
    </>
  );
};
