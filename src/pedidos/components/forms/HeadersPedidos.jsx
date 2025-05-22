import React, { useEffect } from 'react'
import { useClientesStore, useFuntions, usePedidosStore } from '../../../hooks'
import { useSelector } from 'react-redux';

export const HeadersPedidos = ({ codigo, titulo, cantidadItems, collapsed, vTotal }) => {

    const { clienteActivo } = useClientesStore(); // Obtenemos el cliente activo del estado global
    const { totalGuantes } = useSelector((state) => state.pedidos);
    const { formatearPrecio } = useFuntions()
    const {
        precioKits: { kcg, kcp, kb },
        precioCirios: { cc, cb },
        precioGuantes: {
            gb,
            gn,
            gm,
        },
    } = clienteActivo?.precios || {};

    const formatPrice = (cantidad, categoria) => {
        if (cantidad === 0 || codigo === 'OTR' || codigo === 'GUANTES') return;
        let valorMultiplicado = null;
        switch (categoria) {
            case 'KCG':
                valorMultiplicado = cantidad * kcg;
                break;
            case 'KCP':
                valorMultiplicado = cantidad * kcp;
                break;
            case 'KB':
                valorMultiplicado = cantidad * kb;
                break;
            case 'CC':
                valorMultiplicado = cantidad * cc;
                break;
            case 'CB':
                valorMultiplicado = cantidad * cb;
                break;
            case 'GUA':
                valorMultiplicado = totalGuantes;

                break;
            default:
                break;
        }
        return formatearPrecio(valorMultiplicado);
    }

    return (
        <div className='p-1'>
            <div className="card-header card-hover border-0 shadow-sm" style={{ backgroundColor: '#EDF2F9' }} id="heading">
                <button
                    className="btn w-100 text-left collapsed d-flex justify-content-between align-items-center"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${collapsed}`}
                    aria-expanded="false"
                    aria-controls={`collapse${collapsed}`}
                >
                    <div className="d-flex align-items-center">
                        <div className="font-weight-bold me-2">{codigo} |</div>
                        <div>{titulo}</div>
                    </div>

                    {cantidadItems !== 0 && (
                        <div className="text-end">
                            <span className="badge badge-primary badge-pill m-1 font-weight-bold fs-6 text-secondary">
                                Items: {cantidadItems}
                            </span>
                            {codigo === 'OTR' ? (
                                <span className="badge badge-primary badge-pill m-1 font-weight-bold fs-6 text-secondary">
                                    {formatearPrecio(vTotal)}
                                </span>
                            ) : (
                                <span className="badge badge-primary badge-pill m-1 font-weight-bold fs-6 text-black">
                                    | {formatPrice(cantidadItems, codigo)}
                                </span>
                            )}
                        </div>
                    )}
                </button>
            </div>
        </div>

    )
}
