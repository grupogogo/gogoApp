import React, { useEffect, useState } from 'react'
import { HeadersPedidos } from './forms/HeadersPedidos';
import { ProductsTable } from './forms/ProductsTable';
import { useForm } from '../../hooks/useForm';
import Swal from 'sweetalert2';
import { useProductosStore } from '../../hooks/useProductosStore';
import { Collapse } from 'react-bootstrap';

export const OtrosProductos = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad || 0, 10)), 0);
    });
    const [pedidoOtros, setPedidoOtros] = useState(() => initialItems?.pedido || []);
    const [band, setBand] = useState(true);
    const [vTotal, setVTotal] = useState(0);
    const [alternarProducto, setAlternarProducto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idProductoEditando, setIdProductoEditando] = useState(null);
    const [categoriaProducto, setCategoriaProducto] = useState('Kits');

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoOtros(items);
            setCantidadItems(items.reduce((acc, item) => acc + (parseInt(item.cantidad || 0, 10)), 0));
        }
    }, [initialItems]);

    const {
        startAddNewProducto,
        startUpdateProducto,
        startDeleteProducto,
        startLoadingProductos,
        productos
    } = useProductosStore();

    const {
        cantidad,
        producto,
        precio,
        detalle,
        selectProducto,
        onInputChange,
        onResetForm,
        productoNuevo = '',
        codProducto = '',
        detalleProducto = '',
        precioProducto = 0
    } = useForm({
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

    useEffect(() => {
        if (resetearPedido) {
            setPedidoOtros([]);
            setCantidadItems(0);
            setVTotal(0);
            setBand(true);
            setAlternarProducto(false);
            setModoEdicion(false);
            setIdProductoEditando(null);
            const collapseElement = document.getElementById('collapseOtros');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    const almacenarPedido = () => {
        let productoExiste = null;
        if (band) {
            productoExiste = pedidoOtros.some(pedido => pedido?.producto === selectProducto);
        } else {
            productoExiste = pedidoOtros.some(pedido => pedido?.producto === producto);
        }

        if (productoExiste) {
            Swal.fire({
                title: "Producto existente",
                text: 'El producto seleccionado ya existe en el pedido actual',
                icon: "warning"
            });
            return;
        }

        if (selectProducto === '0' || cantidad <= 0 || precio <= 0) {
            Swal.fire({
                title: "Datos incompletos",
                text: 'Datos erróneos o incompletos, agregue cantidad y precio válidos',
                icon: "warning"
            });
            return;
        }

        setPedidoOtros(prevState => {
            const pedidosPrevios = Array.isArray(prevState) ? prevState : [];
            const prodNombre = band ? selectProducto : producto;
            return [
                ...pedidosPrevios,
                { producto: prodNombre, cantidad: parseInt(cantidad), precio: parseInt(precio) }
            ];
        });
    };

    const sumaTotalPedidosOtros = () => {
        let res = 0;
        pedidoOtros.forEach(item => {
            const cant = parseInt(item.cantidad) || 0;
            const prec = parseInt(item.precio) || 0;
            res += (cant * prec);
        });
        setVTotal(res);
    };

    const guardarProducto = async () => {
        if (!productoNuevo.trim() || !codProducto.trim() || precioProducto === '') {
            Swal.fire({
                title: "Campos vacíos",
                text: 'El nombre, código identificador y precio son obligatorios',
                icon: "warning"
            });
            return;
        }

        try {
            if (modoEdicion && idProductoEditando) {
                // Modo Edición
                await startUpdateProducto(idProductoEditando, {
                    producto: productoNuevo.trim(),
                    codigo: codProducto.trim().toUpperCase(),
                    precio: Number(precioProducto) || 0,
                    detalle: detalleProducto || '',
                    categoria: categoriaProducto || 'Kits'
                });

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Producto actualizado con éxito",
                    showConfirmButton: false,
                    timer: 1500
                });

                // Si estaba seleccionado en el select, actualizar el precio en el form
                if (selectProducto === productoNuevo) {
                    onInputChange({ target: { name: 'precio', value: precioProducto } });
                }

                cancelarFormularioProducto();
                await startLoadingProductos();
            } else {
                // Modo Creación
                const existe = productos.some(prod => prod.producto.toLowerCase() === productoNuevo.trim().toLowerCase());
                if (existe) {
                    Swal.fire({
                        title: "Producto existente",
                        text: 'El producto ingresado ya existe en la base de datos',
                        icon: "warning"
                    });
                    return;
                }

                await startAddNewProducto({
                    producto: productoNuevo.trim(),
                    codigo: codProducto.trim().toUpperCase(),
                    precio: Number(precioProducto) || 0,
                    detalle: detalleProducto || '',
                    categoria: categoriaProducto || 'Kits'
                });

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Producto almacenado con éxito",
                    showConfirmButton: false,
                    timer: 1500
                });

                cancelarFormularioProducto();
                await startLoadingProductos();
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al guardar",
                text: "No se pudo guardar el producto en la base de datos."
            });
        }
    };

    const iniciarEdicion = (prod) => {
        if (!prod) return;
        setModoEdicion(true);
        setIdProductoEditando(prod._id || prod.producto_id);
        setCategoriaProducto(prod.categoria || 'Kits');

        onInputChange({ target: { name: 'productoNuevo', value: prod.producto } });
        onInputChange({ target: { name: 'codProducto', value: (prod.codigo || '').replace(/^OTR-/i, '') } });
        onInputChange({ target: { name: 'precioProducto', value: prod.precio || 0 } });
        onInputChange({ target: { name: 'detalleProducto', value: prod.detalle || '' } });

        setAlternarProducto(true);
    };

    const eliminarProductoSeleccionado = async (prod) => {
        if (!prod) return;
        const prodId = prod._id || prod.producto_id;

        const result = await Swal.fire({
            title: "¿Eliminar producto del catálogo?",
            html: `Se eliminará permanentemente <strong>"${prod.producto}"</strong> de la base de datos.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await startDeleteProducto(prodId);
                onInputChange({ target: { name: 'selectProducto', value: '0' } });
                onInputChange({ target: { name: 'precio', value: 0 } });
                onInputChange({ target: { name: 'cantidad', value: 0 } });

                Swal.fire({
                    icon: "success",
                    title: "Producto eliminado",
                    text: "El producto ha sido eliminado del catálogo",
                    timer: 1500,
                    showConfirmButton: false
                });

                await startLoadingProductos();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error al eliminar",
                    text: "No se pudo eliminar el producto de la base de datos."
                });
            }
        }
    };

    const cancelarFormularioProducto = () => {
        setAlternarProducto(false);
        setModoEdicion(false);
        setIdProductoEditando(null);
        setCategoriaProducto('Kits');
        onInputChange({ target: { name: 'productoNuevo', value: '' } });
        onInputChange({ target: { name: 'codProducto', value: '' } });
        onInputChange({ target: { name: 'precioProducto', value: 0 } });
        onInputChange({ target: { name: 'detalleProducto', value: '' } });
    };

    const cargarSelect = (event, prod) => {
        onInputChange(event);
        if (prod) {
            onInputChange({ target: { name: 'precio', value: prod.precio || 0 } });
        } else {
            onInputChange({ target: { name: 'precio', value: 0 } });
        }
    };

    useEffect(() => {
        sumaTotalPedidosOtros();
        setCantidadItems(pedidoOtros.reduce((acc, item) => acc + parseInt(item.cantidad || 0), 0));
        agregarPedidoGeneral('OTR', pedidoOtros, detalle);
        startLoadingProductos();
    }, [pedidoOtros, detalle]);

    const productoSeleccionadoObj = productos.find(p => p.producto === selectProducto);

    return (
        <div className="">
            <HeadersPedidos codigo='OTR' titulo='OTROS PRODUCTOS' cantidadItems={cantidadItems} collapsed='Seven' vTotal={vTotal} />
            <div id="collapseSeven" className="collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample"
                style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                <div className="row g-3 p-2">
                    <div className="col-lg-7 col-md-12">
                        {/* FORMULARIO AGREGAR PRODUCTO EXISTENTE */}
                        {!alternarProducto ? (
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 rounded-circle bg-info-subtle text-info-emphasis d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                            <i className="fa-solid fa-shapes small"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">Seleccionar Producto Existente</h6>
                                            <small className="text-muted">Elige un ítem del catálogo o crea uno nuevo</small>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-xs d-flex align-items-center gap-1"
                                        onClick={() => {
                                            cancelarFormularioProducto();
                                            setAlternarProducto(true);
                                        }}
                                    >
                                        <i className="fa-solid fa-plus-circle"></i>
                                        <span>Crear producto</span>
                                    </button>
                                </div>

                                <div className="row g-3">
                                    {/* Selector de Producto con botones de Editar y Eliminar */}
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label small fw-semibold text-muted mb-0">
                                                Producto del catálogo
                                            </label>
                                            {productoSeleccionadoObj && (
                                                <span
                                                    className="badge rounded-pill fw-semibold"
                                                    style={{
                                                        backgroundColor: productoSeleccionadoObj.categoria === 'Guantes' ? '#f3e8ff' : '#e0f2fe',
                                                        color: productoSeleccionadoObj.categoria === 'Guantes' ? '#7e22ce' : '#0369a1',
                                                        border: `1px solid ${productoSeleccionadoObj.categoria === 'Guantes' ? '#d8b4fe' : '#7dd3fc'}`
                                                    }}
                                                >
                                                    {productoSeleccionadoObj.categoria === 'Guantes' ? '🧤 Negocio: Guantes' : '📦 Negocio: Kits'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-secondary border-light-subtle">
                                                <i className="fa-solid fa-box"></i>
                                            </span>
                                            <select
                                                value={selectProducto}
                                                className="form-select shadow-none border-light-subtle"
                                                name="selectProducto"
                                                onChange={(event) => {
                                                    const prod = productos.find(p => p.producto === event.target.value);
                                                    cargarSelect(event, prod);
                                                }}
                                            >
                                                <option value="0">-- Seleccionar producto --</option>
                                                {productos.map((prod, index) => (
                                                    <option key={index} value={prod.producto}>
                                                        {prod.producto} {prod.categoria ? `(${prod.categoria})` : ''} - ${prod.precio}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Botones de Editar y Eliminar al lado del Select */}
                                            {selectProducto !== '0' && productoSeleccionadoObj && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-warning text-dark border-light-subtle d-flex align-items-center gap-1 shadow-xs px-3"
                                                        onClick={() => iniciarEdicion(productoSeleccionadoObj)}
                                                        title="Editar este producto en la base de datos"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-warning-emphasis"></i>
                                                        <span className="small fw-semibold d-none d-sm-inline">Editar</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger border-light-subtle d-flex align-items-center gap-1 shadow-xs px-3"
                                                        onClick={() => eliminarProductoSeleccionado(productoSeleccionadoObj)}
                                                        title="Eliminar este producto permanentemente de la base de datos"
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                        <span className="small fw-semibold d-none d-sm-inline">Eliminar</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            Cantidad
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-secondary border-light-subtle">
                                                Cant.
                                            </span>
                                            <input
                                                type="number"
                                                className="form-control shadow-none border-light-subtle text-center fw-bold"
                                                name="cantidad"
                                                value={cantidad}
                                                onChange={onInputChange}
                                                onFocus={(e) => e.target.select()}
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            Precio unitario ($)
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-secondary border-light-subtle">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                className="form-control shadow-none border-light-subtle fw-bold"
                                                name="precio"
                                                value={precio}
                                                onChange={onInputChange}
                                                onFocus={(e) => e.target.select()}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleCG">
                                            <i className="fa-regular fa-comment-dots me-1"></i> Observaciones de esta categoría (opcional)
                                        </label>
                                        <textarea
                                            className="form-control shadow-none border-light-subtle"
                                            id="detalleCG"
                                            name="detalle"
                                            value={detalle}
                                            onChange={onInputChange}
                                            rows={2}
                                            placeholder="Notas adicionales sobre estos productos..."
                                        ></textarea>
                                    </div>

                                    <div className="col-12 text-end pt-1">
                                        <button
                                            type="button"
                                            className="btn btn-success rounded-pill px-4 fw-semibold shadow-xs d-inline-flex align-items-center gap-2"
                                            onClick={almacenarPedido}
                                        >
                                            <i className="fa-solid fa-cart-plus"></i>
                                            <span>Añadir a la lista</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* FORMULARIO REGISTRAR / EDITAR PRODUCTO EN BASE DE DATOS */
                            <div className="card border border-primary-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${modoEdicion ? 'bg-warning-subtle text-warning-emphasis' : 'bg-primary-subtle text-primary'}`}
                                            style={{ width: 32, height: 32 }}
                                        >
                                            <i className={`fa-solid ${modoEdicion ? 'fa-pen-to-square' : 'fa-plus'} small`}></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">
                                                {modoEdicion ? 'Editar Producto en Catálogo' : 'Crear Nuevo Producto en Catálogo'}
                                            </h6>
                                            <small className="text-muted">
                                                {modoEdicion ? 'Los cambios se actualizarán en la base de datos' : 'Se almacenará en la base de datos para futuros pedidos'}
                                            </small>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-xs"
                                        onClick={cancelarFormularioProducto}
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                <div className="row g-3">
                                    {/* 1. SELECTOR DE CATEGORÍA / NEGOCIO (KITS VS GUANTES) */}
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-dark mb-1">
                                            ¿A qué negocio pertenece este producto? <span className="text-danger">*</span>
                                        </label>
                                        <div className="d-flex flex-wrap gap-2">
                                            <div
                                                onClick={() => setCategoriaProducto('Kits')}
                                                className={`p-2 px-3 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all ${categoriaProducto === 'Kits' ? 'bg-primary-subtle border-primary text-primary fw-bold shadow-xs' : 'bg-light text-muted'}`}
                                                style={{ cursor: 'pointer', flex: 1, minWidth: '220px' }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="categoriaProducto"
                                                    id="catKits"
                                                    checked={categoriaProducto === 'Kits'}
                                                    onChange={() => setCategoriaProducto('Kits')}
                                                    className="form-check-input my-0 cursor-pointer"
                                                />
                                                <label htmlFor="catKits" className="mb-0 cursor-pointer small" style={{ cursor: 'pointer' }}>
                                                    <i className="fa-solid fa-box me-1"></i> Negocio de Kits (inc. Cirios)
                                                </label>
                                            </div>

                                            <div
                                                onClick={() => setCategoriaProducto('Guantes')}
                                                className={`p-2 px-3 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all`}
                                                style={{
                                                    cursor: 'pointer',
                                                    flex: 1,
                                                    minWidth: '220px',
                                                    backgroundColor: categoriaProducto === 'Guantes' ? '#f3e8ff' : '#f8f9fa',
                                                    borderColor: categoriaProducto === 'Guantes' ? '#a855f7' : '#dee2e6',
                                                    color: categoriaProducto === 'Guantes' ? '#7e22ce' : '#6c757d',
                                                    fontWeight: categoriaProducto === 'Guantes' ? 'bold' : 'normal'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="categoriaProducto"
                                                    id="catGuantes"
                                                    checked={categoriaProducto === 'Guantes'}
                                                    onChange={() => setCategoriaProducto('Guantes')}
                                                    className="form-check-input my-0 cursor-pointer"
                                                />
                                                <label htmlFor="catGuantes" className="mb-0 cursor-pointer small" style={{ cursor: 'pointer' }}>
                                                    <i className="fa-solid fa-hand-sparkles me-1"></i> Negocio de Guantes
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nombre del Producto */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            Nombre del producto <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control shadow-none border-light-subtle"
                                            name="productoNuevo"
                                            placeholder="Ej: Rosario conmemorativo"
                                            value={productoNuevo}
                                            onChange={onInputChange}
                                        />
                                    </div>

                                    {/* Código Identificador */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            Código identificador <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted small">OTR-</span>
                                            <input
                                                type="text"
                                                className="form-control shadow-none border-light-subtle"
                                                name="codProducto"
                                                placeholder="001"
                                                value={codProducto}
                                                onChange={onInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Precio de Venta */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            Precio de venta ($) <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-secondary border-light-subtle">$</span>
                                            <input
                                                type="number"
                                                className="form-control shadow-none border-light-subtle fw-bold"
                                                name="precioProducto"
                                                value={precioProducto}
                                                onChange={onInputChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Detalle o Descripción */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            Detalle o descripción
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control shadow-none border-light-subtle"
                                            id="detalleProducto"
                                            name="detalleProducto"
                                            value={detalleProducto}
                                            onChange={onInputChange}
                                            placeholder="Opcional..."
                                        />
                                    </div>

                                    {/* Botón Guardar / Actualizar */}
                                    <div className="col-12 text-end pt-2 d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary rounded-pill px-3 fw-semibold shadow-xs"
                                            onClick={cancelarFormularioProducto}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${modoEdicion ? 'btn-warning text-dark' : 'btn-primary'} rounded-pill px-4 fw-semibold shadow-xs d-inline-flex align-items-center gap-2`}
                                            onClick={guardarProducto}
                                        >
                                            <i className={`fa-solid ${modoEdicion ? 'fa-arrows-rotate' : 'fa-floppy-disk'}`}></i>
                                            <span>{modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA TABLA */}
                    <ProductsTable CategoryProduct={8} tablaPedido={pedidoOtros} setPedido={setPedidoOtros} />
                </div>
            </div>
        </div>
    );
};
