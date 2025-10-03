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
import Form from 'react-bootstrap/Form';
import { StackedChart, AreaChartOld, AreaChartOldYear } from '../../dashboard/js';


import React, { Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { useGastosStore } from '../../hooks/useGastosStore';
import { AreaChartOldYearAcumulada } from '../../dashboard/js/AreaChartOldYearAcumulada';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const ListOldOrders = () => {
    const modalRef = useRef();
    const [search, setSearch] = useState("");
    const { startLoadingOldOrders } = usePedidosStore();
    const { startLoadingPedidos } = usePedidosStore();
    const { startLoadingGastos } = useGastosStore();
    const oldOrders = useSelector(state => state.pedidos.oldOrders) || [];
    const pedidos = useSelector(state => state.pedidos.pedidos);
    const gastos = useSelector(state => state.gastos.gastos);
    const { formatearPrecio, convertirOldFecha, totalKitsXAnio2025, pastelColors, parsearFechaGasto, mensualGastosUsuarios } = useFuntions();
    const [fechaPedido, setFechaPedido] = useState('2024');
    const [showColumns, setShowColumns] = useState('12');
    const [excluirCliente, setExcluirCliente] = useState(false);
    const [ventas2025, setVentas2025] = useState();
    const [stackedChartData, setStackedChartData] = useState({ labels: [], datasets: [] });
    const [stackedChartDataBrand, setStackedChartDataBrand] = useState({ labels: [], datasets: [] });
    const [stackedChartDataOtros, setStackedChartDataOtros] = useState({ labels: [], datasets: [] });
    const [stackedChartDataCategory, setStackedChartDataCategory] = useState({ labels: [], datasets: [] });
    const [stackedChartDataCategoryQuantity, setStackedChartDataCategoryQuantity] = useState({ labels: [], datasets: [] });
    const [gastosPorMesYAnio, setGastosPorMesYAnio] = useState({ labels: [], datasets: [] });
    const [yearlySalesChartData, setYearlySalesChartData] = useState({ labels: [], datasets: [] });
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

    useEffect(() => {
        startLoadingPedidos(); // Carga los pedidos al iniciar
        startLoadingOldOrders();
        startLoadingGastos();
    }, []);

    const filteredData = useMemo(() => {
        const nodes = oldOrders
            .filter((item) =>
                (
                    excluirCliente
                        ? !item.CLIENTE?.toLowerCase().includes(search.toLowerCase())
                        : item.CLIENTE?.toLowerCase().includes(search.toLowerCase())
                ) ||
                item.FECHA?.toLowerCase().includes(search.toLowerCase()) ||
                item.REMISION?.toLowerCase().includes(search.toLowerCase())
            )
            .filter((item) => item.FECHA?.toLowerCase().includes(fechaPedido)) // asegurar coincidencia con `fechaPedido`
            .sort((a, b) => {
                const fechaA = convertirOldFecha(a.FECHA);
                const fechaB = convertirOldFecha(b.FECHA);
                return fechaA - fechaB; // orden ascendente (de más antigua a más nueva)
            });
        return { nodes };
    }, [oldOrders, search, fechaPedido, excluirCliente]);

    const sort = useSort(
        filteredData,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {
                FECHA: (array) => array.slice().sort((a, b) => (convertirOldFecha(a.FECHA) - convertirOldFecha(b.FECHA))),
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
    const customTheme = {
        Table: `
             --data-table-library_grid-template-columns: 
                 auto auto auto auto auto auto auto !important;
         `,
    };
    const theme = useTheme([customTheme]);

    //* Resize *//
    const handleConcatSales = () => {
        if (!ventas2025 || !stackedChartData) return;

        const newDatasets = [...stackedChartData.datasets];
        const existing2025Index = newDatasets.findIndex(dataset => dataset.label === '2025');

        if (existing2025Index !== -1) {
            // Update existing 2025 data
            newDatasets[existing2025Index].data = ventas2025.monthlySales;
        } else {
            // Add 2025 data as a new dataset
            newDatasets.push({
                label: '2025',
                data: ventas2025.monthlySales,
                backgroundColor: 'rgba(99, 255, 203, 1)', // You can choose a different color
            });
        }

        setStackedChartData({
            labels: stackedChartData.labels,
            datasets: newDatasets,
        });
    };

    const resize = { resizerHighlight: '#0a0a0aff' };

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

    const returnPrice = (value) => {
        if (value === 'KGCA') return 11100;
        if (value === 'KGCO') return 11500;
        if (value === 'KPCA' || value === 'KPCO') return 8200;
        if (value === 'KBNA' || value === 'KBNO') return 6800;
        if (value === 'CBNA' || value === 'CBNO' || value === 'CCNA' || value === 'CCNO') return 0.8;
        if (value === 'LBC') return 1100;
        if (value === 'CTC') return 0;
        if (value === 'LBCP') return 890;
        return 0;
    }

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

    function agruparGastosPorAnioYMese(gastos, parsearFechaGasto) {
        const agrupados = {};

        gastos.forEach((gasto) => {
            const fecha = parsearFechaGasto(gasto.fecha);
            if (!fecha) return;

            const year = fecha.getFullYear();
            const month = fecha.getMonth(); // 0–11

            if (!agrupados[year]) {
                agrupados[year] = Array(12).fill(0);
            }

            const total = (gasto.precio || 0) * (gasto.cantidad || 1);
            agrupados[year][month] += total;
        });

        return Object.entries(agrupados)
            .sort(([a], [b]) => a - b)
            .map(([year, data]) => ({
                label: year,
                data
            }));
    }


    useEffect(() => { // Concatenar las ventas de 2025 al gráfico de ventas mensuales

        if (ventas2025 && stackedChartData.datasets.length > 0) {
            handleConcatSales();
        }
    }, [ventas2025, stackedChartData.datasets.length]); // Trigger when ventas2025 or stackedChartData changes

    useEffect(() => { // TOTALES CANTIDAD PRODUCTOS POR CATEGORIA
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

    useEffect(() => { // Calcula las ventas mensuales por categoría y CANTIDAD desde 2019 hasta 2024
        if (!filteredData.nodes || filteredData.nodes.length === 0) {
            setStackedChartData({ labels: [], datasets: [] });
            return;
        };

        const salesByCategoryMonth = {};

        // Procesar los datos filtrados para agrupar por categoría y mes
        filteredData.nodes.forEach(order => {
            const orderDate = convertirOldFecha(order.FECHA);
            if (isNaN(orderDate.getTime())) return; // Skip invalid dates

            const month = orderDate.getMonth(); // 0-11

            order.items.forEach(item => {
                const category = item.CODIGO;
                if (!category || category === 'LBC' || category === 'LBCP' || category === 'LBC' || category === 'LBC') return;

                if (!salesByCategoryMonth[category]) {
                    salesByCategoryMonth[category] = Array(12).fill(0);
                }
                salesByCategoryMonth[category][month] += item.CANTIDAD || 0;
            });
        });

        const categories = Object.keys(salesByCategoryMonth).sort();
        const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(255, 99, 83, 0.7)',
            'rgba(64, 159, 255, 0.7)'
        ];

        const datasets = categories.map((category, index) => ({
            label: category,
            data: salesByCategoryMonth[category],
            backgroundColor: backgroundColors[index % backgroundColors.length],
        }));

        setStackedChartDataCategoryQuantity({
            labels: monthLabels,
            datasets: datasets,
        });

    }, [filteredData.nodes]);

    useEffect(() => { // VENTAS CATEGORIA $
        if (!filteredData.nodes || filteredData.nodes.length === 0) {
            setStackedChartData({ labels: [], datasets: [] });
            return;
        };

        const salesByCategoryMonth = {};

        // Procesar los datos filtrados para agrupar por categoría y mes
        filteredData.nodes.forEach(order => {
            const orderDate = convertirOldFecha(order.FECHA);
            if (isNaN(orderDate.getTime())) return; // Skip invalid dates

            const month = orderDate.getMonth(); // 0-11

            order.items.forEach(item => {
                const category = item.CODIGO;
                if (!category) return;

                if (!salesByCategoryMonth[category]) {
                    salesByCategoryMonth[category] = Array(12).fill(0);
                }
                salesByCategoryMonth[category][month] += item.TOTAL || 0;
            });
        });

        const categories = Object.keys(salesByCategoryMonth).sort();
        const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(255, 99, 83, 0.7)',
            'rgba(64, 159, 255, 0.7)'
        ];

        const datasets = categories.map((category, index) => ({
            label: category,
            data: salesByCategoryMonth[category],
            backgroundColor: backgroundColors[index % backgroundColors.length],
        }));

        setStackedChartDataCategory({
            labels: monthLabels,
            datasets: datasets,
        });

    }, [filteredData.nodes]);

    useEffect(() => {
        if (!oldOrders || oldOrders.length === 0) return;
        if (!pedidos || pedidos.length === 0) return;

        const NIT_BRAND_DESIGN = '900879470';

        const ventas2025Local = totalKitsXAnio2025(pedidos);
        const totalSales2025 = ventas2025Local.monthlySales.reduce((a, b) => a + b, 0);
        setVentas2025(ventas2025Local);

        const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        const salesBD = {};     // Brand Design
        const salesOtros = {};  // Otros
        const salesTotal = {};  // Total por año

        oldOrders.forEach(order => {
            const rawFecha = order.FECHA || order.fecha;
            if (!rawFecha || typeof rawFecha !== 'string') return;

            const orderDate = convertirOldFecha(rawFecha);
            if (isNaN(orderDate.getTime())) return;

            const year = orderDate.getFullYear();
            const month = orderDate.getMonth();
            const total = order.TOTAL || 0;
            const nit = order.NIT || order.nit || '';

            const target = fechaPedido !== '2025' ? (nit === NIT_BRAND_DESIGN ? salesBD : salesOtros) : salesTotal;


            if (!target[year]) target[year] = Array(12).fill(0);
            if (!salesTotal[year]) salesTotal[year] = 0;

            target[year][month] += total;
            salesTotal[year] += total;
        });

        // Agregar 2025 manualmente
        salesOtros['2025'] = ventas2025Local.monthlySales; // Suponiendo que no es Brand Design
        salesTotal['2025'] = (salesTotal['2025'] || 0) + totalSales2025;

        const years = Object.keys(salesTotal).sort();

        const pastel = (i) => pastelColors[i % pastelColors.length];

        // 🔵 Dataset general (todos juntos)
        const datasetsByMonth = years.map((year, i) => ({
            label: year,
            data: (salesBD[year] || Array(12).fill(0)).map((v, idx) =>
                v + ((salesOtros[year] && salesOtros[year][idx]) || 0)
            ),
            backgroundColor: pastel(i),
        }));

        // 🔵 Solo Brand Design
        const datasetsBrandDesign = Object.keys(salesBD).sort().map((year, i) => (
            {
                label: year,
                data: salesBD[year],
            }));

        // 🔵 Solo Otros
        const datasetsOtros = Object.keys(salesOtros).sort().map((year, i) => ({
            label: year,
            data: salesOtros[year],
        }));

        // ⬇️ Guardar todo por separado
        setStackedChartData({ labels: monthLabels, datasets: datasetsByMonth });

        if (fechaPedido === 2025) {
            setStackedChartDataBrand({
                labels: monthLabels,
                datasets: {
                    label: '2025',
                    data: ventas2025Local.monthlySalesBrand
                }
            });

            setStackedChartDataOtros({
                labels: monthLabels,
                datasets: {
                    label: '2025',
                    data: ventas2025Local.monthlySalesOscar
                }
            });
        } else {
            setStackedChartDataBrand({
                labels: monthLabels,
                datasets: datasetsBrandDesign
            });

            setStackedChartDataOtros({
                labels: monthLabels,
                datasets: datasetsOtros
            });
        }


        // Anual general
        const totalYears = Object.keys(salesTotal).sort();
        const totalData = totalYears.map(year => salesTotal[year]);

        setYearlySalesChartData({
            labels: totalYears,
            datasets: [{
                label: 'Ventas Anuales',
                data: totalData,
                backgroundColor: 'rgba(22, 97, 97, 1)',
            }]
        });

    }, [oldOrders, pedidos, fechaPedido]);

    useEffect(() => {
        if (!gastos || gastos.length === 0) return;

        const agrupados = agruparGastosPorAnioYMese(gastos, parsearFechaGasto);
        setGastosPorMesYAnio({
            labels: monthLabels,
            datasets: agrupados
        });

    }, [gastos]);

    const getDatasetByYear = (datasets, year) => {
        const index = parseInt(year) - 2019;
        return datasets && datasets[index] ? datasets[index] : [];
    };

    return (
        <LayoutApp>
            <div className='card p-3 mb-2 sticky-top bg-white z-3'
                style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 1000,
                    padding: '1rem',
                    marginBottom: '1rem'
                }} >
                <div className='row justify-content-between g-3'>
                    <div className="col text-end">
                        <div className="input-group form-select-sm d-flex align-items-center">
                            <span className='me-2'>Columnas a mostrar</span>
                            <select
                                className="form-select form-select-sm w-auto rounded"
                                value={showColumns}
                                style={{ maxWidth: 'fit-content' }}
                                onChange={e => {
                                    const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                                    setShowColumns(value);
                                }}
                            >
                                <option value={'12'}>1</option>
                                <option value={'6'}>2</option>
                                <option value={'6'}>3</option>
                                <option value={'3'}>4</option>
                            </select>
                        </div>
                    </div>

                    <div className="col text-start">
                        <div className="input-group form-select-sm d-flex align-items-center">
                            <span className='me-2'>Año a filtrar</span>
                            <select
                                className="form-select form-select-sm w-auto rounded"
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
                                <option value={'2025'}>2025</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid">

                {/* DIV PARA LOS GRÁFICOS */}
                <div className='row'>
                    <div className={`col-${showColumns}`}>
                        <div className='card mb-4'>
                            {/* Div para Gemini */}
                            <StackedChart
                                labels={stackedChartData.labels}
                                datasets={stackedChartData.datasets}
                                title="Ventas mensuales desde 2019 a 2025"
                            />
                        </div>
                    </div>
                    {/* StackedChart */}
                    <div className={`col-${showColumns}`}>
                        <div className='card mb-4'>
                            <StackedChart
                                labels={stackedChartDataCategory.labels}
                                datasets={stackedChartDataCategory.datasets}
                                title={`Ventas $ mensual ${fechaPedido} por categoria`}
                            />
                        </div>
                    </div>
                </div>

                <div className='row mb-4'>
                    {/* StackedChart */}
                    <div className={`col-${showColumns} mb-4`}>
                        <div className='card'>
                            <StackedChart
                                labels={stackedChartDataCategoryQuantity.labels}
                                datasets={stackedChartDataCategoryQuantity.datasets}
                                title={`Ventas ${fechaPedido} por cantidad de productos`}
                            />
                        </div>
                    </div>
                    {/* Area old Chart */}
                    <div className={`col-${showColumns}`}>
                        <div className='card'>
                            {(stackedChartData.datasets?.length > 0) && (
                                <AreaChartOld
                                    gastos={mensualGastosUsuarios(gastos, parseInt(fechaPedido), 'K')}
                                    ventas={
                                        fechaPedido === 2025
                                            ? { data: ventas2025.monthlySales }
                                            : getDatasetByYear(stackedChartData.datasets, fechaPedido)
                                    }
                                    ventasBrandDesign={
                                        fechaPedido === 2025
                                            ? stackedChartDataBrand.datasets
                                            : getDatasetByYear(stackedChartDataBrand.datasets, fechaPedido)
                                    }

                                    ventasOtros={
                                        fechaPedido === 2025
                                            ? stackedChartDataOtros.datasets
                                            : getDatasetByYear(stackedChartDataOtros.datasets, fechaPedido)
                                    }
                                    porValor={false}
                                />
                            )}

                        </div>
                    </div>
                </div>
                {/* Area old Chart */}
                <div className='row mb-4'>
                    <div className={`col-${showColumns} mb-4`}>
                        <div className=' card'>
                            <AreaChartOldYear
                                data={stackedChartData}
                            />
                        </div>
                    </div>
                    <div className={`col-${showColumns}`}>
                        <div className=' card'>
                            <AreaChartOldYear
                                data={(gastosPorMesYAnio) ? gastosPorMesYAnio : []} />
                        </div>
                    </div>
                </div>
                {/* Area old Chart */}
                <div className='row mb-4'>
                    <div className={`col-${showColumns} mb-4`}>
                        <div className=' card'>
                            <AreaChartOldYearAcumulada
                                data={stackedChartData}
                            />
                        </div>
                    </div>
                    <div className={`col-${showColumns}`}>
                        <div className=' card'>
                            <AreaChartOldYearAcumulada
                                data={(gastosPorMesYAnio) ? gastosPorMesYAnio : []} />
                        </div>
                    </div>
                </div>

                {/* Tabla totales por categoria */}
                <div className={`col-12`}>
                    <div className='card'>
                        <div className='card-header text-center'>
                            <h6 className='fw-bold text-secondary'>Detalle pedidos {fechaPedido}</h6>
                        </div>
                        <div className='card-body' style={{ fontSize: '0.9rem' }}>
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <table className="table table-bordered table-sm text-center align-middle w-100 mx-auto">
                                    <thead className="table-secondary">
                                        <tr>
                                            {[
                                                'KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA',
                                                'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO',
                                                'LBC', 'CTC', 'LBCP'
                                            ].map((codigo) => <th key={codigo}>{codigo}</th>)}
                                            <th>Total</th>
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
                                                    {formatearPrecio((totalCategorias[codigo]?.items) * (returnPrice(codigo)) || 0)}
                                                </td>
                                            ))}
                                            <td className="fw-bold">
                                                {
                                                    formatearPrecio(
                                                        ['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].reduce(
                                                            (acc, codigo) => acc + parseInt((totalCategorias[codigo]?.items) * (returnPrice(codigo))) || 0,
                                                            0
                                                        )
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
                                            <td colSpan={14}>
                                                D: <span className='fw-semibold'>{formatearPrecio
                                                    ((['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].reduce((acc, codigo) => acc + (totalCategorias[codigo]?.total || 0), 0) - (['KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CBNA', 'CBNO', 'CCNA', 'CCNO', 'LBC', 'CTC', 'LBCP'].reduce(
                                                        (acc, codigo) => acc + parseInt((totalCategorias[codigo]?.items) * (returnPrice(codigo))) || 0,
                                                        0
                                                    ))))
                                                }</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={14}>
                                                {totalcantidadAnio} Total pedidos: <span className='fw-semibold'>{filteredData.nodes.length}</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="card-footer">
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
                </div>
                <div className="card mt-4 p-2">
                    <div className="row mt-4 d-flex justify-content-between align-items-center m-2">
                        <div className="col-auto">
                            <h5 className="fw-bold text-secondary">Listado pedidos antiguos</h5>
                        </div>
                        <div className='col-auto d-flex'>
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
                    <div className='row mt-2 d-flex justify-content-between align-items-center m-2'>
                        {/* Columna para el input */}
                        <div className="col">
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

                        {/* Checkbox para excluir coincidencias por cliente */}
                        <div className='col'>
                            <Form.Check
                                type="checkbox"
                                label="Excluir coincidencias por cliente"
                                checked={excluirCliente}
                                onChange={(e) => setExcluirCliente(e.target.checked)}
                            />
                        </div>


                    </div>

                    {/* TABLA DE DATOS */}
                    <div className='row'>
                        <div className="col-6 table-responsive" ref={modalRef} style={{ maxHeight: "none", overflow: "visible" }}>
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
                                                    Remisi
                                                </HeaderCellSort>
                                                <HeaderCellSort resize sortKey="ITEMS" className="fw-semibold">
                                                    I
                                                </HeaderCellSort>
                                                <HeaderCellSort resize sortKey="ITEMS" className="fw-semibold">
                                                    P
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
                                                        <Cell className='text-end'>
                                                            {convertirOldFecha(item.FECHA).toLocaleDateString()}
                                                        </Cell>
                                                        <Cell>{item.NIT}</Cell>
                                                        <Cell className='cursor-pointer'>
                                                            <OverlayTrigger
                                                                trigger="click"
                                                                key="top"
                                                                placement="top"
                                                                overlay={
                                                                    <Popover id={`popover-positioned-top`}
                                                                        style={{ maxWidth: 'none', width: 'auto' }} >
                                                                        <Popover.Header as="h3" className='fw-bold text-end'>Remisión: {(item.REMISION).slice(-5)}</Popover.Header>
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
                                                                <div className='border rounded text-center text-truncate w-100 cursor-pointer block bg-secondary text-white'>
                                                                    {(item.REMISION).slice(-5)}
                                                                </div>
                                                            </OverlayTrigger>
                                                        </Cell>
                                                        <Cell>{item.items?.length || 0}</Cell>
                                                        <Cell>{item.items.reduce((acc, curr) => acc + (curr.CANTIDAD || 0), 0) || 0}</Cell>
                                                        <Cell>{item.CLIENTE}</Cell>
                                                        <Cell className="text-end">{formatearPrecio(item.TOTAL)}</Cell>
                                                    </Row>
                                                </React.Fragment>
                                            ))}
                                            {filteredData.nodes.length === 0 && (
                                                <Row>
                                                    <Cell colSpan={6} className="text-center text-muted">
                                                        No hay pedidos antiguos que coincidan con los criterios de búsqueda.
                                                    </Cell>
                                                </Row>
                                            )}
                                        </Body>

                                    </>
                                )}
                            </Table>
                        </div>
                        <div className='col-6'>
                            <div className='row mr-2'>
                                <div className='col-12'>
                                    <StackedChart
                                        labels={yearlySalesChartData.labels}
                                        datasets={yearlySalesChartData.datasets}
                                        title="Ventas Totales por Año"
                                        formato={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutApp >
    )
}
