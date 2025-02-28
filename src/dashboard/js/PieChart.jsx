import React, { useEffect, useRef, useState } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Colors } from 'chart.js';
import 'ldrs/quantum'


Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
Chart.register(Colors);


export const PieChart = ({ arrayData, arrayLabels, title }) => {
  const chartRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Verificar si los datos están listos para el gráfico
  useEffect(() => {
    if (
      (arrayLabels && arrayLabels.length > 0) &&
      (arrayData && arrayData.length > 0)
    ) {
      setReady(true);
    } else {
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
      type: 'doughnut',
      data: {
        labels: arrayLabels,
        datasets: [{
          data: arrayData,
          hoverBorderColor: 'rgb(204, 204, 204)',
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colores de ejemplo
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title
          },
          colors: {
            forceOverride: true
          },
          tooltip: {
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
            position: 'bottom',
            labels: {
              boxWidth: 20, padding: 5, font: {
                size: 12
              }
            },

          },
        },
        cutout: '60%',
      },
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
