import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';


// Función para formatear números
const number_format = (number, decimals, dec_point, thousands_sep) => {
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
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

export const AreaChart = ({ totales, porValor }) => {

  const chartRef = useRef(null);
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: [
          {
            label: 'Ventas 2025',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: [
              'rgb(54, 162, 235)',
            ],
            pointRadius: 4,

            pointBorderColor: [
              'rgb(54, 162, 235)',
            ],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(54, 162, 235, 1)",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: totales.monthlySales2025,
          },
          {
            label: 'Ventas 2024',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: [
              'rgb(255, 99, 132)',
            ],
            pointRadius: 4,

            pointBorderColor: [
              'rgb(255, 99, 132)',
            ],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: totales.monthlySales2024,
          },
          {
            label: 'Ventas 2023',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: [
              'rgb(75, 192, 192)',
            ],
            pointRadius: 4,

            pointBorderColor: [
              'rgb(75, 192, 192)',
            ],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
            pointHoverBorderColor: "rgba(75, 192, 192, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: totales.monthlySales2023,
          },
          {
            label: 'Ventas 2022',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: [
              'rgb(153, 102, 255)',
            ],
            pointRadius: 4,

            pointBorderColor: [
              'rgb(153, 102, 255)',
            ],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(153, 102, 255, 1)",
            pointHoverBorderColor: "rgba(153, 102, 255, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: totales.monthlySales2022,
          },
          {
            label: 'Ventas 2021',
            tension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: [
              'rgb(255, 159, 64)',
            ],
            pointRadius: 4,

            pointBorderColor: [
              'rgb(255, 159, 64)',
            ],
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(255, 159, 64, 1)",
            pointHoverBorderColor: "rgba(255, 159, 64, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 1,
            data: totales.monthlySales2021,
          }
        ],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 20
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
              padding: 30,
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
            }
          }
        },
        plugins: {
          legend: {
            display: true
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
