import { useEffect, useRef, useState } from 'react'
import { LayoutApp } from '../../layout/LayoutApp'
import { useFuntions, usePedidosStore } from '../../hooks';
import { useSelector } from 'react-redux';
import { useTheme } from "@table-library/react-table-library/theme";
import { Table, Header, HeaderRow, Body, Row, Cell } from "@table-library/react-table-library/table";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { getTheme } from "@table-library/react-table-library/baseline";





export const ListOldOrders = () => {
    const { startLoadingOldOrders } = usePedidosStore();
    const oldOrders = useSelector(state => state.pedidos.oldOrders);
    const { formatearPrecio, convertirFechaIngles } = useFuntions();
    const [search, setSearch] = useState("");
    const modalRef = useRef();
    const [fechaPedido, setFechaPedido] = useState('2024');


    const filteredData = {
        nodes: oldOrders
            .filter((item) =>
                (
                    item.CLIENTE.toLowerCase().includes(search.toLowerCase()) ||
                    item.FECHA.toLowerCase().includes(search.toLowerCase()) ||
                    item.REMISION.toLowerCase().includes(search.toLowerCase())
                ) &&
                item.FECHA.toLowerCase().includes(fechaPedido)
            )
            .filter((item) => item.FECHA) // Validar que la fecha sea utilizable
            .sort((a, b) => {
                const fechaA = convertirFechaIngles(a.FECHA);
                const fechaB = convertirFechaIngles(b.FECHA);
                return fechaB - fechaA; // Ordenar de más reciente a más antigua
            }),
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
            },
        }
    );


    function onSortChange(action, state) {
        //console.log(action, state);
    }
    const sizeColumnTheme = {
        Table: `
              --data-table-library_grid-template-columns: 
                  auto auto auto auto auto !important;
          `,
    };
    const theme = useTheme(getTheme());


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
            filename: `CxC_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf().set(opt).from(element).save();
    };

    useEffect(() => {
        startLoadingOldOrders();
    }, []);


    return (
        <LayoutApp>
            <>
                <div className='card'>
                    <div className='card-header text-center'>
                        <h6 className='fw-semibold'>Detalle pedidos {fechaPedido}</h6>
                    </div>
                    <div className='card-body'>
                        <p className='text-muted'>Total de pedidos: <span className='fw-semibold'>{filteredData.nodes.length}</span></p>

                    </div>
                    <div className='card-footer text-end'>
                        <p className='text-muted'>Total pedidos filtrados: <span className='fw-semibold'>{formatearPrecio(filteredData.nodes.reduce((acc, item) => acc + item.TOTAL, 0))}</span></p>
                    </div>
                </div>
                <div className="card mt-4">
                    <div className="row m-3">
                        <div className="row">
                            <div className="card-header bg-white py-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h5 className="m-0 font-weight-bold text-primary">Listado pedidos antiguos</h5>
                                    </div>
                                    <div className="col-md-6 d-flex justify-content-end">
                                        <button className='btn btn-sm d-flex align-items-center gap-2 btn-outline-danger' onClick={handleDownloadPDF}>
                                            <i className="fa-solid fa-file-pdf"></i>
                                            <span>Descargar PDF</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row mt-2'>

                            {/* Columna para el input */}
                            <div className="col-6">
                                <label htmlFor="estadoSelect" className="form-label fw-semibold">Buscar:</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Filtro (Fecha, cliente, remisión, NIT)"
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
                            {/* Columna para el select cantidad items a mostrar */}
                            <div className="col-6">
                                <div className="col-3 align-items-center">

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
                        </div>
                    </div>
                    <div className="m-4 page-break" ref={modalRef} style={{ maxHeight: "none", overflow: "visible" }}>
                        <div className='text-center fs-5'>
                            <div className="alert alert-primary" role="alert">
                                <span className='fw-semibold'></span>
                                <span className='fw-semibold'>Listado de cuentas por cobrar</span>
                            </div>
                        </div>
                        <Table
                            className="table table-hover text-start w-100 compact-table table avoid-break"
                            style={{ maxWidth: "100%" }}
                            data={filteredData}
                            theme={theme}
                            sort={sort}
                        >
                            {(tableList) => (
                                <>
                                    <Header>
                                        <HeaderRow className="text-center" style={{ background: "red" }}>
                                            <HeaderCellSort sortKey="FECHA" className="fw-semibold">Fecha</HeaderCellSort>
                                            <HeaderCellSort sortKey="NIT" className="fw-semibold">NIT / CC</HeaderCellSort>
                                            <HeaderCellSort sortKey="REMISION" className="fw-semibold">Remisión</HeaderCellSort>
                                            <HeaderCellSort sortKey="CLIENTE" className="fw-semibold">Cliente</HeaderCellSort>
                                            <HeaderCellSort sortKey="TOTAL" className="fw-semibold">Total $</HeaderCellSort>
                                        </HeaderRow>
                                    </Header>

                                    <Body>
                                        {tableList.map((item, index) => (
                                            <Row key={index} item={item} className='text-left'>
                                                <Cell>{item.FECHA}</Cell>
                                                <Cell>{item.NIT}</Cell>
                                                <Cell>{item.REMISION}</Cell>
                                                <Cell>{(item.CLIENTE)}</Cell>
                                                <Cell className='text-end'>{formatearPrecio(item.TOTAL)}</Cell>
                                            </Row>
                                        ))}

                                    </Body>
                                </>
                            )}
                        </Table>
                    </div>
                </div>
            </>
        </LayoutApp>
    )
}
