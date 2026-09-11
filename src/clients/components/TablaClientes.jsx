import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useClientesStore, useFuntions } from "../../hooks";
import { getVisiblePageNumbers } from "../../helpers";
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
    const { limpiarFecha, capitalize, aTitulo } = useFuntions();
    const { user } = useAuthStore()
    const { clientes } = useSelector(state => state.clientes);
    const [search, setSearch] = useState("");
    const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'distribuidor', 'unitario'

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



        // Filtros adicionales por tipo
        let nodes = filtered;
        if (filtroTipo === 'distribuidor') nodes = filtered.filter((n) => n.distribuidor);
        if (filtroTipo === 'unitario') nodes = filtered.filter((n) => n.distribuidor === false);

        return { nodes };
    }, [clientes, user.uid, search, filtroTipo]);

    const totalClientesCount = clientes.filter(c => c.user?._id === user.uid).length;
    const totalDistribuidoresCount = clientes.filter(c => c.user?._id === user.uid && c.distribuidor).length;
    const totalUnitariosCount = clientes.filter(c => c.user?._id === user.uid && !c.distribuidor).length;

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
    const sizeColumnTheme = {
        Table: `
        --data-table-library_grid-template-columns: 
             max-content  
             max-content 
             minmax(180px, 1.2fr)  
             max-content
             max-content
             minmax(140px, 1fr)
             max-content !important;

        @media (max-width: 992px) {
            --data-table-library_grid-template-columns: 
                minmax(140px, 1.2fr) 
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
        <div className="container-fluid px-0">
            {/* TARJETAS KPI DE CLIENTES */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-4">
                    <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="p-2 bg-primary-subtle text-primary rounded-3">
                                <i className="fas fa-users fa-lg"></i>
                            </span>
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                                Total
                            </span>
                        </div>
                        <small className="text-muted fw-medium">Clientes Registrados</small>
                        <h4 className="fw-bolder text-dark mb-0 mt-1">{totalClientesCount}</h4>
                    </div>
                </div>
                <div className="col-12 col-sm-4">
                    <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="p-2 bg-info-subtle text-info rounded-3">
                                <i className="fas fa-store fa-lg"></i>
                            </span>
                            <span className="badge bg-info-subtle text-info rounded-pill px-2 py-1 small">
                                Mayoristas
                            </span>
                        </div>
                        <small className="text-muted fw-medium">Distribuidores</small>
                        <h4 className="fw-bolder text-dark mb-0 mt-1">{totalDistribuidoresCount}</h4>
                    </div>
                </div>
                <div className="col-12 col-sm-4">
                    <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="p-2 bg-secondary-subtle text-secondary rounded-3">
                                <i className="fas fa-user-tag fa-lg"></i>
                            </span>
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 small">
                                Particulares
                            </span>
                        </div>
                        <small className="text-muted fw-medium">Clientes Finales / Unitarios</small>
                        <h4 className="fw-bolder text-dark mb-0 mt-1">{totalUnitariosCount}</h4>
                    </div>
                </div>
            </div>

            {/* TABLA PRINCIPAL DE CLIENTES */}
            <div className="card border border-light-subtle shadow-sm rounded-4 p-3 bg-white mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3 pb-2 border-bottom">
                    <div>
                        <h5 className="mb-0 fw-bold text-dark">
                            <i className="fas fa-address-book me-2 text-primary"></i>Listado de Clientes
                        </h5>
                        <small className="text-muted">Directorio comercial de compradores y distribuidores</small>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                handleShow();
                                limpiarClienteActivo();
                            }}
                            className="btn btn-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-2"
                        >
                            <i className="fas fa-user-plus"></i>
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>
                </div>

                {/* FILTROS RÁPIDOS Y BUSCADOR */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                        <button
                            className={`btn btn-sm rounded-pill px-3 ${filtroTipo === 'todos' ? 'btn-primary shadow-xs' : 'btn-light border'}`}
                            onClick={() => { setFiltroTipo('todos'); pagination.fns.onSetPage(0); }}
                        >
                            Todos <span className="badge bg-white text-dark ms-1">{totalClientesCount}</span>
                        </button>
                        <button
                            className={`btn btn-sm rounded-pill px-3 ${filtroTipo === 'distribuidor' ? 'btn-info text-white shadow-xs' : 'btn-light border'}`}
                            onClick={() => { setFiltroTipo('distribuidor'); pagination.fns.onSetPage(0); }}
                        >
                            <i className="fas fa-store me-1"></i>Distribuidores <span className="badge bg-info-subtle text-dark ms-1">{totalDistribuidoresCount}</span>
                        </button>
                        <button
                            className={`btn btn-sm rounded-pill px-3 ${filtroTipo === 'unitario' ? 'btn-secondary text-white shadow-xs' : 'btn-light border'}`}
                            onClick={() => { setFiltroTipo('unitario'); pagination.fns.onSetPage(0); }}
                        >
                            <i className="fas fa-user me-1"></i>Unitarios <span className="badge bg-secondary-subtle text-dark ms-1">{totalUnitariosCount}</span>
                        </button>
                    </div>

                    <div className="w-100" style={{ maxWidth: '350px' }}>
                        <div className="input-group input-group-sm">
                            <input
                                type="text"
                                className="form-control rounded-start-3 ps-3"
                                placeholder="Buscar por cliente, Nit/CC o ciudad..."
                                value={search}
                                onChange={handleSearch}
                            />
                            <button className="btn btn-outline-secondary rounded-end-3" type="button">
                                <i className="fas fa-search" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive table-hover text-start w-100 compact-table">
                    <Table
                        className="table table-hover text-start w-100 compact-table align-middle mb-0"
                        data={data} theme={theme} pagination={pagination} sort={sort}>
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow className="table-light text-start">
                                        <HeaderCellSort sortKey={'INGRESO'} className='text-start fw-semibold d-none d-lg-flex'>Ingreso</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TIPO'} className='text-center fw-semibold d-none d-lg-flex'>Tipo</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CLIENTE'} className='text-start fw-semibold ps-2'>Cliente</HeaderCellSort>
                                        <HeaderCellSort sortKey={'NIT'} className='text-center fw-semibold d-none d-lg-flex'>Nit/CC</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CIUDAD'} className='text-center fw-semibold'>Ciudad</HeaderCellSort>
                                        <HeaderCell className='text-start fw-semibold d-none d-lg-flex'>Dirección</HeaderCell>
                                        <HeaderCell className='text-center fw-semibold'>Acciones</HeaderCell>
                                    </HeaderRow>
                                </Header>

                                <Body>
                                    {tableList.map((item, index) => (
                                        <Row
                                            key={index}
                                            item={item}
                                        >
                                            <Cell className="d-none d-lg-flex small text-muted">{limpiarFecha(item.fechaCreacion)}</Cell>
                                            <Cell className="text-center d-none d-lg-flex">
                                                {item.distribuidor ? (
                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>Distribuidor</span>
                                                ) : (
                                                    <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>Cliente Final</span>
                                                )}
                                            </Cell>
                                            <Cell className="ps-2 fw-medium text-dark">{aTitulo(item.nombre)}</Cell>
                                            <Cell className="d-none d-lg-flex text-muted small text-center">{item.nitCC || '—'}</Cell>
                                            <Cell className="text-center">
                                                <span className="badge bg-light text-dark border">{aTitulo(item.ciudad)}</span>
                                            </Cell>
                                            <Cell className="d-none d-lg-flex text-truncate text-muted small" style={{ maxWidth: '180px' }}>{item.direccion || '—'}</Cell>
                                            <Cell className="text-center">
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button
                                                        className="btn btn-sm btn-light border text-success px-2 py-1"
                                                        style={{ fontSize: '0.92rem' }}
                                                        type="button"
                                                        onClick={() => direccionarPedido(item)}
                                                        title="Crear pedido para este cliente"
                                                    >
                                                        <i className="fa fa-clipboard-list"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-light border text-primary px-2 py-1"
                                                        style={{ fontSize: '0.92rem' }}
                                                        onClick={() => editarCliente(item)}
                                                        title="Editar cliente"
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-light border text-danger px-2 py-1"
                                                        style={{ fontSize: '0.92rem' }}
                                                        onClick={() => eliminarCliente(item)}
                                                        title="Eliminar cliente"
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </Cell>
                                        </Row>
                                    ))}
                                </Body>
                            </>
                        )}
                    </Table>
                </div>

                {/* PAGINACION */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
                    <div className="small text-muted">
                        Mostrando {data.nodes.length} clientes • Página {pagination.state.page + 1} de {pagination.state.getTotalPages(data.nodes) || 1}
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
                        {getVisiblePageNumbers(pagination.state.page, pagination.state.getTotalPages(data.nodes) || 1, 5).map((pageIndex) => (
                            <button
                                key={pageIndex}
                                className={`btn btn-sm rounded-circle px-2 py-1 ${pagination.state.page === pageIndex ? 'btn-primary' : 'btn-light border'}`}
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                                onClick={() => pagination.fns.onSetPage(pageIndex)}
                            >
                                {pageIndex + 1}
                            </button>
                        ))}
                        {pagination.state.page < pagination.state.getTotalPages(data.nodes) - 1 && (
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
            <ReusableModal show={showModal} handleClose={handleClose} />
        </div>
    );
};
