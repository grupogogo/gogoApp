import { useEffect, useState } from "react";
import { useAuthStore, useClientesStore, useFuntions } from "../../hooks";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { Button } from "react-bootstrap";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";



export const TablaOtros = ({ ventasOtros }) => {

    const { formatearPrecio, capitalizarPrimeraLetra } = useFuntions();
    if (!ventasOtros && (ventasOtros = [])) return;
    const { user } = useAuthStore();
    const [search, setSearch] = useState("");

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
    }, [ventasOtros])

    return (
        <div className="card p-3 mb-1 rounded">
            <div>
                <div className="row mb-1 text-end justify-content-end align-items-center">
                    {/* Columna para el input */}
                    <div className="col-md-6 card-header bg-light">
                        <h6 className="text-start fw-semibold">Listado de Ventas otros</h6>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por producto"
                                value={search}
                                onChange={handleSearch}
                            />
                            <div className="input-group-append">
                                <button className="btn border border-circle" type="button">
                                    <i className="fas fa-search fa-sm" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <Table
                    className="table table-hover table table-hover text-start w-100 compact-table"
                    data={filteredData} theme={theme} pagination={pagination} sort={sort}>
                    {(tableList) => (
                        <>
                            <Header>
                                <HeaderRow className="table-light text-center fw-semibold">
                                    <HeaderCellSort sortKey={"PRODUCTO"} className='fw-semibold'>Producto</HeaderCellSort>
                                    <HeaderCellSort sortKey={"CANTIDAD"} className='fw-semibold'>Cantidad</HeaderCellSort>
                                    <HeaderCell  className='fw-semibold'>Precio</HeaderCell>
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
        </div >
    )
}
