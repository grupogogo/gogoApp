import { useFuntions } from "../../../hooks";

export const ProductsTable = ({ CategoryProduct, tablaPedido, setPedido }) => {
    const { formatearPrecio } = useFuntions();

    const handleDelete = (indexToDelete) => {
        setPedido(prevState => {
            if (!Array.isArray(prevState)) {
                console.error("El estado anterior no es un array:", prevState);
                return prevState;
            }
            const newPedido = prevState.filter((_, index) => index !== indexToDelete);
            return newPedido;
        });
    };

    const totalUnidades = (tablaPedido || []).reduce((acc, item) => acc + parseInt(item.cantidad || 0, 10), 0);

    return (
        <div className="col-lg-5">
            <div className="card border border-light-subtle shadow-xs rounded-4 overflow-hidden bg-white mb-3">
                <div className="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-1 px-2 rounded-2 bg-primary text-white small">
                            <i className="fa-solid fa-list-check"></i>
                        </div>
                        <span className="fw-bold text-dark small text-uppercase">
                            {CategoryProduct === 8 ? 'Resumen Parcial - Otros' : 'Resumen Parcial'}
                        </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className={`badge rounded-pill px-2 py-1 small ${totalUnidades > 0 ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}`}>
                            {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}
                        </span>
                        {CategoryProduct === 5 && totalUnidades > 0 && (
                            <span className="badge bg-dark text-white rounded-pill px-2 py-1 small fw-bold">
                                {formatearPrecio(
                                    (tablaPedido || []).reduce((acc, item) => acc + ((parseInt(item.cantidad, 10) || 0) * (item.precioUnitario || 0)), 0)
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {(!tablaPedido || tablaPedido.length === 0) ? (
                    <div className="p-4 text-center text-muted">
                        <div className="rounded-circle bg-light text-secondary mx-auto p-3 mb-2 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                            <i className="fa-solid fa-basket-shopping fs-4 opacity-50"></i>
                        </div>
                        <p className="small mb-0 fw-medium">No has añadido productos aún</p>
                        <small className="text-muted">Selecciona cantidades en el panel izquierdo</small>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {CategoryProduct === 8 ? (
                            /* Categoria OTROS */
                            <table className="table table-sm table-hover align-middle mb-0">
                                <thead className="table-light text-secondary small fw-semibold sticky-top">
                                    <tr className="text-center">
                                        <th scope="col" className="py-2 text-start ps-3">Producto</th>
                                        <th scope="col" className="py-2">Cant.</th>
                                        <th scope="col" className="py-2">Precio</th>
                                        <th scope="col" className="py-2">Total</th>
                                        <th scope="col" className="py-2 pe-3">Quitar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablaPedido.map((item, index) => (
                                        <tr className="text-center align-middle" key={index}>
                                            <td className="align-middle fw-semibold text-start ps-3 text-dark">{item.producto}</td>
                                            <td className="align-middle">
                                                <span className="badge bg-light text-dark border px-2 py-1 fw-bold">
                                                    {parseInt(item.cantidad, 10)}
                                                </span>
                                            </td>
                                            <td className="align-middle small text-muted">{formatearPrecio(item.precio)}</td>
                                            <td className="align-middle fw-bold text-dark">{formatearPrecio(item.precio * item.cantidad)}</td>
                                            <td className="align-middle pe-3">
                                                <button
                                                    className="btn btn-sm btn-light text-danger border-0 rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs"
                                                    style={{ width: '28px', height: '28px' }}
                                                    onClick={() => handleDelete(index)}
                                                    title="Eliminar item"
                                                >
                                                    <i className="fa-solid fa-trash-can small"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light border-top">
                                    <tr className="text-center">
                                        <td colSpan={3} className="text-end fw-semibold small text-muted py-2 pe-2">Total Otros:</td>
                                        <td className="fw-bold text-dark small py-2">
                                            {formatearPrecio(
                                                (tablaPedido || []).reduce((acc, item) => acc + ((parseInt(item.cantidad, 10) || 0) * (item.precio || 0)), 0)
                                            )}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        ) : (
                            /* Demás Categorias */
                            <table className="table table-sm table-hover align-middle mb-0">
                                <thead className="table-light text-secondary small fw-semibold sticky-top">
                                    <tr className="text-center">
                                        {CategoryProduct === 5 ? (
                                            <th scope="col" className="py-2 text-start ps-3">Tipo</th>
                                        ) : (
                                            <th scope="col" className="py-2 text-start ps-3">Género</th>
                                        )}
                                        {CategoryProduct !== 5 && (
                                            <th scope="col" className="py-2">Motivo</th>
                                        )}
                                        <th scope="col" className="py-2">Cant.</th>
                                        {(CategoryProduct === 1 || CategoryProduct === 5) && (
                                            <th scope="col" className="py-2">Talla</th>
                                        )}
                                        {CategoryProduct === 5 && (
                                            <th scope="col" className="py-2">Total</th>
                                        )}
                                        <th scope="col" className="py-2 pe-3">Quitar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablaPedido.map((item, index) => (
                                        <tr className="text-center align-middle" key={index}>
                                            {CategoryProduct === 5 ? (
                                                <td className="align-middle text-start ps-3">
                                                    <div className="fw-semibold text-dark">{item.categoria}</div>
                                                    {item.tipoEspecial && (
                                                        <span className="badge rounded-pill small" style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.72rem' }}>
                                                            {item.tipoEspecial}
                                                        </span>
                                                    )}
                                                </td>
                                            ) : (
                                                <td className="align-middle text-start ps-3">
                                                    <span className={`badge rounded-pill px-2 py-1 small ${
                                                        item.genero === '0'
                                                            ? 'bg-primary-subtle text-primary border border-primary-subtle'
                                                            : 'bg-danger-subtle text-danger border border-danger-subtle'
                                                    }`}>
                                                        <i className={`fa-solid ${item.genero === '0' ? 'fa-child' : 'fa-child-dress'} me-1`}></i>
                                                        {item.genero === '0' ? 'Niño' : 'Niña'}
                                                    </span>
                                                </td>
                                            )}

                                            {CategoryProduct !== 5 && (
                                                <td className="align-middle small fw-medium text-muted">
                                                    {(item.nombreInput || '').includes('Surtido') ? (
                                                        <span className="badge bg-light text-secondary border">Surtido</span>
                                                    ) : (
                                                        <span className="badge bg-light text-dark border">Detallado</span>
                                                    )}
                                                </td>
                                            )}

                                            <td className="align-middle">
                                                <span className="badge bg-light text-dark border px-2 py-1 fw-bold">
                                                    {parseInt(item.cantidad, 10)}
                                                </span>
                                            </td>

                                            {(CategoryProduct === 1 || CategoryProduct === 5) && (
                                                <td className="align-middle">
                                                    <span className="badge bg-light text-secondary border small">
                                                        {item.talla === 't0' ? 'Surtido' : (item.talla || '').toUpperCase()}
                                                    </span>
                                                </td>
                                            )}

                                            {CategoryProduct === 5 && (
                                                <td className="align-middle fw-bold text-dark small">
                                                    {formatearPrecio((parseInt(item.cantidad, 10) || 0) * (item.precioUnitario || 0))}
                                                </td>
                                            )}

                                            <td className="align-middle pe-3">
                                                <button
                                                    className="btn btn-sm btn-light text-danger border-0 rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs"
                                                    style={{ width: '28px', height: '28px' }}
                                                    onClick={() => handleDelete(index)}
                                                    title="Eliminar item"
                                                >
                                                    <i className="fa-solid fa-trash-can small"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {CategoryProduct === 5 && totalUnidades > 0 && (
                                    <tfoot className="table-light border-top">
                                        <tr className="text-center">
                                            <td colSpan={3} className="text-end fw-semibold small text-muted py-2 pe-2">Total Guantes:</td>
                                            <td className="fw-bold text-dark small py-2">
                                                {formatearPrecio(
                                                    (tablaPedido || []).reduce((acc, item) => acc + ((parseInt(item.cantidad, 10) || 0) * (item.precioUnitario || 0)), 0)
                                                )}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

