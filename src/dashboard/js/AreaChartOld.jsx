import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';

export const AreaChartOld = ({ gastos, porValor, ventas, ventasBrandDesign, ventasOtros }) => {


  if (!ventas?.data || !ventasBrandDesign?.data || !ventasOtros?.data || !gastos?.gastosMensualesO) return null;

  const [hiddenDatasets, setHiddenDatasets] = useState([
    true, // Gastos O
    true, // Gastos acumulados O
    true, // Gastos L
    true, // Gastos acumulados L
    true, // Ventas L
    true, // Ventas acumuladas L
    true, // Utilidad acumulada L
    true, // Ventas O
    true, // Ventas acumuladas O
    true, // Utilidad acumulada O
    false, // Ventas del año
  ]);





  const { number_format, formatearPrecio } = useFuntions();

  const chartRef = useRef(null);
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    // Calcular el mes actual (1-12)
    const currentMonth = new Date().getMonth() + 1;
    // Labels hasta el mes actual
    const allLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Recorta los datos de cada año hasta el mes actual
    const trimData = (data) =>
      Array.isArray(data) ? data.slice(0, currentMonth) : [];

    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Gastos O: ' + formatearPrecio((gastos.gastosMensualesO).reduce((a, b) => a + b, 0)),
            tension: 0.3,
            backgroundColor: "rgb(54, 162, 235)",
            borderColor: ['rgb(54, 162, 235)'],
            pointRadius: 5,
            pointBorderColor: ['rgb(54, 162, 235)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(54, 162, 235, 1)",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (gastos.gastosMensualesO),
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
            hidden: hiddenDatasets[0],
          },
          {
            label: 'Gastos acumulados O',
            tension: 0.3,
            borderDash: [10, 5], // ← Línea discontinua
            backgroundColor: "white",
            borderColor: ['rgb(54, 162, 235)'],
            pointRadius: 5,
            pointBorderColor: ['rgb(54, 162, 235)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(54, 162, 235, 1)",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (gastos.gastosMensualesO).reduce((acc, curr, i) => {
              if (i === 0) {
                acc.push(curr);
              } else {
                acc.push(curr + acc[i - 1]);
              }
              return acc;
            }, []),
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
            hidden: hiddenDatasets[1],
          },
          {
            label: 'Gastos L: ' + formatearPrecio((gastos.gastosMensualesL).reduce((a, b) => a + b, 0)),
            data: (gastos.gastosMensualesL),
            tension: 0.3,
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: ['rgb(255, 99, 132)'],
            pointRadius: 4,
            pointBorderColor: ['rgb(255, 99, 132)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "rgba(255, 99, 132, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
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
            hidden: hiddenDatasets[2],
          },
          {
            label: 'Gastos acumulados L',
            tension: 0.3,
            borderDash: [10, 5], // ← Línea discontinua
            backgroundColor: "white",
            borderColor: ['rgb(255, 99, 132)'],
            pointRadius: 5,
            pointBorderColor: ['rgb(255, 99, 132)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgb(255, 99, 132)",
            pointHoverBorderColor: "rgb(255, 99, 132)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (gastos.gastosMensualesL).reduce((acc, curr, i) => {
              if (i === 0) {
                acc.push(curr);
              } else {
                acc.push(curr + acc[i - 1]);
              }
              return acc;
            }, []),
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
            hidden: hiddenDatasets[3],
          },
          {
            label: 'Ventas L: ' + formatearPrecio((ventasBrandDesign.data).reduce((a, b) => a + b, 0)),
            tension: 0.3,
            backgroundColor: "rgba(255, 255, 0)",
            borderColor: ['rgba(255, 255, 0)'],
            pointRadius: 4,
            pointBorderColor: ['rgba(255, 255, 0)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 255, 0)",
            pointHoverBorderColor: "rgba(255, 255, 0)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (ventasBrandDesign.data),
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'black',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
            hidden: hiddenDatasets[4],
          },
          {
            label: 'Ventas acumuladas L',
            data: ventasBrandDesign.data.reduce((acc, curr, i) => {
              if (i === 0) {
                acc.push(curr);
              } else {
                acc.push(curr + acc[i - 1]);
              }
              return acc;
            }, []),
            borderColor: 'rgba(255, 255, 0)',
            backgroundColor: "white",
            tension: 0.3,
            borderDash: [10, 5], // ← Línea discontinua
            pointRadius: 4,
            pointBorderColor: 'rgba(255, 255, 0)',
            pointHoverBackgroundColor: 'rgba(255, 255, 0)',
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'black',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
            hidden: hiddenDatasets[5],
          },
          {
            label: 'Utilidad acumulada L',
            data: ventasBrandDesign.data.reduce((acc, curr, i) => {
              const ventaAcumulada = i === 0 ? curr : curr + acc[i - 1].venta;
              const gastoAcumulado = i === 0
                ? gastos.gastosMensualesL[0]
                : gastos.gastosMensualesL[i] + acc[i - 1].gasto;

              const utilidad = ventaAcumulada - gastoAcumulado;

              acc.push({ venta: ventaAcumulada, gasto: gastoAcumulado, utilidad });
              return acc;
            }, []).map(obj => obj.utilidad), // ← Solo devolvemos la utilidad para el gráfico
            borderColor: 'rgba(255, 3, 3, 1)',
            backgroundColor: "white",
            tension: 0.3,
            borderDash: [5, 5],
            pointRadius: 4,
            pointBorderColor: 'rgba(255, 3, 3, 1)',
            pointHoverBackgroundColor: 'rgba(255, 3, 3, 1)',
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgba(255, 3, 3, 1)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
            hidden: hiddenDatasets[6],
          },
          {
            label: 'Ventas O: ' + formatearPrecio((ventasOtros.data).reduce((a, b) => a + b, 0)),
            tension: 0.3,
            backgroundColor: "rgba(99, 2, 255, 1)",
            borderColor: ['rgba(99, 2, 255, 1)'],
            pointRadius: 4,
            pointBorderColor: ['rgba(99, 2, 255, 1)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(99, 2, 255, 1)",
            pointHoverBorderColor: "rgba(99, 2, 255, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: (ventasOtros.data),
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgba(99, 2, 255, 1',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
            hidden: hiddenDatasets[7],
          },
          {
            label: 'Ventas acumuladas O',
            data: ventasOtros.data.reduce((acc, curr, i) => {
              if (i === 0) {
                acc.push(curr);
              } else {
                acc.push(curr + acc[i - 1]);
              }
              return acc;
            }, []),
            borderColor: 'rgba(99, 2, 255, 1)',
            backgroundColor: "white",
            tension: 0.3,
            borderDash: [10, 5], // ← Línea discontinua
            pointRadius: 4,
            pointBorderColor: 'rgba(99, 2, 255, 1)',
            pointHoverBackgroundColor: 'rgba(99, 2, 255, 1)',
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgba(99, 2, 255, 1)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
            hidden: hiddenDatasets[8],
          },
          {
            label: 'Utilidad acumulada O',
            data: ventasOtros.data.reduce((acc, curr, i) => {
              const ventaAcumulada = i === 0 ? curr : curr + acc[i - 1].venta;
              const gastoAcumulado = i === 0
                ? gastos.gastosMensualesO[0]
                : gastos.gastosMensualesO[i] + acc[i - 1].gasto;

              const utilidad = ventaAcumulada - gastoAcumulado;

              acc.push({ venta: ventaAcumulada, gasto: gastoAcumulado, utilidad });
              return acc;
            }, []).map(obj => obj.utilidad), // ← Solo devolvemos la utilidad para el gráfico
            borderColor: 'rgba(34, 13, 228, 1)',
            backgroundColor: "white",
            tension: 0.3,
            borderDash: [5, 5],
            pointRadius: 4,
            pointBorderColor: 'rgba(34, 13, 228, 1)',
            pointHoverBackgroundColor: 'rgba(34, 13, 228, 1)',
            datalabels: {
              align: 'end',
              anchor: 'end',
              formatter: (value) => number_format(value),
              color: 'rgba(34, 13, 228, 1)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
            hidden: hiddenDatasets[9],
          },
          {
            label: 'Ventas del año: ' + formatearPrecio((ventas.data).reduce((a, b) => a + b, 0)),
            tension: 0.3,
            backgroundColor: "rgba(11, 216, 90, 1)",
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
            hidden: hiddenDatasets[10],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 10,
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
              callback: function (value) {
                // Puedes personalizar aún más si quieres otros formatos
                if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + 'M';
                if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
                return value;
              },
            },
            beginAtZero: true,
            ticks: {
              display: false // ❌ Oculta los valores numéricos del eje Y
            },
            grid: {
              display: false // ❌ Oculta las líneas horizontales
            },
            title: {
              display: true,
              text: porValor ? 'Gastos gastos' : 'Gastos en $',
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
            onClick: (e, legendItem, legend) => { // eslint-disable-line
              const index = legendItem.datasetIndex; // eslint-disable-line
              const ci = legend.chart; // eslint-disable-line
              const meta = ci.getDatasetMeta(index); // eslint-disable-line

              // Determina la visibilidad actual para hacer el toggle
              const currentHiddenState = meta.hidden ?? ci.data.datasets[index].hidden;
              const newHiddenState = !currentHiddenState;

              // Actualiza el estado de React para persistir la selección
              setHiddenDatasets(prevHidden => {
                const newHidden = [...prevHidden];
                newHidden[index] = newHiddenState;
                return newHidden;
              });

              // Actualiza la instancia del gráfico para un feedback visual inmediato
              meta.hidden = newHiddenState;
              ci.update(); // eslint-disable-line
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
  }, [gastos]);

  return (
    <>
      <div style={{ height: '820px', width: '100%' }} className='border rounded shadow-sm p-2'>
        <canvas ref={chartRef} style={{ width: '100%', height: '90%' }} />
      </div>

    </>
  )
}
