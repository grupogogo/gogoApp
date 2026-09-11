import { useEffect, useState } from "react";
import { useAuthStore, useClientesStore, useFuntions } from "../../hooks";
import { getVisiblePageNumbers } from "../../helpers";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";



export const TablaOtros = ({ ventasOtros = [], pedidosUsuario = [], anioFiltro = '2026' }) => {

    const anioFiltroString = anioFiltro.toString();
    const { user } = useAuthStore();
    const {
        formatearPrecio,
        capitalizarPrimeraLetra,
        aTitulo,
        esOscar,
        esLeonardo,
        esKarol,
        esUserLeonardo,
        esUserKarol
    } = useFuntions();
    const [search, setSearch] = useState("");
    const [categoriaTotales, setCategoriaTotales] = useState({});

    useEffect(() => {
        if (!pedidosUsuario) return;

        const totales = {};

        const countQuantities = (node, catName = '', pedidoUserId = '', pedidoUserName = '', pedidoUserEmail = '') => {
            let stats = { total: 0, gender0: 0, gender1: 0 };
            if (!node || typeof node !== 'object') return stats;

            if (node.pedido && Array.isArray(node.pedido)) {
                node.pedido.forEach(prod => {
                    const prodName = prod.producto || '';
                    const esGuante = catName.includes('GUANTE') || prodName.toLowerCase().includes('guante');
                    if (esGuante) {
                        if (esKarol && pedidoUserId !== user?.uid) return;
                        if (esLeonardo && !esUserLeonardo(pedidoUserId, pedidoUserName) && !esUserKarol(pedidoUserId, pedidoUserName, pedidoUserEmail)) return;
                        if (!esOscar && !esLeonardo && pedidoUserId !== user?.uid) return;
                    }

                    const cantidad = parseInt(prod.cantidad) || 0;
                    stats.total += cantidad;
                    if (String(prod.genero) === "0") stats.gender0 += cantidad;
                    if (String(prod.genero) === "1") stats.gender1 += cantidad;
                });
            }

            Object.keys(node).forEach(key => {
                if (key !== 'pedido' && typeof node[key] === 'object') {
                    const childStats = countQuantities(node[key], catName, pedidoUserId, pedidoUserName, pedidoUserEmail);
                    stats.total += childStats.total;
                    stats.gender0 += childStats.gender0;
                    stats.gender1 += childStats.gender1;
                }
            });

            return stats;
        };

        pedidosUsuario.forEach(pedido => {
            if (!pedido.fechaCreacion.includes(anioFiltroString)) return;
            const pedidoUserId = (pedido.user?._id || pedido.user)?.toString();
            const pedidoUserName = (pedido.user?.name || '').toLowerCase();
            const pedidoUserEmail = (pedido.user?.email || '').toLowerCase();

            // Si es Karol: únicamente sus pedidos
            if (esKarol && pedidoUserId !== user?.uid) return;

            // Si es Leonardo: sus pedidos y los de Karol
            if (esLeonardo && !esUserLeonardo(pedidoUserId, pedidoUserName) && !esUserKarol(pedidoUserId, pedidoUserName, pedidoUserEmail)) return;

            if (pedido.itemPedido && Array.isArray(pedido.itemPedido)) {
                pedido.itemPedido.forEach(item => {
                    if (item.itemPedido) {
                        Object.keys(item.itemPedido).forEach(categoria => {
                            if (categoria === 'GUANTES') {
                                if (esKarol && pedidoUserId !== user?.uid) return;
                                if (esLeonardo && !esUserLeonardo(pedidoUserId, pedidoUserName) && !esUserKarol(pedidoUserId, pedidoUserName, pedidoUserEmail)) return;
                                if (!esOscar && !esLeonardo && pedidoUserId !== user?.uid) return;
                            }
                            const categoriaData = item.itemPedido[categoria];

                            if (!totales[categoria]) {
                                totales[categoria] = { total: 0, gender0: 0, gender1: 0 };
                            }
                            const stats = countQuantities(categoriaData, categoria, pedidoUserId);
                            totales[categoria].total += stats.total;
                            totales[categoria].gender0 += stats.gender0;
                            totales[categoria].gender1 += stats.gender1;

                            // Logic for subcategories (specifically for GUANTES or similar structures)
                            Object.keys(categoriaData).forEach(subKey => {
                                if (subKey !== 'pedido' && subKey !== 'detalleGeneral' && typeof categoriaData[subKey] === 'object') {
                                    const subCategoriaName = `${categoria} - ${subKey}`;
                                    if (!totales[subCategoriaName]) {
                                        totales[subCategoriaName] = { total: 0, gender0: 0, gender1: 0 };
                                    }
                                    const subStats = countQuantities(categoriaData[subKey], subCategoriaName, pedidoUserId);
                                    totales[subCategoriaName].total += subStats.total;
                                    totales[subCategoriaName].gender0 += subStats.gender0;
                                    totales[subCategoriaName].gender1 += subStats.gender1;
                                }
                            });
                        });
                    }
                });
            }
        });
        setCategoriaTotales(totales);
    }, [pedidosUsuario, anioFiltroString]);

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const filteredData = {
        nodes: ventasOtros
            .filter((ventaOtro) =>
            (
                ventaOtro.categoria.toLowerCase().includes(search.toLowerCase())
            )
            )
    }

    const sort = useSort(
        filteredData,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {


                PRODUCTO: (array) => array.sort((a, b) => a.categoria.localeCompare(b.categoria)),
                CANTIDAD: (array) =>
                    array.sort((a, b) => a.cantidad - b.cantidad),
                TOTAL: (array) =>
                    array.sort((a, b) => (a.totalPrecio * a.cantidad) - (b.totalPrecio * b.cantidad)),
            },
        }
    );

    function onSortChange(action, state) {
        //console.log(action, state);
    }
    const pagination = usePagination(filteredData, {
        state: {
            page: 0,
            size: 10,
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
             1fr
             max-content  
             max-content 
             max-content  

            !important;
    `,
    }

    const theme = useTheme(
        [marginTheme, sizeColumnTheme]
    );


    useEffect(() => {


    }, [ventasOtros, pedidosUsuario])

    return (
        <div className="card border border-light-subtle shadow-sm rounded-4 p-3 mb-3">
            <div className="row g-3">
                <div className="col-12 col-lg-6">
                    <div className="card border-0 bg-light p-3 rounded-3 h-100">
                        <h6 className="card-title fw-bold text-dark mb-3">
                            <i className="fas fa-venus-mars me-2 text-primary"></i>Totales por Género
                        </h6>
                        <Table data={{ nodes: Object.entries(categoriaTotales) }} className="table table-hover table-sm table-striped text-center align-middle" >
                            {(tableList) => (
                                <>
                                    <Header>
                                        <HeaderRow className="table-light fw-semibold">
                                            <HeaderCell className="text-start ps-2">Categoría</HeaderCell>
                                            <HeaderCell>Niño</HeaderCell>
                                            <HeaderCell>Niña</HeaderCell>
                                            <HeaderCell>Total</HeaderCell>
                                        </HeaderRow>
                                    </Header>

                                    <Body>
                                        {tableList.map(([categoria, stats]) => (
                                            <Row key={categoria} item={{ categoria, ...stats }}>
                                                <Cell className="text-start ps-2 fw-medium">{aTitulo(categoria)}</Cell>
                                                <Cell><span className="badge bg-primary-subtle text-primary">{stats.gender0}</span></Cell>
                                                <Cell><span className="badge bg-danger-subtle text-danger">{stats.gender1}</span></Cell>
                                                <Cell className="fw-bold text-dark">{stats.total}</Cell>
                                            </Row>
                                        ))}
                                    </Body>
                                </>
                            )}
                        </Table>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="card border-0 bg-light p-3 rounded-3 h-100">
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-sm-5">
                                <h6 className="card-title fw-bold text-dark mb-0">
                                    <i className="fas fa-list-alt me-2 text-primary"></i>Venta Otros Productos
                                </h6>
                            </div>

                            <div className="col-12 col-sm-7 mt-2 mt-sm-0">
                                <div className="input-group input-group-sm">
                                    <input
                                        type="text"
                                        className="form-control rounded-start-pill ps-3"
                                        placeholder="Buscar producto..."
                                        value={search}
                                        onChange={handleSearch}
                                    />
                                    <button className="btn btn-outline-secondary rounded-end-pill px-3" type="button">
                                        <i className="fas fa-search fa-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Table
                            className="table table-hover table-sm table-striped text-start compact-table align-middle"
                            data={filteredData} theme={theme} pagination={pagination} sort={sort}>
                            {(tableList) => (
                                <>
                                    <Header>
                                        <HeaderRow className="table-light text-center fw-semibold">
                                            <HeaderCellSort sortKey={"PRODUCTO"} className='fw-semibold text-start ps-2'>Producto</HeaderCellSort>
                                            <HeaderCellSort sortKey={"CANTIDAD"} className='fw-semibold'>Cantidad</HeaderCellSort>
                                            <HeaderCell className='fw-semibold'>Precio Unit.</HeaderCell>
                                            <HeaderCellSort sortKey={"TOTAL"} className='fw-semibold text-end pe-2'>Total</HeaderCellSort>
                                        </HeaderRow>
                                    </Header>
                                    <Body>
                                        {tableList.map((item, index) => (
                                            <Row
                                                key={index}
                                                item={item}
                                            >
                                                <Cell className="text-start ps-2 fw-medium">{aTitulo(item.categoria)}</Cell>
                                                <Cell className="text-center">{item.cantidad}</Cell>
                                                <Cell className="text-end">{formatearPrecio((item.totalPrecio) / (item.cantidad || 1))}</Cell>
                                                <Cell className="text-end pe-2 fw-bold text-dark">{formatearPrecio(item.totalPrecio)}</Cell>
                                            </Row>
                                        ))}
                                    </Body>
                                </>
                            )}
                        </Table>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "99%", alignItems: "center" }}>
                        <span className="fw-semibold" style={{ fontSize: "0.80rem" }}>
                            Total General: {formatearPrecio(filteredData.nodes.reduce((acc, item) => acc + (parseFloat(item.totalPrecio) || 0), 0))}
                        </span>
                        <span className="fw-semibold" style={{ fontSize: "0.80rem" }}>Registros: {filteredData.nodes.length}</span>
                        <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>Páginas: {pagination.state.getTotalPages(filteredData.nodes)}</span>
                        <span className="d-flex align-items-center gap-1">
                            <span style={{ fontSize: "0.85rem", marginRight: "5px" }}>Página:</span>
                            {pagination.state.page > 0 && (
                                <button
                                    className="btn btn-light btn-sm border rounded-pill px-2 py-0"
                                    style={{ fontSize: "0.75rem" }}
                                    onClick={() => pagination.fns.onSetPage(pagination.state.page - 1)}
                                >
                                    &laquo; Ant
                                </button>
                            )}
                            {getVisiblePageNumbers(pagination.state.page, pagination.state.getTotalPages(filteredData.nodes) || 1, 5).map((pageIndex) => (
                                <button
                                    className={(pagination.state.page === pageIndex) ? 'btn btn-secondary btn-sm m-1 border' : 'btn btn-light btn-sm m-1 border'}
                                    key={pageIndex}
                                    type="button"
                                    style={{
                                        fontWeight: pagination.state.page === pageIndex ? "bold" : "normal",
                                        padding: "2px 6px",
                                        fontSize: "0.80rem"
                                    }}
                                    onClick={() => pagination.fns.onSetPage(pageIndex)}
                                >
                                    {pageIndex + 1}
                                </button>
                            ))}
                            {pagination.state.page < pagination.state.getTotalPages(filteredData.nodes) - 1 && (
                                <button
                                    className="btn btn-light btn-sm border rounded-pill px-2 py-0"
                                    style={{ fontSize: "0.75rem" }}
                                    onClick={() => pagination.fns.onSetPage(pagination.state.page + 1)}
                                >
                                    Sig &raquo;
                                </button>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};
