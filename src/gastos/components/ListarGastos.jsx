import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { useAuthStore, useFuntions } from '../../hooks';
import { useGastosStore } from '../../hooks/useGastosStore'
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Alert, Button } from 'react-bootstrap';
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";

export const ListarGastos = ({ handleShow }) => {
    const gastos = useSelector(state => state.gastos.gastos);
    const { formatearPrecio, buscarNombre, convertirFecha, limpiarFecha, number_format } = useFuntions();
    const [search, setSearch] = useState("");
    const [isHideKits, setHideKits] = useState(false);
    const [isHideGuantes, setHideGuantes] = useState(false);
    const [isHideUser, setHideUser] = useState(false);
    const { setGastoActivo } = useGastosStore();
    const { user } = useAuthStore();

    // Ordenar el listado de gastos y calcular total
    const filteredGastos = [...gastos]
        .filter((gasto) =>
            gasto.gasto.toLowerCase().includes(search.toLowerCase()) ||
            gasto.proveedor.toLowerCase().includes(search.toLowerCase()) ||
            gasto.tipoGasto.toLowerCase().includes(search.toLowerCase()) ||
            gasto.fecha.toLowerCase().includes(search.toLowerCase())
        )
        .filter((gasto) => gasto.fecha) // Validar que la fecha sea utilizable
        .sort((a, b) => {
            // Convertir las fechas para ordenarlas
            const fechaA = convertirFecha(a.fecha);
            const fechaB = convertirFecha(b.fecha);
            return fechaB - fechaA; // Ordenar de más reciente a más antigua
        })
        .map((gasto) => ({
            ...gasto,
            id: gasto.gasto_id || gasto._id, // Identificador único
        }));

    // Aplicar filtros adicionales
    let finalGastos = filteredGastos;
    if (isHideKits) finalGastos = finalGastos.filter((node) => node.categoria === "K");
    if (isHideGuantes) finalGastos = finalGastos.filter((node) => node.categoria === "G");
    if (isHideUser) finalGastos = finalGastos.filter((node) => node.user === user.uid);

    // Calcular la suma total
    const total = finalGastos.reduce((sum, gasto) => sum + (gasto.cantidad * gasto.precio), 0);

    // Mostrar el total en consola
    //console.log("🔹 Total de gastos filtrados:", formatearPrecio(total));

    const data = { nodes: finalGastos };

    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {
                FECHA: (array) => array.sort((a, b) => a.fecha - b.fecha),
                TIPO: (array) => array.sort((a, b) => a.tipoGasto.localeCompare(b.tipoGasto)),
                PROVEEDOR: (array) => array.sort((a, b) => a.proveedor.localeCompare(b.proveedor)),
                GASTO: (array) => array.sort((a, b) => a.gasto.localeCompare(b.gasto)),
                CATEGORIA: (array) => array.sort((a, b) => a.subCategoria.localeCompare(b.subCategoria)),
                PRECIO: (array) =>
                    array.sort((a, b) => a.precio - b.precio),
                CANTIDAD: (array) =>
                    array.sort((a, b) => a.cantidad - b.cantidad),
                TOTAL: (array) =>
                    array.sort((a, b) => (a.cantidad * a.precio) - (b.cantidad * b.precio)),
            },
        }
    );

    function onSortChange(action, state) {
        //console.log(action, state);
    }
    const handleSearch = (event) => {
        setSearch(event.target.value);
    };
    const pagination = usePagination(data, {
        state: {
            page: 0,
            size: 10,
        },
    });
    const sizeColumnTheme = {
        Table: `
            --data-table-library_grid-template-columns: 
                auto 8% auto auto 8% 8% 7% 10% !important;
        `,
    };
    const theme = useTheme([sizeColumnTheme]);

    return (
        <div className="">
            <div className="card shadow-none p-3 mb-5 bg-body-tertiary rounded">
                <div className='row'>
                    <div className="card-header py-3">
                        <div className='row'>
                            <div className='col-md-6'>

                                <h5 className="m-0 font-weight-bold text-black">Listado de gastos</h5>
                            </div>
                            <div className='col-md-6 text-end'>
                                <Button
                                    onClick={handleShow}
                                    variant='success'> Ingresar nueva Compra / Servicio
                                    <span className="ml-2">
                                        <i className="fas fa-user"></i>
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="row align-items-center mt-2 mb-3">
                        {/* Columna para los checkboxes */}
                        <div className="col-md-6 d-flex gap-3">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="soloKits"
                                    checked={isHideKits}
                                    onChange={() => {
                                        setHideKits(!isHideKits);
                                        setHideGuantes(isHideKits);
                                    }}
                                    onDoubleClick={() => setHideKits(false)}
                                />
                                <label className="form-check-label" htmlFor="soloKits">
                                    Kits
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isHideGuantes}
                                    onChange={() => {
                                        setHideGuantes(!isHideGuantes);
                                        setHideKits(isHideGuantes);
                                    }}
                                    onDoubleClick={() => setHideGuantes(false)}
                                />
                                <label className="form-check-label" htmlFor="soloGuantes">
                                    Guantes
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isHideUser}
                                    onChange={() => {
                                        setHideUser(!isHideUser);
                                        //setHideKits(isHideUser);
                                    }}
                                    onDoubleClick={() => setHideUser(false)}
                                />
                                <label className="form-check-label" htmlFor="soloGuantes">
                                    Propios
                                </label>
                            </div>
                        </div>

                        {/* Columna para el input */}
                        <div className="col-md-6">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filtro (Tipo, proveedor, gasto o fecha)"
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

                    <Table
                        className="table table-hover text-start w-100 table table-hover text-start w-100 compact-table"
                        style={{ maxwidth: "100%" }}
                        data={data}
                        theme={theme}
                        pagination={pagination}
                        sort={sort}
                    >
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow className="table-light">
                                        <HeaderCellSort sortKey={'INGRESO'} className='text-start fw-semibold'>Fecha</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TIPO'} className='text-start fw-semibold'>Tipo</HeaderCellSort>
                                        <HeaderCellSort sortKey={'PROVEEDOR'} className='text-start fw-semibold'>Proveedor</HeaderCellSort>
                                        <HeaderCellSort sortKey={'GASTO'} className='text-start fw-semibold'>P/S</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CATEGORIA'} className='text-start fw-semibold'>Categoria</HeaderCellSort>
                                        <HeaderCellSort sortKey={'PRECIO'} className='text-center fw-semibold'>Precio</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CANTIDAD'} className='text-center fw-semibold'>Cant</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TOTAL'} className='text-center fw-semibold'>Total</HeaderCellSort>
                                    </HeaderRow>
                                </Header>


                                <Body>
                                    {tableList.map((item, index) => (
                                        <Row key={index} item={item}
                                        >
                                            <Cell title={item.fecha} style={{ with: '5%' }}>{limpiarFecha(item.fecha)}</Cell>
                                            <Cell title="" className={item.user === user.uid ? 'border border-3 border-info-subtle' : 'border border-3 border-danger-subtle'}>{item.tipoGasto}</Cell>
                                            <Cell title={item.proveedor}>{item.proveedor}</Cell>
                                            <Cell className="fw-semibold text-start"
                                                title={item.gasto}
                                            >
                                                <button onClick={() => {
                                                    setGastoActivo(item)
                                                    handleShow();
                                                }}>
                                                    {item.gasto}
                                                </button>
                                            </Cell>
                                            <Cell title={buscarNombre(item.categoria)}>{item.categoria} - {item.subCategoria}</Cell>
                                            <Cell className="text-end">{formatearPrecio(item.precio)}</Cell>
                                            <Cell className="text-end">{number_format(item.cantidad)}</Cell>
                                            <Cell className="text-end fw-semibold">{formatearPrecio((item.cantidad) * (item.precio))}</Cell>
                                        </Row>
                                    ))}
                                </Body>

                            </>
                        )}
                    </Table>
                    <div className="text-center fw-bold">
                        <Alert variant="info" className="d-none d-lg-block">
                            🔹 Total de gastos filtrados: {formatearPrecio(total)}
                        </Alert>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", width: "99%" }}>
                        <span className="fw-semibold">Total registros: {data.nodes.length}</span>
                        <span className="fw-semibold">Páginas: {pagination.state.getTotalPages(data.nodes)}</span>
                        <span>
                            Página:{" "}
                            {pagination.state.getPages(data.nodes).map((_, index) => (
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
                </div>
            </div >
        </ div>
    )
}
