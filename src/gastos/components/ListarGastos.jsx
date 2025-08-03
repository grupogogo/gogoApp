import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAuthStore, useFuntions } from '../../hooks';
import { useGastosStore } from '../../hooks/useGastosStore'
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Alert, Row as Fila } from 'react-bootstrap';
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import Swal from 'sweetalert2';
import { use } from 'react';

export const ListarGastos = ({ handleShow, setFechaActual, fechaActual }) => {
    const gastos = useSelector(state => state.gastos.gastos);
    const { formatearPrecio, buscarNombre, convertirFechaIngles, limpiarFecha, number_format, capitalize, convertirFecha } = useFuntions();
    const [search, setSearch] = useState("");
    const [isHideKits, setHideKits] = useState(false);
    const [isHideGuantes, setHideGuantes] = useState(false);
    const [isHideUser, setHideUser] = useState(false);
    const { setGastoActivo, startDeleteGasto, startLoadingGastos } = useGastosStore();
    const { user } = useAuthStore();
    const [fechaGasto, setFechaGasto] = useState('2025');
    const [itemsMostrar, setItemsMostrar] = useState(20);


    const filteredGastos = [...gastos]
        .filter((gasto) =>
            (
                gasto.gasto.toLowerCase().includes(search.toLowerCase()) ||
                gasto.proveedor.toLowerCase().includes(search.toLowerCase()) ||
                gasto.tipoGasto.toLowerCase().includes(search.toLowerCase()) ||
                gasto.fecha.toLowerCase().includes(search.toLowerCase())
            ) &&
            gasto.fecha.toLowerCase().includes(fechaGasto) // este sí se aplica aparte
        )
        .sort((a, b) => {
            const fechaA = convertirFechaIngles(a.fecha);
            const fechaB = convertirFechaIngles(b.fecha);
            return fechaB - fechaA;
        })
        .map((gasto) => ({
            ...gasto,
            id: gasto.gasto_id || gasto._id,
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
                FECHA: (array) => array.sort((a, b) => convertirFechaIngles(a.fecha) - convertirFechaIngles(b.fecha)),
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
    const pagination = usePagination(finalGastos, {
        state: {
            page: 0,
            size: itemsMostrar,
        },
    });
    const sizeColumnTheme = {
        Table: `
            --data-table-library_grid-template-columns: 
                7% 7% 24% 26% 7% 7% 7% 9% 6% !important;
        `,
    };
    const theme = useTheme([sizeColumnTheme]);


    const eliminarGasto = async (gasto) => {
        if (user.uid === gasto.user) {
            const result = await Swal.fire({
                icon: "warning",
                title: `Está seguro de ELIMINAR el gasto: "${gasto.gasto} | Proveedor: ${gasto.proveedor}"`,
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "red",
                confirmButtonText: "Eliminar",
            });

            if (result.isConfirmed) {
                await startDeleteGasto(gasto);  // esperar eliminación
                await startLoadingGastos();     // recargar gastos
                Swal.fire("Eliminado!", "", "success");
            }
        } else {
            Swal.fire({
                title: "El usuario NO tiene permiso para eliminar un gasto que no ha creado",
                icon: "error",
                confirmButtonColor: "red",
            });
        }
    };

    useEffect(() => {
        startLoadingGastos();
    }, [])
    useEffect(() => {
        const nuevoAnio = parseInt(fechaGasto, 10);

        // Asumiendo que tienes acceso a la fecha actual desde otro estado
        const fecha = new Date(); // fechaActual contiene día y mes correctos

        const nuevaFecha = (fechaGasto === '2025')
            ? new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes(), fecha.getSeconds())
            : new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), 0, 0, 0);

        setFechaActual(nuevaFecha);    // actualiza la fecha completa
    }, [fechaGasto])



    return (
        <>
            <div className="card shadow-none p-3 mb-5 rounded">
                <div className='row'>
                    <div className="card-header py-3 bg-white">
                        <div className='row'>
                            <div className='col-md-6'>
                                <h5 className="m-0 fw-bold text-primary">Listado de gastos</h5>
                            </div>
                            <div className='col-md-6 text-end align-items-center'>
                                <button
                                    onClick={handleShow}
                                    className='btn btn-outline-primary shadow btn-icon-split'>
                                    <span>
                                        <i className="fas fa-user fa-lg"></i>
                                    </span>
                                    <span> Ingresar nueva Compra / Servicio
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row d-flex  align-items-center mt-2 mb-2 justify-content-between">
                    {/* Columna para los checkboxes */}
                    <div className="col-md-5 d-flex align-items-center justify-content-between border rounded ml-3">
                        <div className="form-check m-1">
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
                        <div className="form-check m-1">
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
                        <div className="form-check m-1">
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


                    {/* Columna para el filtro */}
                    <div className="col-md-4 align-items-center">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtro (Tipo, proveedor, gasto o fecha)"
                                value={search}
                                onChange={handleSearch}
                            />
                            <span className='input-group-text'>
                                <i className="fa fa-sliders" />
                            </span>
                        </div>
                    </div>
                </div>
                <div>

                    <Fila className='justify-content-between'>
                        {/* Columna para el select año */}
                        <div className="col-3 align-items-center">
                            <div className="input-group form-select-sm">
                                <span className='m-2'>Año a filtrar</span>
                                <select
                                    className="form-select form-select-sm"
                                    title="Filtro por año"
                                    style={{ maxWidth: 'fit-content' }}
                                    value={fechaGasto} // solo el año
                                    onChange={e => {
                                        setFechaGasto(e.target.value); // actualiza el año como string                                       
                                        pagination.fns.onSetPage(0);
                                    }}
                                >
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                    <option value="2020">2020</option>
                                    <option value="2019">2019</option>
                                    <option value="2018">2018</option>
                                    <option value="2017">2017</option>
                                </select>
                            </div>
                        </div>
                        {/* Columna para el select cantidad items a mostrar */}
                        <div className="col-md-2 align-items-center m-1">
                            <div className="input-group form-select-sm">
                                <span className='m-2'>
                                    Items
                                </span>
                                <select
                                    className="form-select form-select-sm"
                                    value={itemsMostrar}
                                    title='Cantidad de items a mostrar'
                                    style={{ maxWidth: 'fit-content' }}
                                    onChange={e => {
                                        const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                                        setItemsMostrar(value);
                                        pagination.fns.onSetPage(0);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value="todos">Todos</option>
                                </select>
                            </div>
                        </div>
                    </Fila>
                    <Table
                        className="table table-hover compact-table"
                        data={data}
                        theme={theme}
                        pagination={pagination}
                        sort={sort}
                    >
                        {(tableList) => (
                            <>
                                <Header className="bg-primary">
                                    <HeaderRow>
                                        <HeaderCellSort sortKey={'INGRESO'} className='text-start'>Fecha</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TIPO'} className='text-start'>Tipo</HeaderCellSort>
                                        <HeaderCellSort sortKey={'PROVEEDOR'} className='text-start'>Proveedor</HeaderCellSort>
                                        <HeaderCellSort sortKey={'GASTO'} className='text-center'>P/S</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CATEGORIA'} className='text-start'>Categoria</HeaderCellSort>
                                        <HeaderCellSort sortKey={'PRECIO'} className='text-center'>Precio</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CANTIDAD'} className='text-center'>Cant</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TOTAL'} className='text-center'>Total</HeaderCellSort>
                                        <HeaderCell className='text-center fw-semibold'></HeaderCell>
                                    </HeaderRow>
                                </Header>


                                <Body>
                                    {tableList.map((item, index) => (
                                        <Row key={index} item={item}
                                        >
                                            <Cell title={item.fecha} style={{ with: '5%' }}>{limpiarFecha(item.fecha)}</Cell>
                                            <Cell title="" className={item.user === user.uid ? 'border border-3 border-info-subtle' : 'border border-3 border-danger-subtle'}>{item.tipoGasto}</Cell>
                                            <Cell title={item.proveedor}>{capitalize(item.proveedor)}</Cell>
                                            <Cell className="fw-semibold text-center"
                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                title={item.gasto}
                                            >
                                                <button
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1"
                                                    onClick={() => {
                                                        setGastoActivo(item);
                                                        const currentYear = new Date().getFullYear().toString();
                                                        if (fechaGasto !== currentYear) {
                                                            setFechaActual(convertirFechaIngles(item.fecha));
                                                        } else {
                                                            setFechaActual(new Date());
                                                        }
                                                        handleShow();
                                                    }}>
                                                    {capitalize(item.gasto)}
                                                </button>
                                            </Cell>
                                            <Cell title={item.categoria + ' - ' + item.subCategoria}>{item.categoria} - {item.subCategoria}</Cell>
                                            <Cell className="text-end">{formatearPrecio(item.precio)}</Cell>
                                            <Cell className="text-end">{number_format(item.cantidad)}</Cell>
                                            <Cell className="text-end fw-semibold">{formatearPrecio((item.cantidad) * (item.precio))}</Cell>
                                            <Cell className="text-end fw-semibold">
                                                <div className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger py-1"
                                                        onClick={() => eliminarGasto(item)}
                                                        title="Eliminar gasto"
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
        </ >
    )
}
