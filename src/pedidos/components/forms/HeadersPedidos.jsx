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
        <div className="card-header" id="heading">
            <button
                className="btn btn-block text-left collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${collapsed}`}
                aria-expanded="false"
                aria-controls={`#collapse${collapsed}`}
            >
                <div className="row">
                    <div className="col-lg-8 d-flex align-items-center">
                        <div className="mr-2 font-weight-bold">{codigo} |</div>
                        <div>{titulo}</div>
                    </div>
                    {(cantidadItems !== 0) && (
                        <div className="col-lg-4 text-right">
                            <span className="badge badge-primary badge-pill m-1 font-weight-bold fs-6">{cantidadItems}</span>
                            {(codigo === 'OTR') && (
                                <span className="badge badge-primary badge-pill m-1 font-weight-bold fs-6">{formatearPrecio(vTotal)}</span>
                            )}

                            {codigo !== 'OTR' && (
                                <span className="badge badge-primary badge-pill m-1 font-weight-bold fs-6">{formatPrice(cantidadItems, codigo)}</span>
                            )}
                        </div>
                    )}
                </div>
            </button>
        </div>

    )
}
