import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useClientesStore, useFuntions } from "../../hooks";
import { ReusableModal } from "../../modals/ReusableModal";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { Button } from "react-bootstrap";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import Swal from "sweetalert2";
import { useMemo } from "react";



export const TablaClientes = ({ handleShow }) => {
    const [showModal, setShowModal] = useState(false);
    const { limpiarClienteActivo, setClienteActivo, startSavingClient, startDeleteClient, startLoadingClientes } = useClientesStore();
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

    const data = useMemo(() => {
        const filtered = [...clientes]
            .filter((item) =>
                item.user?._id === user.uid &&
                (item.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                    item.ciudad?.toLowerCase().includes(search.toLowerCase()) ||
                    item.nitCC?.toLowerCase().includes(search.toLowerCase())
                )
            )
            .sort((a, b) => {
                const parseFecha = (fechaStr) => {
                    if (!fechaStr) return new Date(0);

                    const clean = fechaStr.trim();
                    const [fecha, horaCompleta] = clean.split(",");

                    // 👉 Fecha: dd/mm/yyyy
                    const [dia, mes, anio] = fecha.trim().split("/").map(Number);

                    // 👉 Normalizar hora "04:32 p. m." a formato 24h
                    let hora = horaCompleta.trim()
                        .replace("a. m.", "AM")
                        .replace("p. m.", "PM")
                        .toUpperCase();

                    let [time, meridian] = hora.split(" ");
                    let [h, m] = time.split(":").map(Number);

                    if (meridian === "PM" && h < 12) h += 12;
                    if (meridian === "AM" && h === 12) h = 0;

                    return new Date(anio, mes - 1, dia, h, m);
                };

                return parseFecha(b.fechaCreacion) - parseFecha(a.fechaCreacion);
            })



        // Filtros adicionales
        let nodes = isHide ? filtered.filter((n) => n.distribuidor) : filtered;
        nodes = isHideUnitarios ? nodes.filter((n) => n.distribuidor === false) : nodes;

        return { nodes };
    }, [clientes, user.uid, search, isHide, isHideUnitarios]);

    // Aplicar filtro adicional si isHide es verdadero
    data.nodes = isHide ? data.nodes.filter((node) => node.distribuidor) : data.nodes;
    data.nodes = isHideUnitarios ? data.nodes.filter((node) => node.distribuidor === false) : data.nodes;

    const handleClose = () => {
        setShowModal(false);
        limpiarClienteActivo()
    }
    const editarCliente = (cliente) => {
        startSavingClient(cliente).then(() => {
            startLoadingClientes();
        });
        setClienteActivo(cliente);
        setShowModal(true);
    };

    const eliminarCliente = async (cliente) => {
        const respuesta = await startDeleteClient(cliente);

        if (respuesta.ok) {
            Swal.fire({
                position: "center",
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "red",
                icon: "success",
                title: "Cliente eliminado satisfactoriamente",
                timer: 1400
            });
            startLoadingClientes();
        } else {
            Swal.fire({
                position: "center",
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "red",
                icon: "danger",
                title: "El cliente no se puede eliminar porque contiene pedidos realizados",
                timer: 1400
            });
        }
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
    const marginTheme = {
        BaseCell: `
        margin: 0.5px;
        padding: 0.5px;
      `,
    };
    const sizeColumnTheme = {
        Table: `
        --data-table-library_grid-template-columns: 
             max-content  
             max-content 
             1fr  
             max-content
             max-content
             max-content
             max-content
             max-content
             max-content !important;

        @media (max-width: 992px) {
            --data-table-library_grid-template-columns: 
                1fr 
                max-content 
                max-content 
                max-content 
                max-content !important;
        }
    `,
    }

    const theme = useTheme(
        [marginTheme, sizeColumnTheme]
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

    useEffect(() => {
        startLoadingClientes();
    }, [clientes.length])

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
                                onClick={() => {
                                    handleShow();
                                    limpiarClienteActivo();
                                }
                                }
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

                <div className="table-responsive">
                    <Table
                        className="table table-hover table table-hover text-start w-100 compact-table"
                        data={data} theme={theme} pagination={pagination} sort={sort}>
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow className="table-light text-start fw-semibold">
                                        <HeaderCellSort sortKey={'INGRESO'} className='text-start fw-semibold d-none d-lg-flex'>Ingreso</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TIPO'} className='text-start fw-semibold d-none d-lg-flex'>Tipo</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CLIENTE'} className='text-start fw-semibold'>Cliente</HeaderCellSort>
                                        <HeaderCellSort sortKey={'NIT'} className='text-start fw-semibold d-none d-lg-flex'>Nit/CC</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CIUDAD'} className='text-start fw-semibold'>Ciudad</HeaderCellSort>
                                        <HeaderCell className='text-start fw-semibold d-none d-lg-flex'>Dirección</HeaderCell>
                                        <HeaderCell className='text-center fw-semibold'>Pedido</HeaderCell>
                                        <HeaderCell className='text-center fw-semibold'>Editar</HeaderCell>
                                        <HeaderCell className='text-center fw-semibold'>Eliminar</HeaderCell>
                                    </HeaderRow>
                                </Header>

                                <Body>
                                    {tableList.map((item, index) => (
                                        <Row
                                            key={index}
                                            item={item}
                                            className={!item.distribuidor ? 'table-primary' : ''}
                                        >
                                            <Cell className="d-none d-lg-flex">{limpiarFecha(item.fechaCreacion)}</Cell>
                                            <Cell className={'fw-semibold d-none d-lg-flex ' + (item.distribuidor ? 'text-success' : 'text-danger')} title={(item.distribuidor)}>{item.distribuidor ? 'Distribuidor' : 'Cliente final'}</Cell>
                                            <Cell>{item.nombre}</Cell>
                                            <Cell className="d-none d-lg-flex">{item.nitCC}</Cell>
                                            <Cell className="text-secondary">{capitalize(item.ciudad.toUpperCase())}</Cell>
                                            <Cell className="d-none d-lg-flex">{(item.direccion)}</Cell>
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
                                            </div>
                                            </Cell>
                                            <Cell className="text-center">
                                                <button
                                                    className="btn btn-outline-primary py-1"
                                                    onClick={() => editarCliente(item)}>
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </Cell>
                                            <Cell className="text-center">
                                                <button
                                                    className="btn btn-outline-danger py-1"
                                                    onClick={() => eliminarCliente(item)}>
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </Cell>
                                        </Row>
                                    ))}
                                </Body>
                            </>
                        )}
                    </Table>
                </div>
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
