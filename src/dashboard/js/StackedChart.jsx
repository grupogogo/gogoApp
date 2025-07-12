import React, { useEffect, useRef } from 'react';
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useFuntions } from '../../hooks';

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    ChartDataLabels
);

export const StackedChart = ({ labels, datasets, title, stacked = true, barPercentage = 1, categoryPercentage = 1 }) => {
    const chartRef = useRef(null);
    const { formatearPrecio } = useFuntions();
    const number_format = (number, decimals = 0, dec_point = '.', thousands_sep = ',') => {
        number = (number + '').replace(',', '').replace(' ', '');
        const n = !isFinite(+number) ? 0 : +number;
        const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
        const sep = thousands_sep;
        const dec = dec_point;
        const toFixedFix = (n, prec) => {
            const k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
        let s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    };

    const normalizeDatasetsTo100 = (datasets) => {
        if (!datasets || datasets.length === 0) return [];

        const numMeses = datasets[0].data.length;
        const totalPorMes = new Array(numMeses).fill(0);

        // Sumar total por mes
        datasets.forEach(dataset => {
            dataset.data.forEach((value, idx) => {
                totalPorMes[idx] += value;
            });
        });

        // Normalizar y guardar original
        return datasets.map(dataset => ({
            ...dataset,
            originalData: dataset.data, // ⬅️ Guarda los originales
            data: dataset.data.map((value, idx) => {
                const total = totalPorMes[idx] || 1;
                return (value / total) * 100;
            })
        }));
    };

    const normalizedDatasets = normalizeDatasetsTo100(datasets);
    useEffect(() => {
        if (!chartRef.current || !datasets || !labels) return;

        const ctx = chartRef.current.getContext('2d');

        if (chartRef.current.chartInstance) {
            chartRef.current.chartInstance.destroy();
        }

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: normalizedDatasets,
                barThickness: 20,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        display: true,
                        color: 'white',
                        anchor: 'center',
                        align: 'center',
                        font: {
                            size: 14,
                        },
                        formatter: (value, context) => {
                            const original = context.dataset.originalData?.[context.dataIndex];
                            if (!original || original === 0) return ''; // ⬅️ Oculta si es 0 o undefined
                            return number_format(original);
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const original = context.dataset.originalData?.[context.dataIndex];
                                if (!original || original === 0) return ''; // ⬅️ Oculta si es 0 o undefined
                                return `${context.dataset.label}: ${number_format(context.raw)}% = ${formatearPrecio(original)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        stacked,
                        barPercentage,
                        categoryPercentage,
                        ticks: {
                            maxRotation: 0,
                            autoSkip: false,
                        },
                        grid: {
                            display: false,
                        }
                    },
                    y: {
                        stacked,
                        beginAtZero: true,
                        ticks: {
                            display: false // ❌ Oculta los valores numéricos del eje Y
                        },
                        grid: {
                            display: false // ❌ Oculta las líneas horizontales
                        },
                        border: {
                            display: false // ❌ Oculta el eje Y (la línea del eje)
                        }
                    }
                }
            }
        });

        chartRef.current.chartInstance = myChart;

        return () => {
            myChart.destroy();
        };
    }, [labels, datasets, title, stacked, barPercentage, categoryPercentage]);

    return (
        <div className="border rounded shadow-sm p-2" style={{ height: '620px', width: '100%' }}>
            <div style={{ height: '600px', width: '100%' }}>
                <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
            </div>
        </div>
    );
};
