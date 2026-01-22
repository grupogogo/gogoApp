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

export const StackedChart = ({ labels, datasets, title, stacked = true, formato = false }) => {
    if (!labels || labels.length === 0) return null;
    if (!datasets || datasets.length === 0) return null;

    const chartRef = useRef(null);
    const { formatearPrecio, number_format } = useFuntions();

   

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

    const processedDatasets = formato ? datasets : normalizeDatasetsTo100(datasets);


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
                datasets: processedDatasets,
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

                            if (formato) {
                                // Mostrar el valor directamente si estás usando los datos reales
                                if (!value || value === 0) return '';
                                return number_format(value);
                            }

                            // Modo normalizado (porcentaje)
                            if (!original || original === 0) return '';
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
                        barPercentage: 0.9,
                        categoryPercentage: 0.8,
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
                        max: formato ? undefined : 100, // ✅ solo limitar a 100 si estás normalizando
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        });

        chartRef.current.chartInstance = myChart;

        return () => {
            myChart.destroy();
        };
    }, [datasets]);

    return (
        <div className="border rounded shadow-sm p-2" style={{ height: '820px', width: '100%' }}>
            <div style={{ height: '800px', width: '100%' }}>
                <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
            </div>
        </div>
    );
};
