import { useEffect, useState } from "react";
import { useAuthStore, useClientesStore, useFuntions } from "../../hooks";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";



export const TablaOtros = ({ ventasOtros, pedidosUsuario, anioFiltro = '2026' }) => {

    const anioFiltroString = anioFiltro.toString();
    const { formatearPrecio, capitalizarPrimeraLetra } = useFuntions();
    if (!ventasOtros && (ventasOtros = [])) return;
    const [search, setSearch] = useState("");
    const [categoriaTotales, setCategoriaTotales] = useState({});

    useEffect(() => {
        if (!pedidosUsuario) return;

        const totales = {};

        const countQuantities = (node) => {
            let stats = { total: 0, gender0: 0, gender1: 0 };
            if (!node || typeof node !== 'object') return stats;

            if (node.pedido && Array.isArray(node.pedido)) {
                node.pedido.forEach(prod => {
                    const cantidad = parseInt(prod.cantidad) || 0;
                    stats.total += cantidad;
                    if (String(prod.genero) === "0") stats.gender0 += cantidad;
                    if (String(prod.genero) === "1") stats.gender1 += cantidad;
                });
            }

            Object.keys(node).forEach(key => {
                if (key !== 'pedido' && typeof node[key] === 'object') {
                    const childStats = countQuantities(node[key]);
                    stats.total += childStats.total;
                    stats.gender0 += childStats.gender0;
                    stats.gender1 += childStats.gender1;
                }
            });

            return stats;
        };

        pedidosUsuario.forEach(pedido => {
            if (!pedido.fechaCreacion.includes(anioFiltroString)) return;
            if (pedido.itemPedido && Array.isArray(pedido.itemPedido)) {
                pedido.itemPedido.forEach(item => {
                    if (item.itemPedido) {
                        Object.keys(item.itemPedido).forEach(categoria => {
                            const categoriaData = item.itemPedido[categoria];

                            if (!totales[categoria]) {
                                totales[categoria] = { total: 0, gender0: 0, gender1: 0 };
                            }
                            const stats = countQuantities(categoriaData);
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
                                    const subStats = countQuantities(categoriaData[subKey]);
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
        <div className="card p-3 mb-1 rounded">
            <div className="row">
                <div className="col-6 card p-3 mr-2">
                    <h5 className="card-title">Totales por género</h5>
                    <Table data={{ nodes: Object.entries(categoriaTotales) }} className="table table-hover table-sm table-striped text-center" >
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow>
                                        <HeaderCell>Categoria</HeaderCell>
                                        <HeaderCell>Niño</HeaderCell>
                                        <HeaderCell>Niña</HeaderCell>
                                        <HeaderCell>Total</HeaderCell>
                                    </HeaderRow>
                                </Header>

                                <Body>
                                    {tableList.map(([categoria, stats]) => (
                                        <Row key={categoria} item={{ categoria, ...stats }}>
                                            <Cell>{categoria}</Cell>
                                            <Cell>{stats.gender0}</Cell>
                                            <Cell>{stats.gender1}</Cell>
                                            <Cell>{stats.total}</Cell>
                                        </Row>
                                    ))}
                                </Body>
                            </>
                        )}
                    </Table>
                </div>
                <div className="col-6 card p-3">
                    <div className="row mb-2 align-items-center">

                        <div className="col-4">
                            <h5 className="card-title mb-0">Ventas otros</h5>
                        </div>

                        <div className="col-8">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por producto"
                                    value={search}
                                    onChange={handleSearch}
                                />
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search fa-sm" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <Table
                        className="table table-hover table-sm table-striped text-start compact-table"
                        data={filteredData} theme={theme} pagination={pagination} sort={sort}>
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow className="table-light text-center fw-semibold">
                                        <HeaderCellSort sortKey={"PRODUCTO"} className='fw-semibold'>Producto</HeaderCellSort>
                                        <HeaderCellSort sortKey={"CANTIDAD"} className='fw-semibold'>Cantidad</HeaderCellSort>
                                        <HeaderCell className='fw-semibold'>Precio</HeaderCell>
                                        <HeaderCellSort sortKey={"TOTAL"} className='fw-semibold'>Total</HeaderCellSort>
                                    </HeaderRow>
                                </Header>
                                <Body>
                                    {tableList.map((item, index) => (
                                        <Row
                                            key={index}
                                            item={item}
                                        >
                                            <Cell>{capitalizarPrimeraLetra(((item.categoria).split('- ')[1]))}</Cell>
                                            <Cell className="text-center">{item.cantidad}</Cell>
                                            <Cell className="text-end">{formatearPrecio((item.totalPrecio) / (item.cantidad))}</Cell>
                                            <Cell className="text-end">{formatearPrecio(item.totalPrecio)}</Cell>
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
                        <span>
                            <span style={{ fontSize: "0.85rem", marginRight: "5px" }}>Página:</span>
                            {pagination.state.getPages(filteredData.nodes).map((_, index) => (
                                <button
                                    className={(pagination.state.page === index) ? 'btn btn-secondary btn-sm m-1 border' : 'btn btn-light btn-sm m-1 border'}
                                    key={index}
                                    type="button"
                                    style={{
                                        fontWeight: pagination.state.page === index ? "bold" : "normal",
                                        padding: "2px 6px",
                                        fontSize: "0.80rem"
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
        </div >
    )
}
