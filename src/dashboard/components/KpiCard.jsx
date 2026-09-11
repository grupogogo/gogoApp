import React from 'react';
import { useFuntions } from '../../hooks';

const DEFAULT_COLORS = [
  '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
  '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
];

export const KpiCard = ({
  title,
  subtitle,
  totalValue,
  badgeText,
  badgeBg = 'bg-primary-subtle text-primary',
  icon = 'fas fa-chart-bar',
  items = [],
  showAmount = true,
  unitLabel = 'und',
  footerText,
  maxHeight = '240px'
}) => {
  const { number_format, formatearPrecio, aTitulo } = useFuntions();

  // Calcular el total de cantidades para sacar porcentajes si no vienen dados
  const totalCantidad = items.reduce((acc, it) => acc + (Number(it.value) || 0), 0);

  return (
    <div className="card border border-light-subtle shadow-sm h-100 rounded-4 transition-hover" style={{ backgroundColor: '#ffffff' }}>
      <div className="card-body p-3 p-xl-4 d-flex flex-column">
        {/* Encabezado de la Tarjeta */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 shadow-xs"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                color: '#4e73df',
                fontSize: '1.1rem'
              }}
            >
              <i className={icon}></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.92rem', letterSpacing: '0.2px' }}>
                {aTitulo(title)}
              </h6>
              {subtitle && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          {badgeText && (
            <span className={`badge ${badgeBg} rounded-pill px-2 py-1 fw-semibold`} style={{ fontSize: '0.75rem' }}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Métrica Principal */}
        <div className="my-2">
          <h3 className="mb-0 fw-bolder text-dark tracking-tight" style={{ fontSize: '1.65rem' }}>
            {totalValue || '$ 0'}
          </h3>
          {footerText && (
            <small className="text-muted fw-medium d-block mt-1" style={{ fontSize: '0.75rem' }}>
              {footerText}
            </small>
          )}
        </div>

        <hr className="my-2 opacity-25" />

        {/* Lista de Ranking y Progreso */}
        <div
          className="flex-grow-1 overflow-auto pe-1 custom-scroll"
          style={{ maxHeight: maxHeight }}
        >
          {items.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-inbox fa-2x mb-2 opacity-50"></i>
              <p className="mb-0 small">Sin datos registrados</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2 mt-1">
              {items.map((item, index) => {
                const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                const pct = item.percentage !== undefined
                  ? Math.round(item.percentage)
                  : totalCantidad > 0
                    ? Math.round(((Number(item.value) || 0) / totalCantidad) * 100)
                    : 0;
                const nombreFormateado = aTitulo(item.label);

                return (
                  <div key={item.label || index} className="p-1 rounded-2 hover-bg-light">
                    {/* Fila con Nombre, Porcentaje y Valores */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '60%' }}>
                        <span
                          className="rounded-circle d-inline-block flex-shrink-0"
                          style={{ width: '8px', height: '8px', backgroundColor: color }}
                        ></span>
                        <span className="fw-semibold text-dark text-truncate small" title={nombreFormateado}>
                          {nombreFormateado}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-end flex-shrink-0">
                        <span className="badge bg-light text-secondary border px-1 py-0 fw-normal" style={{ fontSize: '0.7rem' }}>
                          {pct}%
                        </span>
                        <span className="fw-bold text-dark small" style={{ minWidth: '45px' }}>
                          {number_format(item.value || 0)} <small className="text-muted fw-normal">{unitLabel}</small>
                        </span>
                        {showAmount && item.amount !== undefined && (
                          <span className="text-muted small fw-medium d-none d-sm-inline" style={{ minWidth: '75px' }}>
                            {typeof item.amount === 'number' ? formatearPrecio(item.amount) : item.amount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div
                      className="progress rounded-pill"
                      style={{ height: '5px', backgroundColor: 'rgba(0,0,0,0.05)' }}
                    >
                      <div
                        className="progress-bar rounded-pill"
                        role="progressbar"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: color,
                          transition: 'width 0.5s ease-in-out'
                        }}
                        aria-valuenow={pct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
