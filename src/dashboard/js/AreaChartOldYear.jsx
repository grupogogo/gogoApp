import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useFuntions } from '../../hooks';

export const AreaChartOldYear = ({ data }) => {

  // State to store the visibility of each dataset, keyed by its label (the year).
  // This allows selections to persist across re-renders.
  const [visibility, setVisibility] = useState({});

  if (!data || !data.labels || !data.datasets ) { return }

  const { number_format, pastelColors } = useFuntions();

  // This effect synchronizes the visibility state with the datasets from props.
  // When new data arrives, it ensures every dataset has a visibility entry
  // without overwriting the user's previous selections.
  useEffect(() => {
    if (!data.datasets) return;

    setVisibility(prevVisibility => {
      const nextVisibility = { ...prevVisibility };
      data.datasets.forEach(dataset => {
        // If a dataset's label is not yet in our state, add it as visible (false).
        if (nextVisibility[dataset.label] === undefined) {
          nextVisibility[dataset.label] = false;
        }
      });
      return nextVisibility;
    });
  }, [data.datasets]);

  const chartRef = useRef(null);

  const buildLineDatasets = (rawDatasets, number_format, visibilityState) =>
    rawDatasets.map((dataset, index) => ({
      label: dataset.label + ': ' + number_format(dataset.data?.reduce((acc, val) => acc + val, 0)),
      data: dataset.data,
      tension: 0.3,
      backgroundColor: pastelColors[index % pastelColors.length],
      borderColor: pastelColors[index % pastelColors.length],
      pointRadius: 4,
      pointBorderColor: pastelColors[index % pastelColors.length],
      pointHoverRadius: 3,
      pointHoverBackgroundColor: pastelColors[index % pastelColors.length],
      pointHoverBorderColor: pastelColors[index % pastelColors.length],
      pointHitRadius: 10,
      pointBorderWidth: 1,
      datalabels: {
        align: 'end',
        anchor: 'end',
        formatter: (value) => number_format(value),
        color: pastelColors[index % pastelColors.length],
        font: {
          size: 14,
          weight: 'semibold',
        },
      },
      // Read the hidden status from our persistent state.
      hidden: visibilityState[dataset.label] ?? false,
    }));


  useEffect(() => {
    // A reference to the chart instance is stored so it can be destroyed on cleanup.
    let myLineChart;

    const ctx = chartRef.current.getContext('2d');

    myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: buildLineDatasets(data.datasets, number_format, visibility)
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
              //text: porValor ? 'Gastos Totales' : 'Gastos en $',
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
              const ci = legend.chart; // eslint-disable-line
              const index = legendItem.datasetIndex; // eslint-disable-line
              // Use the original dataset label as the unique key for our state.
              const label = data.datasets[index].label;

              // Update the React state to persist the user's choice.
              setVisibility(prev => ({
                ...prev,
                [label]: !prev[label],
              }));

              // Update the chart instance directly for immediate visual feedback.
              const meta = ci.getDatasetMeta(index); // eslint-disable-line
              meta.hidden = !meta.hidden;
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
                return label + ':' /* + ((porValor) ? '' : '$') */ + number_format(context.raw);
              }
            }
          }
        }
      }
    });

    // Cleanup function: This will be called when the component unmounts
    // or before the effect runs again, preventing duplicate charts.
    return () => {
      if (myLineChart) {
        myLineChart.destroy();
      }
    };
    // Re-run the effect if data or visibility state changes.
  }, [data, visibility, number_format, pastelColors]);

  return (
    <>
      <div style={{ height: '820px', width: '100%' }} className='border rounded shadow-sm p-2'>
        <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
      </div>

    </>
  )
}
