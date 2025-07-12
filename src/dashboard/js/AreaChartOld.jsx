import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';

export const AreaChartOld = ({ totales, porValor, ventas }) => {
  if (!totales || !totales.gastosMensualesO || !totales.gastosMensualesL || !ventas || !ventas.data) { return }
  const { number_format, formatearPrecio } = useFuntions();

  console.log(ventas)

  const chartRef = useRef(null);
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    // Calcular el mes actual (1-12)
    const currentMonth = new Date().getMonth() + 1;
    // Labels hasta el mes actual
    const allLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = allLabels.slice(0, currentMonth + 1);

    // Recorta los datos de cada año hasta el mes actual
    const trimData = (data) =>
      Array.isArray(data) ? data.slice(0, currentMonth) : [];

    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Gastos O: ' + formatearPrecio((totales.gastosMensualesO).reduce((a, b) => a + b, 0)),
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
            data: (totales.gastosMensualesO),
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
            label: 'Gastos L: ' + formatearPrecio((totales.gastosMensualesL).reduce((a, b) => a + b, 0)),
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: ['rgb(255, 99, 132)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(255, 99, 132)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "rgba(255, 99, 132, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (totales.gastosMensualesL),
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgb(255, 99, 132)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
          },
          {
            label: 'Ventas: ' + formatearPrecio((totales.gastosMensualesL).reduce((a, b) => a + b, 0)),
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: ['rgba(11, 216, 90, 1)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(11, 216, 90, 1)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(11, 216, 90, 1)",
            pointHoverBorderColor: "rgba(11, 216, 90, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (ventas.data),
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgb(11, 216, 90, 1)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
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
            beginAtZero: true,
            ticks: {
              display: false // ❌ Oculta los valores numéricos del eje Y
            },
            grid: {
              display: false // ❌ Oculta las líneas horizontales
            },
            title: {
              display: true,
              text: porValor ? 'Gastos Totales' : 'Gastos en $',
              color: '#858796',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
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
      <div style={{ height: '620px', width: '100%' }} className='border rounded shadow-sm p-2'>
        <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
      </div>

    </>
  )
}
