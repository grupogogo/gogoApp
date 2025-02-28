import { useFuntions } from "../../../hooks";


export const ProductsTable = ({ CategoryProduct, tablaPedido, setPedido }) => {
    const { formatearPrecio } = useFuntions();
    const handleDelete = (indexToDelete) => {
        setPedido(prevState => {
            // Validar que prevState sea un array antes de continuar
            if (!Array.isArray(prevState)) {
                console.error("El estado anterior no es un array:", prevState);
                return prevState;
            }
            const newPedido = prevState.filter((_, index) => index !== indexToDelete);
            return newPedido;
        });
    };
    return (
        <>
            {(CategoryProduct === 8) && //Categoria OTROS
                (
                    <div className="col-lg-5">
                        <div className='row'>
                            <table className="table table-sm table-hover custom-table mr-3">
                                <thead className="table-secondary">
                                    <tr className="text-center">
                                        <th colSpan="5" className="text-uppercase">
                                            Listado parcial del pedido - {CategoryProduct}
                                        </th>
                                    </tr>
                                    <tr className='thead-dark text-center'>

                                        <th scope="col" className="rounded-2">Producto</th>
                                        <th scope="col" className="rounded-2">Cant.</th>
                                        <th scope="col" className="rounded-2">Precio</th>
                                        <th scope="col" className="rounded-2">Total</th>
                                        <th scope="col" className="rounded-2">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablaPedido.map((item, index) => (
                                        <tr className='text-center align-middle' key={index}>
                                            <td className="align-middle">{item.producto}</td>
                                            <td className="align-middle">{parseInt(item.cantidad, 10)}</td>
                                            <td className="align-middle">{formatearPrecio(item.precio)}</td>
                                            <td className="align-middle fw-bold">{formatearPrecio(item.precio * item.cantidad)}</td>

                                            <td className="align-middle">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(index)}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    </div>
                )}
            {/* Tabla para KCG */}
            {(CategoryProduct !== 8) && (
                <div className="col-lg-5 border">
                    <div className='row'>
                        <table className="table table-sm table-hover custom-table mr-3">
                            <thead>
                                <tr className="text-center">
                                    <th colSpan="5" className="text-uppercase">
                                        Listado parcial del pedido
                                    </th>
                                </tr>
                                <tr className='thead-dark text-center'>
                                    {CategoryProduct === 5
                                        ? <th scope="col" className="rounded-2">Categoria</th>
                                        : <th scope="col" className="rounded-2">Genero</th>
                                    }
                                    <th scope="col" className="rounded-2">Motivo</th>
                                    <th scope="col" className="rounded-2">Cant.</th>
                                    {(CategoryProduct === 1 || CategoryProduct === 5) && (
                                        <th scope="col" className="rounded-2">Talla</th>
                                    )}
                                    <th scope="col" className="rounded-2">Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tablaPedido.map((item, index) => (
                                    <tr className='text-center align-middle' key={index}>
                                        {CategoryProduct === 5
                                            ? <td className="align-middle">{item.categoria}</td>
                                            : <td className={(item.genero === '0') ? 'table-primary align-middle' : 'table-danger align-middle'}>
                                                {(item.genero === '0') ? 'Niño' : 'Niña'}
                                            </td>
                                        }
                                        <td className="align-middle">{((item.nombreInput).includes('Surtido')) ? 'Surtido' : 'Detallado'}</td>
                                        <td className="align-middle">{parseInt(item.cantidad, 0)}</td>
                                        {(CategoryProduct === 1 || CategoryProduct === 5) && (
                                            <td className="align-middle">
                                                {(item.talla === 't0') ? 'Surtido' : (item.talla).toUpperCase()}
                                            </td>
                                        )}
                                        <td className="align-middle">
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(index)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </div>
            )
            }
        </>
    )
}
