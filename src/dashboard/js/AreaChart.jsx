import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';

export const AreaChart = ({ totales = [], porValor, anioFiltro, tipo = 0 }) => {
  const { number_format } = useFuntions();

  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const monthlySales2025 =
    tipo === 3 || tipo === 5 ? totales :
      Array.isArray(totales?.monthlySales2025)
        ? totales.monthlySales2025
        : Array.isArray(totales?.monthlySales)
          ? totales.monthlySales
          : [];

  useEffect(() => {
    if (!canvasRef.current || monthlySales2025.length === 0) return;

    // 🔴 DESTRUIR SI YA EXISTE
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    const currentMonth = new Date().getMonth();

    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const baseData = monthlySales2025

    const accumulatedData = baseData.reduce((acc, curr, i) => {
      acc.push(i === 0 ? curr : curr + acc[i - 1]);
      return acc;
    }, []);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: anioFiltro,
            data: baseData,
            tension: 0.3,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(78, 115, 223, 0.05)',
            pointRadius: 4,
          },
          {
            label: `${anioFiltro} acumulado`,
            data: accumulatedData,
            tension: 0.3,
            borderDash: [10, 5],
            borderColor: 'rgb(255, 99, 132)',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}: ${(porValor ? '' : '$')}${number_format(ctx.raw)}`
            }
          }
        }
      }
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };

  }, [monthlySales2025, porValor]);

  return <canvas ref={canvasRef} />;
};
