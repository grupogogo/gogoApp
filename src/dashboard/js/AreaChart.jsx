import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';

export const AreaChart = ({ totales, porValor }) => {
  const { number_format } = useFuntions();
  const chartRef = useRef(null);

  const monthlySales2025 = Array.isArray(totales?.monthlySales2025) && totales.monthlySales2025.length > 0
    ? totales.monthlySales2025
    : Array.isArray(totales?.monthlySales)
      ? totales.monthlySales
      : [];

  useEffect(() => {
    if (!monthlySales2025 || monthlySales2025.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    const currentMonth = new Date().getMonth() + 1;
    const allLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = allLabels.slice(0, currentMonth + 1);

    const trimData = (data) =>
      Array.isArray(data) ? data.slice(1, currentMonth + 1) : [];

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
            label: '2025 acumulado',
            tension: 0.3,
            borderDash: [10, 5], // ← Línea discontinua
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: ['rgb(255, 99, 132)'],
            pointRadius: 5,
            pointBorderColor: ['rgb(255, 99, 132)'],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgb(255, 99, 132)",
            pointHoverBorderColor: "rgb(255, 99, 132)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: monthlySales2025.slice(1).reduce((acc, curr, i) => {
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
              color: 'rgb(255, 99, 132)',
              font: {
                size: 10,
                weight: 'semibold',
              },
            },
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
        scales: {
          x: {
            grid: { display: true, drawBorder: true },
            ticks: { maxTicksLimit: 13 }
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
              grid: {
                color: "rgb(234, 236, 244)",
                zeroLineColor: "rgb(234, 236, 244)",
                drawBorder: true,
                borderDash: [2],
                zeroLineBorderDash: [2]
              },
              suggestedMax: Math.max(...trimData(monthlySales2025)) * 1.1
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
                font: { size: 12, weight: 'bold', family: 'Arial' },
                color: '#858796'
              }
            },
            tooltip: {
              backgroundColor: "rgb(255,255,255)",
              bodyColor: "#858796",
              titleMarginBottom: 10,
              titleColor: '#6e707e',
              titleFont: { size: 20 },
              borderColor: '#dddfeb',
              borderWidth: 1,
              padding: 15,
              displayColors: false,
              intersect: false,
              mode: 'index',
              caretPadding: 10,
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  return label + ':' + ((porValor) ? '' : '$') + number_format(context.raw);
                }
              }
            }
          }
        }
      });

    return () => {
      myLineChart.destroy();
    };
  }, [totales]);

  return (
    <canvas ref={chartRef} />
  );
};
