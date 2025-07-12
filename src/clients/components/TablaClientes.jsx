import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useClientesStore, useFuntions } from "../../hooks";
import { ReusableModal } from "../../modals/ReusableModal";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { Button } from "react-bootstrap";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";



export const TablaClientes = ({ handleShow }) => {
    const [showModal, setShowModal] = useState(false);
    const { limpiarClienteActivo, setClienteActivo, startSavingClient } = useClientesStore();
    const navegar = useNavigate();
    const { limpiarFecha, capitalize } = useFuntions();
    const { user } = useAuthStore()
    const { clientes } = useSelector(state => state.clientes);
    const [search, setSearch] = useState("");
    const [isHide, setIsHide] = useState(false);
    const [isHideUnitarios, setIsHideUnitarios] = useState(false);

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };
    const data = {
        nodes: [...clientes]
            .filter((item) =>
                item.user?._id === user.uid && // Filtra por usuario autenticado
                (item.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                    item.ciudad?.toLowerCase().includes(search.toLowerCase()) ||
                    item.nitCC?.toLowerCase().includes(search.toLowerCase())
                ) // Filtra por término de búsqueda
            )
            .sort((a, b) => {
                // Función para extraer y convertir la fechaCreacion en "DD/MM/YYYY, hh:mm a. m./p. m."
                const parseFecha = (fechaStr) => {
                    if (!fechaStr) return new Date(0); // Usa fechaCreacion mínima si no existe

                    const fechaSolo = fechaStr.split(",")[0]; // Extrae solo la parte "DD/MM/YYYY"
                    const [dia, mes, anio] = fechaSolo.split("/");

                    return new Date(`${anio}-${mes}-${dia}`); // Convierte a formato YYYY-MM-DD
                };

                const fechaA = parseFecha(a.fechaCreacion);
                const fechaB = parseFecha(b.fechaCreacion);
                return fechaB - fechaA; // Ordena de más reciente a más antigua
            })
    };
    // Aplicar filtro adicional si isHide es verdadero
    data.nodes = isHide ? data.nodes.filter((node) => node.distribuidor) : data.nodes;
    data.nodes = isHideUnitarios ? data.nodes.filter((node) => node.distribuidor === false) : data.nodes;

    const handleClose = () => {
        setShowModal(false);
        limpiarClienteActivo()
    }
    const editarCliente = (cliente) => {
        startSavingClient(cliente);
        setClienteActivo(cliente);
        setShowModal(true);
    }
    const direccionarPedido = (cliente) => {
        setClienteActivo(cliente);
        navegar('/pedidos')
    }
    const pagination = usePagination(data, {
        state: {
            page: 0,
            size: 20,
        },
    });
    const sizeColumnTheme = {
        Table: `
                --data-table-library_grid-template-columns: 
                    9% auto 10% auto 20% 7% 7% !important;
            `,
    };
    const theme = useTheme(
        [sizeColumnTheme]
    );
    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {
                INGRESO: (array) => array.sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion)),
                CLIENTE: (array) => array.sort((a, b) => a.nombre.localeCompare(b.nombre)),
                NIT: (array) => array.sort((a, b) => a.nitCC.localeCompare(b.nitCC)),
                CIUDAD: (array) => array.sort((a, b) => a.ciudad.localeCompare(b.ciudad)),
            },
        }
    );

    function onSortChange(action, state) {
        console.log(action, state);
    }

    return (
        <div className="card shadow-none p-3 mb-5 rounded mt-1">
            <div className='row align-items-center'>
                <div className="card-header py-3 bg-white">
                    <div className='row'>
                        <div className='col-md-6'>
                            <h5 className="m-0 font-weight-bold text-primary">Listado de clientes</h5>
                        </div>
                        <div className='form-group col-md-6 text-end'>
                            <button
                                onClick={handleShow}
                                className="btn btn-outline-primary"
                                >
                                <span className="ml-2">
                                    <i className="fas fa-user fa-lg"></i>
                                </span>
                                <span> Nuevo cliente
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="row mt-3 mb-3 text-end align-items-center">
                    <div className="col text-start d-flex gap-3">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="soloKits"
                                checked={isHide}
                                onChange={() => {
                                    setIsHide(!isHide)
                                }}
                            />
                            <label className="form-check-label" htmlFor="soloKits">
                                Distribuidores
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="soloKitsUnitarios"
                                checked={isHideUnitarios}
                                onChange={() => {
                                    setIsHideUnitarios(!isHideUnitarios)
                                }}
                            />
                            <label className="form-check-label" htmlFor="soloKitsUnitarios">
                                Unitarios
                            </label>
                        </div>
                    </div>
                    {/* Columna para el input */}
                    <div className="col-md-6">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtro (Cliente, nit/cc, ciudad)"
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
                </div>

                <Table
                    className="table table-hover table table-hover text-start w-100 compact-table"
                    data={data} theme={theme} pagination={pagination} sort={sort}>
                    {(tableList) => (
                        <>
                            <Header>
                                <HeaderRow className="table-light text-start fw-semibold">
                                    <HeaderCellSort sortKey={'INGRESO'} className='text-start fw-semibold'>Ingreso</HeaderCellSort>
                                    <HeaderCellSort sortKey={'CLIENTE'} className='text-start fw-semibold'>Cliente</HeaderCellSort>
                                    <HeaderCellSort sortKey={'NIT'} className='text-start fw-semibold'>Nit/CC</HeaderCellSort>
                                    <HeaderCellSort sortKey={'CIUDAD'} className='text-start fw-semibold'>Ciudad</HeaderCellSort>
                                    <HeaderCell className='text-start fw-semibold'>Dirección</HeaderCell>
                                    <HeaderCell className='text-center fw-semibold'>Pedido</HeaderCell>
                                    <HeaderCell className='text-center fw-semibold'>Editar</HeaderCell>
                                </HeaderRow>
                            </Header>

                            <Body>
                                {tableList.map((item, index) => (
                                    <Row
                                        key={index}
                                        item={item}
                                        className={!item.distribuidor ? 'table-primary' : ''}
                                    >
                                        <Cell>{limpiarFecha(item.fechaCreacion)}</Cell>
                                        <Cell>{item.nombre}</Cell>
                                        <Cell>{item.nitCC}</Cell>
                                        <Cell className="text-secondary">{capitalize(item.ciudad.toUpperCase())}</Cell>
                                        <Cell>{(item.direccion)}</Cell>
                                        <Cell className="text-center"><div className="dropdown">
                                            <button
                                                className="btn btn-outline-success btn-sm py-1"
                                                type="button"
                                                id="dropdownMenuButton1"
                                                data-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                onClick={() => direccionarPedido(item)}
                                            >
                                                <i className="fa fa-clipboard-list"></i>
                                            </button>
                                        </div></Cell>
                                        <Cell className="text-center"><button
                                            className="btn btn-outline-primary py-1"
                                            onClick={() => editarCliente(item)}
                                        >
                                            <i className="fa fa-edit"></i>
                                        </button></Cell>
                                    </Row>
                                ))}
                            </Body>
                        </>
                    )}
                </Table>
                <div style={{ display: "flex", justifyContent: "space-between", width: "99%" }}>
                    <span className="fw-semibold">Total registros: {data.nodes.length}</span>
                    <span className="fw-semibold">Páginas: {pagination.state.getTotalPages(data.nodes)}</span>
                    <span>
                        Página:{" "}
                        {pagination.state.getPages(data.nodes).map((_, index) => (
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
            <ReusableModal show={showModal} handleClose={handleClose} />
        </div >
    )
}
