import React, { useEffect, useState } from 'react'
import { HeadersPedidos } from './forms/HeadersPedidos';
import { ProductsTable } from './forms/ProductsTable';
import { useForm } from '../../hooks/useForm';
import Swal from 'sweetalert2';
import { useProductosStore } from '../../hooks/useProductosStore';


export const OtrosProductos = ({ agregarPedidoGeneral }) => {
    const [cantidadItems, setCantidadItems] = useState(0);
    const [pedidoOtros, setPedidoOtros] = useState([]);
    const [band, setBand] = useState(true);
    const [vTotal, setVTotal] = useState(0);
    let productoExiste = null;
    const [alternarProducto, setAlternarProducto] = useState(false);
    const { startAddNewProducto, startLoadingProductos, productos } = useProductosStore();

    const toggleBand = () => {
        setBand(prevBand => !prevBand);
    };
    const { cantidad, producto, precio, detalle, selectProducto, onInputChange, productoNuevo = '', codProducto = '', detalleProducto = '', precioProducto = 0 } = useForm({
        cantidad: 0,
        producto: '',
        precio: 0,
        detalle: '',
        selectProducto: '0',
        productoNuevo: '',
        codProducto: '',
        precioProducto: 0,
        detalleProducto: ''
    });

    const almacenarPedido = () => {

        if (band) {
            productoExiste = pedidoOtros.some(pedido => pedido?.producto === selectProducto)
        } else {
            productoExiste = pedidoOtros.some(pedido => pedido?.producto === producto)
        }

        if (productoExiste) {
            Swal.fire({
                title: "Producto existente",
                text: 'El producto seleccionado ya existe en el pedido actual',
                icon: "warning"
            })
            return;
        } else {
            if (selectProducto === '0' || cantidad === 0 || precio === 0) {
                Swal.fire({
                    title: "Datos incompletos",
                    text: 'Datos incpmpletos, agregue los datos faltantes',
                    icon: "warning"
                })
                return;
            }
            setPedidoOtros(prevState => {
                // Verifica si prevState es un array, si no lo es, inicialízalo como uno vacío
                const pedidosPrevios = Array.isArray(prevState) ? prevState : [];
                if (band) {
                    return [
                        ...pedidosPrevios,
                        { producto: selectProducto, cantidad, precio } // Añades el nuevo objeto al array
                    ];
                } else {
                    return [
                        ...pedidosPrevios,
                        { producto: producto, cantidad, precio } // Añades el nuevo objeto al array
                    ];
                }
            });
        }
    };

    const sumaTotalPedidosOtros = () => {
        let res = 0;  // Usar let para permitir la reasignación
        pedidoOtros.forEach(item => {  // Usar forEach en lugar de map
            const cantidad = parseInt(item.cantidad);  // Convertir cantidad a número
            const precio = parseInt(item.precio);     // Convertir precio a número

            res = res + (cantidad * precio);          // Agregar el total calculado
        });
        setVTotal(res);  // Actualizar el estado con el total calculado
    }

    const guardarProducto = () => {

        const productoExiste = productos.some(prod => prod.producto === productoNuevo);
        if (productoExiste) {
            Swal.fire({
                title: "Producto existente",
                text: 'El producto ingresado ya existe en la base de datos',
                icon: "warning"
            })
            return;
        }
        if (productoNuevo === '' || codProducto === '' || precioProducto === '') {
            Swal.fire({
                title: "Campos vacíos",
                text: 'Todos los campos son obligatorios',
                icon: "warning"
            })
            return;
        } else {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Producto almacenado con éxito",
                showConfirmButton: false,
                timer: 1500
            });
            startAddNewProducto({
                producto: productoNuevo,
                codigo: codProducto,
                precio: precioProducto,
                detalle: detalleProducto || ''
            });
            setAlternarProducto(!alternarProducto);
            startLoadingProductos();
        }
    }

    const cargarSelect = (event, producto) => {
        onInputChange(event);
        onInputChange({ target: { name: 'precio', value: producto.precio } });

    }

    useEffect(() => {
        sumaTotalPedidosOtros()
        setCantidadItems(Object.values(pedidoOtros).reduce((acc, item) => acc + parseInt(item.cantidad), 0));
        agregarPedidoGeneral('OTR', Object.values(pedidoOtros), detalle); // Llamamos al callback con el pedido y la categoría
        startLoadingProductos();
    }, [pedidoOtros, detalle, productos]);



    return (
        <>
            <div className="card">
                <HeadersPedidos codigo='OTR' titulo='OTROS PRODUCTOS' cantidadItems={cantidadItems} collapsed='Seven' vTotal={vTotal} />
                <div id="collapseSeven" className="collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row mt-1">
                        <div className="col-lg-7 col-md-12">
                            <div className='row m-2'>
                                <div className="col-md-8 col-sm-12">
                                    {(!alternarProducto) && (
                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">Producto</span>
                                                </div>
                                                <select
                                                    value={selectProducto}
                                                    id="inputFormaPago"
                                                    className="form-control"
                                                    name="selectProducto"
                                                    onChange={(event) => {
                                                        const productoSeleccionado = productos.find(prod => prod.producto === event.target.value);
                                                        cargarSelect(event, productoSeleccionado);
                                                        console.log("Producto seleccionado:", productoSeleccionado);
                                                    }}
                                                >
                                                    <option value="seleccionar">Seleccionar</option>
                                                    {productos.map((prod, index) => (
                                                        <option key={index} value={prod.producto}>{prod.producto}</option>
                                                    ))}
                                                </select>

                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className='col-md-4 col-sm-12 mb-2 text-end'>
                                    {(!alternarProducto) && (
                                        <button
                                            className='btn btn-primary text-light btn-sm text-middle text-center'
                                            onClick={() => setAlternarProducto(!alternarProducto)}
                                        >Crear producto</button>
                                    )}
                                </div>
                                {(!alternarProducto) && (
                                    <>
                                        <div className='col-md-6 col-sm-12 mb-2'>
                                            <div className="input-group has-validation">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">Cantidad</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="cantidad"
                                                    value={cantidad}
                                                    onChange={onInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className='col-md-6 col-sm-12'>
                                            <div className="input-group has-validation">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">Precio</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="precio"
                                                    value={precio}
                                                    onChange={onInputChange}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {(!alternarProducto) && (
                                    <div className="row d-flex align-items-end">
                                        <div className="col-md-10 col-sm-12">
                                            <div className="form-group card-body">
                                                <label htmlFor="detalleCG">Detalle general de la categoría OTROS</label>
                                                <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange} rows={3}></textarea>
                                            </div>
                                        </div>
                                        <div className='col-md-2 col-sm-12'>
                                            <button className='btn btn-success btn-sm mb-4' onClick={almacenarPedido}>Agregar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Segunda fila */}
                            <div className="row">

                                {(alternarProducto) && (
                                    <div className="row m-2">
                                        <div className='row  rounded'>
                                            <div className='col-md-6 col-sm-12'>
                                                <h4 className='fw-bold'>Crear producto</h4>
                                            </div>
                                            <div className='col-md-6 col-sm-12 text-end pb-2'>
                                                {(alternarProducto) && (
                                                    <button
                                                        className='btn btn-danger btn-sm'
                                                        onClick={() => setAlternarProducto(!alternarProducto)}
                                                    >Cancelar</button>
                                                )}
                                            </div>
                                            <div className='col-md-6 col-sm-12 mb-2'>
                                                <div className="input-group has-validation mb-2">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text">Producto</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name='productoNuevo'
                                                        value={productoNuevo}
                                                        onChange={onInputChange}
                                                    />
                                                </div>
                                                <div className="input-group has-validation mb-2">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text">Código OTR-</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name='codProducto'
                                                        value={codProducto}
                                                        onChange={onInputChange}
                                                    />
                                                </div>
                                                <div className="input-group has-validation">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text">Precio</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name='precioProducto'
                                                        value={precioProducto}
                                                        onChange={onInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-12">
                                                <div className="form-group">
                                                    <label htmlFor="detalleProducto">Detalle</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="detalleProducto"
                                                        name="detalleProducto"
                                                        value={detalleProducto}
                                                        onChange={onInputChange}
                                                        rows={3}
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <div className='col-md-12 col-sm-12 text-right'>
                                                <button className='btn btn-primary btn-sm'
                                                    onClick={guardarProducto}
                                                >Guardar producto</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}

                        <ProductsTable CategoryProduct={8} tablaPedido={pedidoOtros} setPedido={setPedidoOtros} />

                    </div>
                </div>
            </div>
        </>
    )
}
