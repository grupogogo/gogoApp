import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';

export const AreaChart = ({ totales, porValor }) => {

  const { number_format } = useFuntions();
  const monthlySales2025 = Array.isArray(totales?.monthlySales2025) && totales.monthlySales2025.length > 0
    ? totales.monthlySales2025
    : totales.monthlySales;

  const chartRef = useRef(null);
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    // Calcular el mes actual (1-12)
    const currentMonth = new Date().getMonth() + 1;
    // Labels hasta el mes actual
    const allLabels = ['0', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = allLabels.slice(0, currentMonth + 1);

    // Recorta los datos de cada año hasta el mes actual
    const trimData = (data) =>
      Array.isArray(data) ? data.slice(0, currentMonth + 1) : [];

    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '2025',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: ['rgb(54, 162, 235)'],
            pointRadius: 5,
            pointBorderColor: ['rgb(54, 162, 235)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(54, 162, 235, 1)",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: trimData(monthlySales2025),
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgb(54, 162, 235)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
          },
          {
            label: '2024',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: ['rgb(255, 99, 132)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(255, 99, 132)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: trimData(totales.monthlySales2024),
            hidden: true,
          },
          {
            label: '2023',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: ['rgb(75, 192, 192)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(75, 192, 192)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
            pointHoverBorderColor: "rgba(75, 192, 192, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: trimData(totales.monthlySales2023),
            hidden: true,
          },
          {
            label: '2022',
            tension: 0.3,
            backgroundColor: "rgba(17, 42, 119, 0.05)",
            borderColor: ['rgb(153, 102, 255)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(153, 102, 255)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(153, 102, 255, 1)",
            pointHoverBorderColor: "rgba(153, 102, 255, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: trimData(totales.monthlySales2022),
            hidden: true,
          },
          {
            label: '2021',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: ['rgb(255, 159, 64)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(255, 159, 64)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 159, 64, 1)",
            pointHoverBorderColor: "rgba(255, 159, 64, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: trimData(totales.monthlySales2021),
            hidden: true,
          }
        ],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        },
        scales: {
          x: {
            grid: {
              display: true,
              drawBorder: true
            },
            ticks: {
              maxTicksLimit: 13
            }
          },
          y: {
            ticks: {
              maxTicksLimit: 30,
              padding: 10,
              callback: function (value) {
                return ((porValor) ? '' : '$') + number_format(value);
              }
            },
            grid: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: true,
              borderDash: [2],
              zeroLineBorderDash: [2]
            },
            suggestedMax: Math.max(...trimData(monthlySales2025)) * 1.1 // Ajusta el límite superior del eje Y
          }
        },
        plugins: {
          legend: {
            display: true,
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(index);
              meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
              ci.update();
            },
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 'bold',
                family: 'Arial'
              },
              color: '#858796'
            }
          },
          tooltip: {
            backgroundColor: "rgb(255,255,255)",
            bodyColor: "#858796",
            titleMarginBottom: 10,
            titleColor: '#6e707e',
            titleFont: {
              size: 20
            },
            borderColor: '#dddfeb',
            borderWidth: 1,
            padding: 15,
            displayColors: false,
            intersect: false,
            mode: 'index',
            caretPadding: 10,
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || '';
                return label + ':' + ((porValor) ? '' : '$') + number_format(context.raw);
              }
            }
          }
        }
      }
    });
    chartRef.current.chartInstance = myLineChart;
    // Cleanup cuando el componente se desmonta
    return () => {
      myLineChart.destroy();
    };
  }, [totales]);

  return (
    <>
      {/* Card Body */}
      <canvas ref={chartRef} />

    </>
  )
}
