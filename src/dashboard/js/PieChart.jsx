import React, { useEffect, useRef, useState } from 'react';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Colors } from 'chart.js';
import 'ldrs/quantum'
import { useFuntions } from '../../hooks';

Chart.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels);
Chart.register(Colors);


export const PieChart = ({ arrayData = [], arrayLabels = [], title = '', anio = new Date().getFullYear() }) => {

  const { buscarPrecioxCategoriaAnio, formatearPrecio, number_format } = useFuntions();
  const chartRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Verificar si los datos están listos para el gráfico
  useEffect(() => {
    if (
      arrayLabels && arrayLabels.length > 0 &&
      arrayData && arrayData.length > 0
    ) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [arrayLabels, arrayData]);

  // Solo renderizar el gráfico cuando los datos están listos
  useEffect(() => {
    if (!ready || !chartRef.current) return; // No renderizamos hasta que los datos estén listos

    const ctx = chartRef.current.getContext('2d');

    // Destruir gráfico anterior si existe
    if (chartRef.current.chartInstance) {
      chartRef.current.chartInstance.destroy();
    }

    const myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: arrayLabels,
        datasets: [{
          data: arrayData,
          hoverBorderColor: 'rgb(204, 204, 204)',
          // Colores de ejemplo
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            color: 'gray',
            font: {
              size: 16,
            },
            text: title ? (title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()) : '',
          },
          colors: {
            forceOverride: true
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const index = tooltipItem.dataIndex;
                const value = arrayData[index];
                const label = arrayLabels[index];
                let price = 0;
                let total = 0;
                if (label && (label.includes('OTR') || label.includes('OTROS'))) {
                  return `Unidades: ${number_format(value)}`;
                } else if (label === 'TOTAL KITS' || label === 'LG' || label === 'OG') {
                  return `Total: $ ${number_format(value)}`;
                } else {
                  const price = buscarPrecioxCategoriaAnio(label, anio);
                  const total = value * price;
                  return `Precio unitario: (${formatearPrecio(price)}) | Total: ${formatearPrecio(total)}`;
                }
              }
            },
            backgroundColor: 'rgba(66, 66, 66, 0.8)',
            bodyColor: 'white',
            borderColor: 'white',
            borderWidth: 1,
            padding: 15,
            displayColors: true,
            caretPadding: 10,
          },
          legend: {
            display: true,
            position: title.toUpperCase().includes('OTROS') || title.toUpperCase().includes('GUANTES') ? 'bottom' : 'left',
            labels: {
              boxWidth: 20, padding: 5, font: {
                size: 9
              }
            },
          },
          datalabels: {
            display: (context) => {
              const dataset = context.dataset;
              const total = dataset.data.reduce((acc, val) => acc + (Number(val) || 0), 0);
              const value = Number(dataset.data[context.dataIndex] || 0);
              if (value <= 0) return false;
              if (dataset.data.length > 4 && (value / (total || 1)) < 0.08) return false;
              return true;
            },
            color: 'white',
            backgroundColor: 'rgba(40, 40, 40, 0.85)',
            borderRadius: 4,
            padding: 2,
            font: {
              size: 11,
              weight: 'bold'
            },
            formatter: (value) => {
              return `${number_format(value)}`;
            }
          }
        },
        // cutout: '60%', // Elimina o comenta esta línea para mostrar un gráfico de pastel (pie) en lugar de donut
      },
      plugins: [ChartDataLabels], // Registrar el plugin de etiquetas de datos
    });

    chartRef.current.chartInstance = myPieChart;

    return () => {
      myPieChart.destroy();
    };
  }, [arrayLabels, arrayData, ready]); // El gráfico se renderiza solo cuando los datos estén listos

  return (
    <div className="card-body">
      <div className="chart-container">
        {ready ? <canvas ref={chartRef}></canvas> : <l-quantum
          size="45"
          speed="1.75"
          color="black"
        ></l-quantum>}
      </div>

    </div >
  );
};
