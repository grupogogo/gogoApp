import React, { useEffect, useRef, useState } from 'react';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Colors } from 'chart.js';
import 'ldrs/quantum'
import { useFuntions } from '../../hooks';

Chart.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels);
Chart.register(Colors);


export const PieChartGastosUsuarios = ({ gastosXusuario, arrayData, arrayLabels, title }) => {
  const { number_format } = useFuntions();
  const chartRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Verificar si los datos están listos para el gráfico
  useEffect(() => {
    const currentData = gastosXusuario || arrayData;
    if (
      arrayLabels && arrayLabels.length > 0 &&
      currentData && currentData.length > 0
    ) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [arrayLabels, gastosXusuario, arrayData]);

  // Solo renderizar el gráfico cuando los datos están listos
  useEffect(() => {
    if (!ready || !chartRef.current) return; // No renderizamos hasta que los datos estén listos

    const ctx = chartRef.current.getContext('2d');

    // Destruir gráfico anterior si existe
    if (chartRef.current.chartInstance) {
      chartRef.current.chartInstance.destroy();
    }

    const currentData = gastosXusuario || arrayData;

    const myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: arrayLabels,
        datasets: [{
          data: currentData,
          hoverBorderColor: 'rgb(204, 204, 204)',
        }],
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
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            font: {
              size: 16,
              weight: 'bold'
            },
            formatter: (value) => {
              if (!value || value === 0) return '';
              return `$ ${number_format(value)}`;
            }
          },
          title: {
            display: true,
            text: title,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            titleColor: '#fff',
            bodyColor: '#fff',
            size: 16,
            callbacks: {
              label: (context) => {
                if (context.raw === undefined || context.raw === null || context.raw === 0) return '';
                return `$ ${number_format(context.raw)}`;
              }
            }
          },
          legend: {
            position: 'top',
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
