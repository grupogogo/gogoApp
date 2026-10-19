import React from 'react';
import { useClientesStore, useFuntions } from '../../../hooks';
import { useSelector } from 'react-redux';

export const HeadersPedidos = ({ codigo, titulo, cantidadItems, collapsed, vTotal }) => {
    const { clienteActivo } = useClientesStore();
    const { formatearPrecio } = useFuntions();

    const {
        precioKits: { kcg, kcp, kb, kce } = {},
        precioCirios: { cc, cb, ccon } = {},
    } = clienteActivo?.precios || {};

    const formatPrice = (cantidad, categoria) => {
        if (cantidad === 0 || codigo === 'GUANTES' || codigo === 'GUA') return 0;
        let valorMultiplicado = 0;
        switch (categoria) {
            case 'KCG': valorMultiplicado = cantidad * (kcg || 0); break;
            case 'KCP': valorMultiplicado = cantidad * (kcp || 0); break;
            case 'KCE': valorMultiplicado = cantidad * (kce || 0); break;
            case 'KB': valorMultiplicado = cantidad * (kb || 0); break;
            case 'CC': valorMultiplicado = cantidad * (cc || 0); break;
            case 'CCON': valorMultiplicado = cantidad * (ccon || cc || cb || 0); break;
            case 'CB': valorMultiplicado = cantidad * (cb || 0); break;
            default: valorMultiplicado = 0; break;
        }
        return valorMultiplicado;
    };

    const unitPrice = formatPrice(1, codigo);

    const getIconConfig = (cod) => {
        switch (cod) {
            case 'KCG':
            case 'KCP':
            case 'KCE':
            case 'KB':
                return { icon: 'fa-boxes-packing', badgeBg: 'bg-primary-subtle text-primary border-primary-subtle' };
            case 'CC':
            case 'CCON':
            case 'CB':
                return { icon: 'fa-fire-flame-curved', badgeBg: 'bg-warning-subtle text-warning-emphasis border-warning-subtle' };
            case 'GUA':
                return { icon: 'fa-hand', badgeBg: 'bg-success-subtle text-success border-success-subtle' };
            case 'OTR':
                return { icon: 'fa-shapes', badgeBg: 'bg-info-subtle text-info-emphasis border-info-subtle' };
            default:
                return { icon: 'fa-box', badgeBg: 'bg-secondary-subtle text-secondary border-secondary-subtle' };
        }
    };

    const { icon, badgeBg } = getIconConfig(codigo);

    return (
        <div className="mb-2">
            <div
                className="card border border-light-subtle shadow-xs rounded-3 overflow-hidden transition-all"
                style={{ backgroundColor: cantidadItems > 0 ? '#f0fdf4' : '#f8fafc' }}
                id="heading"
            >
                <button
                    className="btn w-100 p-3 text-start collapsed d-flex justify-content-between align-items-center shadow-none border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${collapsed}`}
                    aria-expanded="false"
                    aria-controls={`collapse${collapsed}`}
                    style={{ textDecoration: 'none' }}
                >
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className={`badge border rounded-pill px-2 py-1 font-monospace fw-bold ${badgeBg}`}>
                            <i className={`fa-solid ${icon} me-1`}></i>
                            {codigo}
                        </span>

                        <span className="fw-bold text-dark fs-6 mb-0">
                            {titulo}
                        </span>

                        {unitPrice > 0 && (
                            <span className="badge bg-white text-secondary border border-light-subtle rounded-pill px-2 py-1 small fw-normal">
                                {formatearPrecio(unitPrice)} <span className="text-muted small">c/u</span>
                            </span>
                        )}

                        {codigo === 'KCE' && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-0 small">
                                Nuevo
                            </span>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2 ms-auto">
                        {cantidadItems > 0 ? (
                            <div className="d-flex align-items-center gap-1">
                                <span className="badge bg-primary text-white rounded-pill px-2 py-1 fw-semibold small">
                                    <i className="fa-solid fa-check me-1"></i>
                                    {cantidadItems} {cantidadItems === 1 ? 'ud' : 'uds'}
                                </span>
                                {(codigo === 'OTR' || codigo === 'GUA' || vTotal !== undefined) ? (
                                    <span className="badge bg-dark text-white rounded-pill px-2 py-1 fw-bold small">
                                        {formatearPrecio(vTotal || 0)}
                                    </span>
                                ) : (
                                    <span className="badge bg-dark text-white rounded-pill px-2 py-1 fw-bold small">
                                        {formatearPrecio(formatPrice(cantidadItems, codigo))}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-muted small d-none d-sm-inline">
                                0 agregados
                            </span>
                        )}

                        <div className="p-1 rounded-circle bg-white border border-light-subtle text-muted d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                            <i className="fa-solid fa-chevron-down small"></i>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

