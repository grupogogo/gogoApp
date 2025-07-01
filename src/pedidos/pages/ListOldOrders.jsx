import { useEffect, useRef, useState } from 'react'
import { LayoutApp } from '../../layout/LayoutApp'
import { useFuntions, usePedidosStore } from '../../hooks';
import { useSelector } from 'react-redux';
import { Table, Header, HeaderRow, Body, Row, Cell } from "@table-library/react-table-library/table";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { useMemo } from 'react';
import { useTheme } from '@table-library/react-table-library/theme';
import { DEFAULT_OPTIONS, getTheme } from '@table-library/react-table-library/mantine';
import { useRowSelect } from '@table-library/react-table-library/select';
import Form from 'react-bootstrap/Form';


import React, { Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

export const ListOldOrders = () => {
    const { startLoadingOldOrders } = usePedidosStore();
    const oldOrders = useSelector(state => state.pedidos.oldOrders) || [];
    const { formatearPrecio, convertirFechaIngles } = useFuntions();
    const [search, setSearch] = useState("");
    const modalRef = useRef();
    const [fechaPedido, setFechaPedido] = useState('2024');
    const [excluirCliente, setExcluirCliente] = useState(false);
    const [totalCategorias, setTotalCategorias] = useState({
        KCGA: 0,
        KCGO: 0,
        KCPA: 0,
        KCPO: 0,
        KBA: 0,
        KBO: 0,
        CBA: 0,
        CBO: 0,
        CCA: 0,
        CCO: 0
    });


    const filteredData = useMemo(() => {
        const nodes = oldOrders
            .filter((item) =>
                (
                    (excluirCliente ? !item.CLIENTE.toLowerCase().includes(search.toLowerCase()) : (item.CLIENTE.toLowerCase().includes(search.toLowerCase()))) ||
                    item.FECHA.toLowerCase().includes(search.toLowerCase()) ||
                    item.REMISION.toLowerCase().includes(search.toLowerCase())
                ) &&
                item.FECHA.toLowerCase().includes(fechaPedido)
            )
            .filter((item) => item.FECHA)
            .sort((a, b) => {
                const fechaA = convertirFechaIngles(a.FECHA);
                const fechaB = convertirFechaIngles(b.FECHA);
                return fechaB - fechaA;
            });

        return { nodes };
    }, [oldOrders, search, fechaPedido, excluirCliente]);
    // Fuera del render de la tabla
    const toggleRow = (index) => {
        setExpandedRows((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };
    const sort = useSort(
        filteredData,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {
                FECHA: (array) => array.sort((a, b) => convertirFechaIngles(a.FECHA) - convertirFechaIngles(b.FECHA)),
                CLIENTE: (array) => array.sort((a, b) => a.CLIENTE.localeCompare(b.CLIENTE)),
                REMISION: (array) => array.sort((a, b) => a.REMISION.localeCompare(b.REMISION)),
                NIT: (array) => array.sort((a, b) => a.NIT.localeCompare(b.NIT)),
                TOTAL: (array) => array.sort((a, b) => a.TOTAL - b.TOTAL),
                ITEMS: (array) => array.sort((a, b) => a.items.length - b.items.length),
            },
        }
    );
    const totalAnio =
        oldOrders
            .filter(item => item.FECHA?.toLowerCase().includes(fechaPedido))
            .reduce((acc, item) => acc + (item.TOTAL || 0), 0);
    const totalcantidadAnio =
        filteredData.nodes
            .reduce((acc, item) => acc + (item.items.reduce((acc, curr) => acc + (curr.CANTIDAD || 0), 0) || 0), 0);

    function onSortChange(action, state) {
        //console.log(action, state);
    }
    const handleSearch = (event) => {
        setSearch(event.target.value);
    };
    const handleDownloadPDF = () => {
        let timerInterval;
        Swal.fire({
            title: "Generando PDF!",
            html: '<l-quantum   size="25"   speed="1.75"   color="black"  ></l-quantum>',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log("I was closed by the timer");
            }
        });
        const element = modalRef.current; // tu contenido visible
        const opt = {
            margin: 0.5,
            filename: `Ventas Filtradas ${fechaPedido}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().set(opt).from(element).save();
    };

    const mantineTheme = getTheme({
        ...DEFAULT_OPTIONS,
        striped: true,
        highlightOnHover: true,
    });
    const customTheme = {
        Table: `
      --data-table-library_grid-template-columns:  44px repeat(5, minmax(0, 1fr));

      margin: 16px 0px;
    `,
    };
    const theme = useTheme([mantineTheme, customTheme]);

    //* Resize *//

    const resize = { resizerHighlight: '#0a0a0aff' };

    const select = useRowSelect(filteredData, {
        onChange: onSelectChange,
    });

    function onSelectChange(action, state) {
        console.log(action, state);
    }
    // Escapa adecuadamente las celdas para evitar errores con caracteres especiales
    const escapeCsvCell = (cell) => {
        if (cell == null) {
            return "";
        }
        const sc = cell.toString().trim();
        if (sc === "" || sc === '""') {
            return sc;
        }
        if (
            sc.includes('"') ||
            sc.includes(";") || // También escapa el nuevo delimitador
            sc.includes("\n") ||
            sc.includes("\r")
        ) {
            return '"' + sc.replace(/"/g, '""') + '"';
        }
        return sc;
    };

    // Genera los datos CSV usando ";" como delimitador de columnas
    const makeCsvData = (columns, data) => {
        const delimiter = ";"; // ← CAMBIO CLAVE

        // Encabezado
        const header = columns.map(({ name }) => escapeCsvCell(name)).join(delimiter) + "\r\n";

        // Filas de datos
        const rows = data.map((rowItem) =>
            columns.map(({ accessor }) => escapeCsvCell(accessor(rowItem))).join(delimiter)
        ).join("\r\n");

        return header + rows + "\r\n";
    };

    // Descarga el archivo CSV generado
    const downloadAsCsv = (columns, data, filename) => {
        const csvData = makeCsvData(columns, data);
        const csvFile = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
        const downloadLink = document.createElement("a");

        downloadLink.style.display = "none";
        downloadLink.download = filename;
        downloadLink.href = URL.createObjectURL(csvFile);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Llama esta función cuando quieras generar y descargar el archivo CSV
    const handleDownloadCsv = () => {
        const columns = [
            { accessor: (item) => item.FECHA, name: "Fecha" },
            { accessor: (item) => item.NIT, name: "NIT" },
            { accessor: (item) => item.REMISION, name: "Remisión" },
            { accessor: (item) => item.items.length, name: "Items" },
            { accessor: (item) => item.items.reduce((acc, curr) => acc + (curr.CANTIDAD || 0), 0), name: "Cantidad Productos" },
            { accessor: (item) => item.CLIENTE, name: "Cliente" },
            { accessor: (item) => item.TOTAL, name: "Total" },
        ];

        downloadAsCsv(columns, filteredData.nodes, "Tabla Pedidos Antiguos.csv");
    };

    useEffect(() => {
        if (!filteredData?.nodes) return;

        const codigos = ['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'];

        const nuevosTotales = codigos.reduce((acc, codigo) => {
            const resultado = filteredData.nodes
                .flatMap(order => order.items || [])
                .filter(prod => prod.CODIGO === codigo)
                .reduce(
                    (sum, prod) => {
                        sum.items += prod.CANTIDAD || 0;
                        sum.total += (prod.CANTIDAD || 0) * (prod.PRECIO || 0);
                        return sum;
                    },
                    { items: 0, total: 0 }
                );

            acc[codigo] = resultado;
            return acc;
        }, {});

        setTotalCategorias(nuevosTotales);
    }, [filteredData.nodes]);

    useEffect(() => {
        startLoadingOldOrders();
        console.log(filteredData.nodes);

    }, []);

    return (
        <LayoutApp>
            <>
                <div className='card'>
                    <div className='card-header text-center'>
                        <h6 className='fw-semibold'>Detalle pedidos {fechaPedido}</h6>
                    </div>
                    <div className='card-body' style={{ fontSize: '0.9rem' }}>
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm text-center align-middle w-100 mx-auto">
                                <thead className="table-secondary">
                                    <tr>
                                        {['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].map((codigo) => (
                                            <th key={codigo}>{codigo}</th>
                                        ))}
                                        <th>Total</th> {/* Columna adicional */}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].map((codigo) => (
                                            <td key={codigo}>
                                                {totalCategorias[codigo]?.items || 0}
                                            </td>
                                        ))}
                                        <td className="fw-bold">
                                            {
                                                ['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].reduce(
                                                    (acc, codigo) => acc + (totalCategorias[codigo]?.items || 0),
                                                    0
                                                )
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        {['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].map((codigo) => (
                                            <td key={codigo}>
                                                {formatearPrecio(totalCategorias[codigo]?.total || 0)}
                                            </td>
                                        ))}
                                        <td className="fw-bold">
                                            {
                                                formatearPrecio(
                                                    ['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].reduce(
                                                        (acc, codigo) => acc + (totalCategorias[codigo]?.total || 0),
                                                        0
                                                    )
                                                )
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className='text-end'>
                                    <tr>
                                        <td colSpan={11}>
                                            {totalcantidadAnio} Total de pedidos: <span className='fw-semibold'>{filteredData.nodes.length}</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                        </div>
                    </div>

                    <div className="card-footer d-flex justify-content-center align-items-center">
                        <div className="row w-100 text-center" style={{ fontSize: '0.9rem' }}>
                            <div className="col rounded bg-success d-flex align-items-center justify-content-center">
                                <p className="text-white mb-0">
                                    Total {fechaPedido}: <span className="fw-semibold">{formatearPrecio(totalAnio) || 0}</span>
                                </p>
                            </div>
                            <div className="col rounded bg-info d-flex align-items-center justify-content-center">
                                <p className="text-white mb-0">
                                    Total pedidos filtrados: <span className="fw-semibold">{formatearPrecio(filteredData.nodes.reduce((acc, item) => acc + item.TOTAL, 0)) || 0}</span>
                                </p>
                            </div>
                            <div className="col rounded bg-danger d-flex align-items-center justify-content-center">
                                <p className="text-white mb-0">
                                    Diferencia: <span className="fw-semibold">{formatearPrecio((filteredData.nodes.reduce((acc, item) => acc + item.TOTAL, 0) - totalAnio) || 0)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="card mt-4">
                    <div className="row m-3">
                        <div className="row">
                            <div className="card-header bg-white py-3">
                                <div className="row">
                                    <div className="col">
                                        <h5 className="m-0 font-weight-bold text-primary">Listado pedidos antiguos</h5>
                                    </div>
                                    <div className="col d-flex justify-content-end">
                                        <Button variant='danger-outline' className='btn btn-sm d-flex align-items-center gap-2 btn-outline-success m-1' onClick={handleDownloadCsv}>
                                            <i className="fa-solid fa-file-csv"></i>
                                            <span>Descargar CSV</span>
                                        </Button>
                                        <Button variant='danger-outline' className='btn btn-sm d-flex align-items-center gap-2 btn-outline-danger m-1' onClick={handleDownloadPDF}>
                                            <i className="fa-solid fa-file-pdf"></i>
                                            <span>Descargar PDF</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row mt-2'>
                            {/* Columna para el input */}
                            <div className="col mt-2">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar (Fecha, cliente, remisión, NIT)"
                                        value={search}
                                        onChange={handleSearch}
                                    />
                                    <div className="input-group-append">
                                        <Button className="btn border" type="button">
                                            <i className="fas fa-search fa-sm" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {/* Columna para el select cantidad items a mostrar */}
                            <div className="col text-end align-items-between ">
                                <div className="col align-items-end text-end">
                                    <div className="input-group form-select-sm">
                                        <span className='m-2'>Año a filtrar</span>
                                        <select
                                            className="form-select form-select-sm w-auto"
                                            title='Filtro por año'
                                            value={fechaPedido}
                                            style={{ maxWidth: 'fit-content' }}
                                            onChange={e => {
                                                const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                                                setFechaPedido(value);
                                            }}
                                        >
                                            <option value={'2024'}>2024</option>
                                            <option value={'2023'}>2023</option>
                                            <option value={'2022'}>2022</option>
                                            <option value={'2021'}>2021</option>
                                            <option value={'2020'}>2020</option>
                                            <option value={'2019'}>2019</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className='col'>
                                <Form.Check
                                    type="checkbox"
                                    label="Excluir coincidencias por cliente"
                                    checked={excluirCliente}
                                    onChange={(e) => setExcluirCliente(e.target.checked)}
                                />

                            </div>
                        </div>
                    </div>
                    <div className="m-4 page-break" ref={modalRef} style={{ maxHeight: "none", overflow: "visible" }}>
                        <Table
                            className="table table-hover text-start w-100 compact-table table avoid-break shadow-lg p-4"
                            style={{ maxWidth: "100%" }}
                            data={filteredData}
                            sort={sort}
                            theme={theme}
                            resize={resize}
                        >
                            {(tableList) => (
                                <>
                                    <Header>
                                        <HeaderRow className="text-center" style={{ background: "red" }}>
                                            <HeaderCellSort resize sortKey="FECHA" className="fw-semibold">
                                                Fecha
                                            </HeaderCellSort>
                                            <HeaderCellSort resize sortKey="NIT" className="fw-semibold">
                                                NIT / CC
                                            </HeaderCellSort>
                                            <HeaderCellSort resize sortKey="REMISION" className="fw-semibold">
                                                Remisión
                                            </HeaderCellSort>
                                            <HeaderCellSort resize sortKey="ITEMS" className="fw-semibold">
                                                Items
                                            </HeaderCellSort>
                                            <HeaderCellSort resize sortKey="ITEMS" className="fw-semibold">
                                                Productos
                                            </HeaderCellSort>
                                            <HeaderCellSort resize sortKey="CLIENTE" className="fw-semibold">
                                                Cliente
                                            </HeaderCellSort>
                                            <HeaderCellSort resize sortKey="TOTAL" className="fw-semibold">
                                                Total $
                                            </HeaderCellSort>
                                        </HeaderRow>
                                    </Header>

                                    <Body>
                                        {tableList.map((item, index) => (
                                            <React.Fragment key={index}>
                                                <Row item={item} className="text-left">
                                                    <Cell>
                                                        {item.FECHA}
                                                    </Cell>
                                                    <Cell>{item.NIT}</Cell>
                                                    <Cell>
                                                        <OverlayTrigger
                                                            trigger="click"
                                                            key="top"
                                                            placement="top"
                                                            overlay={
                                                                <Popover id={`popover-positioned-top`}
                                                                    style={{ maxWidth: 'none', width: 'auto' }} >
                                                                    <Popover.Header as="h3" className='fw-bold text-end'>Remisión: {item.REMISION}</Popover.Header>
                                                                    <Popover.Body>
                                                                        <div className="table-responsive">
                                                                            <table className="table table-sm table-bordered mb-0 w-auto rounded">
                                                                                <thead className="table-light">
                                                                                    <tr>
                                                                                        <th>Código</th>
                                                                                        <th>Producto</th>
                                                                                        <th>Cantidad</th>
                                                                                        <th>Precio</th>
                                                                                        <th>Total</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {item.items?.length > 0 && item.items.map((prod, i) => (
                                                                                        <tr key={i}>
                                                                                            <td>{prod.CODIGO}</td>
                                                                                            <td>{prod.PRODUCTO}</td>
                                                                                            <td className="text-center">{prod.CANTIDAD}</td>
                                                                                            <td className="text-end">{formatearPrecio(prod.PRECIO)}</td>
                                                                                            <td className="text-end">{formatearPrecio(prod.TOTAL)}</td>
                                                                                        </tr>
                                                                                    ))}

                                                                                    {item.items?.length > 0 && (
                                                                                        <tr className="fw-bold table-light">
                                                                                            <td colSpan={4} className="text-end">Total</td>
                                                                                            <td className="text-end">
                                                                                                {formatearPrecio(
                                                                                                    item.items.reduce((acc, curr) => acc + (curr.TOTAL || 0), 0)
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}

                                                                                    {(item.items?.length === 0 || !item.items) && (
                                                                                        <tr>
                                                                                            <td colSpan={5} className="text-center text-muted">Sin productos</td>
                                                                                        </tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </Popover.Body>

                                                                </Popover>
                                                            }
                                                        >
                                                            <Button variant="secondary">{item.REMISION}</Button>
                                                        </OverlayTrigger>
                                                    </Cell>
                                                    <Cell>{item.items?.length || 0}</Cell>
                                                    <Cell>{item.items.reduce((acc, curr) => acc + (curr.CANTIDAD || 0), 0) || 0}</Cell>
                                                    <Cell>{item.CLIENTE}</Cell>
                                                    <Cell className="text-end">{formatearPrecio(item.TOTAL)}</Cell>
                                                </Row>
                                            </React.Fragment>
                                        ))}
                                    </Body>

                                    {filteredData.nodes.length === 0 && (
                                        <Row>
                                            <Cell colSpan={6} className="text-center text-muted">
                                                No hay pedidos antiguos que coincidan con los criterios de búsqueda.
                                            </Cell>
                                        </Row>
                                    )}
                                </>
                            )}
                        </Table>
                    </div>
                </div>
            </>
        </LayoutApp>
    )
}
