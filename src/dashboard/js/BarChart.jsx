import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useFuntions } from '../../hooks';

// Register the datalabels plugin
Chart.register(ChartDataLabels);

const number_format = (number, decimals, dec_point, thousands_sep) => {
    number = (number + '').replace(',', '').replace(' ', '');
    const n = !isFinite(+number) ? 0 : +number;
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    const sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
    const dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
    let s = '';
    const toFixedFix = (n, prec) => {
        const k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
    };

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
};

export const BarChart = ({ totales }) => {
    const { buscarNombre } = useFuntions();
    const chartRef = useRef(null);
    useEffect(() => {
        totales.sort((a, b) => b.cantidad - a.cantidad);
        // Crear arrays vacíos para almacenar las categorías y cantidades
        const categorias = [];
        const cantidades = [];

        // Iterar sobre cada objeto y extraer las propiedades
        totales.map(({ categoria, cantidad }) => {
            categorias.push(buscarNombre(categoria));
            cantidades.push(cantidad);
        });

        const ctx = chartRef.current.getContext('2d');
        // Mapear las categorías para mostrar el nombre usando buscarNombre


        const myBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: [{
                    label: '',
                    backgroundColor: "#4e73df",
                    hoverBackgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255,1)',
                        'rgba(201, 203, 207,1)'
                    ],
                    data: cantidades,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(201, 203, 207)'
                    ],
                    borderWidth: 5,
                    // Elimina el espacio entre columnas
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        display: true,
                        color: 'gray',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        anchor: 'end', // ✅ mantener
                        align: 'end',  // ✅ cambiar de 'start' a 'end'
                        formatter: (value) => number_format(value)
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 60
                        },
                        maxBarThickness: 25,
                    },
                    y: {
                        ticks: {
                            min: 0,
                            maxTicksLimit: 15,
                            padding: 10,
                            callback: (value) => number_format(value)
                        },
                        grid: {
                            color: "rgb(234, 236, 244)",
                            zeroLineColor: "rgb(234, 236, 244)",
                            drawBorder: false,
                            borderDash: [2],
                            zeroLineBorderDash: [2]
                        }
                    }
                },
                legend: {
                    display: true
                },
                tooltips: {
                    titleMarginBottom: 10,
                    titleFontColor: '#6e707e',
                    titleFontSize: 20,
                    backgroundColor: "rgb(255,255,255)",
                    bodyFontColor: "#858796",
                    borderColor: '#dddfeb',
                    borderWidth: 1,
                    xPadding: 15,
                    yPadding: 15,
                    displayColors: false,
                    caretPadding: 10,
                    callbacks: {
                        label: (tooltipItem) => {
                            console.log(tooltipItem)
                            const datasetLabel = tooltipItem.dataset.label || '';
                            return datasetLabel + ': $' + number_format(tooltipItem.raw);
                        }
                    }
                }
            },
        });

        return () => {
            myBarChart.destroy(); // Destruir el gráfico para evitar fugas de memoria
        };
    }, [totales]);

    return (

        <div className="card-body">
            <div className="chartArea">
                <canvas ref={chartRef} id="myBarChart"></canvas>
            </div>
            <hr />
            Productos mas vendidos
            {' ' + new Date().getFullYear()}
        </div>

    );
};

