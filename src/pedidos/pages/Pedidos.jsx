import { useEffect, useState } from "react";
import { LayoutApp } from "../../layout/LayoutApp"
import { KitComuPeque, KitBautizo, CirioBautizo, CirioComunion, Guantes, EstadisticasPedidos, KitComungrande, OtrosProductos } from "../";
import { useClientesStore, useForm, useFuntions, usePedidosStore } from "../../hooks";
import { ReusableModal } from "../../modals/ReusableModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ClienteLoadInput } from "../components/forms";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
import { format } from "date-fns"; // Funciones para formato y parseo

import { useDispatch } from "react-redux";




export const Pedidos = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const { clienteActivo, setClienteActivo } = useClientesStore();
  const [pedidoGeneral, setPedidoGeneral] = useState([]);
  const { detalle = '', costoEnvio = 0, tipoDespacho = 'punto', formaPago = 'credito', handleClose, handleShow, showModal, onInputChange } = useForm();
  const { comenzarGuardarPedido } = usePedidosStore();
  const navegar = useNavigate();
  const [total, setTotal] = useState(0);
  const [detallesPorCategoria, setDetallesPorCategoria] = useState([]);
  const { formatearPrecio } = useFuntions();
  const dispatch = useDispatch();


  const limpiarPedido = () => {
    handleShow();
  }
  const formattedDate = format(fechaActual, "MMMM d, yyyy HH:mm", { locale: es });

  const actualizarPedidoPorCategoria = (categoria, pedido, detalle = '') => {
    setPedidoGeneral(prevState => {
      const nuevoEstado = { ...prevState };

      if (Object.keys(pedido).length === 0) {
        // Si el pedido está vacío, elimina la categoría
        delete nuevoEstado[categoria];
      } else {
        // Si el pedido aún tiene elementos, lo actualiza normalmente
        nuevoEstado[categoria] = {
          pedido,
          detalleGeneral: detalle
        };
      }
      return nuevoEstado;
    });

  };

  const guardarPedidoGeneral = () => {
    if (!clienteActivo.cliente_id) {
      Swal.fire({
        title: "Selecciona un cliente",
        text: 'No ha seleccionado un cliente para generar un pedido',
        icon: "error"
      })
      return;
    }
    if (pedidoGeneral.length <= 0 || Object.keys(pedidoGeneral).length === 0) {
      Swal.fire({
        title: "Selecciona un productos",
        text: 'No ha seleccionado almenos un producto para el pedido',
        icon: "error"
      })
      return;
    }

    const nuevoPedido = {
      cliente: clienteActivo.cliente_id,
      info: {
        costoEnvio,
        tipoDespacho,
        formaPago,
        estado: 'pendiente',
        detalleEstado: '',
        detalleGeneral: detalle,
        numeroGuia: '',
        fechaActual: formattedDate
      },
      listadoPedido: { ...pedidoGeneral },
    };
    setPedidoGeneral(nuevoPedido);

    const resultado = comenzarGuardarPedido(nuevoPedido);
    if (resultado) {
      Swal.fire({
        position: "center",
        cancelButtonColor: "#3085d6",
        confirmButtonColor: "red",
        icon: "success",
        title: "El pedido se ha almacenado satisfactoriamente",
        showConfirmButton: false,
        timer: 1400
      });
      setTimeout(() => {
        setClienteActivo([]);
        navegar('/listaPedidos')
      }, 1500);
    }
  }

  const calcularTotales = () => {
    // Verifica que pedidoGeneral exista y sea un objeto
    if (!pedidoGeneral || typeof pedidoGeneral !== "object") {
      console.log("pedidoGeneral es inválido o no está definido.");
      return; // Detén la ejecución si no es válido
    }
    let totalGeneral = 0;
    const detalles = [];

    Object.entries(pedidoGeneral).forEach(([categoria, { pedido }]) => {
      // Valida que `pedido` sea un array antes de proceder
      if (!Array.isArray(pedido)) {
        console.warn(`La categoría ${categoria} no tiene un pedido válido.`);
        return;
      }

      const totalCategoria = pedido.reduce((sum, item) => {
        // Asegúrate de que los valores de cantidad y precio sean válidos
        const cantidad = parseInt(item.cantidad) || 0;
        const precio = parseInt(item.precioUnitario || item.precio) || 0;
        return sum + cantidad * precio;
      }, 0);

      detalles.push({ [categoria]: totalCategoria });
      totalGeneral += totalCategoria;
    });

    setTotal(totalGeneral);
    setDetallesPorCategoria(detalles);
  };
  useEffect(() => {
    calcularTotales()
  }, [setPedidoGeneral])
  useEffect(() => {
    calcularTotales()
  }, [pedidoGeneral, setPedidoGeneral])


  return (
    <>
      {/* <img src={useImage('bautizo-nina', '1.webp')} alt="" /> */}
      <LayoutApp>
        <div className="container-fluid">
          {(clienteActivo.cliente_id) && (
            <>
              <EstadisticasPedidos />
            </>
          )}
          <div className="row">
            <div className="col-lg-12 ">
              <div className="card shadow p-3">
                {/* Card Header Crear Pedido */}
                <div className="">
                  <div className="row">
                    <div className="col-lg-9 text-align-middle">
                      <h6 className="fw-semibold text-primary">CREAR PEDIDO</h6>
                    </div>
                    <div className="col-lg-3 text-end">
                      <button className="btn btn-primary btn-sm btn-icon-split text-white" onClick={limpiarPedido}>
                        <span className="">
                          <i className="fas fa-check"></i>
                        </span>
                        <span className="text">Cliente nuevo</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body - Información Cliente */}
                <div className="mt-3">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="row">
                        <div className="col-lg-12">
                          <ClienteLoadInput />
                        </div>
                      </div>
                    </div>
                    {(clienteActivo.nombre) && (
                      <div className="col-lg-6">
                        {/* Nombre del Cliente */}
                        <h4 className="fw-bold text-info">{clienteActivo.nombre || "Nombre no disponible"}</h4>

                        {/* Detalles básicos */}
                        <div className="row mt-3">
                          {/* Columna izquierda */}
                          <div className="col-lg-6">
                            <ul className="list-group">
                              <li className="list-group-item">
                                <strong>Dirección: </strong>
                                {clienteActivo.direccion || "Sin dirección"}
                              </li>
                              <li className="list-group-item">
                                <strong>Teléfono: </strong>
                                {clienteActivo.telefono || "Sin teléfono"}
                              </li>
                            </ul>
                          </div>

                          {/* Columna derecha */}
                          <div className="col-lg-6">
                            <ul className="list-group">
                              <li className="list-group-item">
                                <strong>Ciudad: </strong>
                                {clienteActivo.ciudad || "Sin ciudad"}
                              </li>
                              <li className="list-group-item">
                                <strong>NIT/CC: </strong>
                                {clienteActivo.nitCC || "Sin NIT/CC"}
                              </li>
                              <li className="list-group-item">

                                <span className="fw-semibold">
                                  {clienteActivo.distribuidor ? "Distribuidor" : "Cliente casual"}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="border border-primary border-3 opacity-80" />

                {/* Card Body - Cargar Pedido */}
                <div className="row">
                  <div className="col-md-8">
                    <div className="row">

                      {/* informacion del pedido */}
                      <div className="col-lg-12">
                        <span className="fw-medium fs-4 text-secondary">Información del pedido</span>
                      </div>
                      {/* Tipo de Despacho */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="inputDespacho">Tipo de despacho</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fas fa-shipping-fast"></i>
                            </span>
                            <select
                              id="inputDespacho"
                              className="form-control form-control-sm"
                              onChange={onInputChange}
                              name="tipoDespacho"
                              value={tipoDespacho}
                            >
                              <option value="punto">Entrega en punto</option>
                              <option value="envio">Envío</option>
                              <option value="urbano">Urbano</option>
                              <option value="recogida">Recogida</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Forma de Pago */}
                      <div className="col-md-4 ">
                        <div className="form-group">
                          <label htmlFor="inputFormaPago">Forma de pago</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fas fa-sack-dollar"></i>
                            </span>
                            <select
                              id="inputFormaPago"
                              className="form-control form-control-sm"
                              onChange={onInputChange}
                              value={formaPago}
                              name="formaPago"
                            >
                              <option value="credito">Crédito</option>
                              <option value="pagado">Pagado</option>
                              <option value="alCobro">Al cobro</option>
                              <option value="pCasa">Pago en casa</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Por Cobrar */}
                      <div className="col-md-4">
                        {(formaPago === "alCobro" || formaPago === "pCasa") && (
                          <div className="mb-3 ">
                            <label className="form-label">Costo del despacho</label>
                            <input type="number" className="form-control form-control-sm"
                              onChange={onInputChange}
                              value={(parseInt(costoEnvio)) || 0}
                              name="costoEnvio"
                              placeholder="$" />
                          </div>

                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4  text-center">
                    <span className="text-info fw-bold fs-5"> TOTAL PEDIDO: {formatearPrecio(total)} </span>
                  </div>

                  <div className="row ">
                    {/* DataPciker */}
                    <div className="col-md-3">
                      <DatePicker
                        className="form-control"
                        selected={fechaActual}
                        dateFormat="PP HH:mm" // Formato de fecha y hora
                        locale="es" // Idioma español
                        onChange={(date) => setFechaActual(date)}
                      />
                    </div>
                    {/* Enviar Pedido */}
                    <div className="col-md-9 text-right">
                      <div className="text-right">
                        <button className="btn btn-success btn-sm btn-icon-split"
                          style={{
                            '--bs-btn-font-size': '1rem',
                            'width': '40%'
                          }}
                          onClick={guardarPedidoGeneral}>
                          <span>
                            <i className="fas fa-save"></i>
                          </span>
                          <span className="text">Enviar pedido</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card-body row align-items-center">
                    {/* Accordion Pedido */}
                    <div className="col-lg-12">
                      <div className="accordion" id="accordionExample">
                        {(clienteActivo.cliente_id) && (
                          <>
                            <hr className="border border-primary border-3 opacity-80" />

                            <KitComungrande agregarPedidoGeneral={actualizarPedidoPorCategoria} />

                            <KitComuPeque agregarPedidoGeneral={actualizarPedidoPorCategoria} />

                            <KitBautizo agregarPedidoGeneral={actualizarPedidoPorCategoria} />

                            <CirioBautizo agregarPedidoGeneral={actualizarPedidoPorCategoria} />

                            <CirioComunion agregarPedidoGeneral={actualizarPedidoPorCategoria} />

                            <Guantes agregarPedidoGeneral={actualizarPedidoPorCategoria} />

                            <OtrosProductos agregarPedidoGeneral={actualizarPedidoPorCategoria} />
                          </>
                        )}
                      </div>
                      <hr className="border border-primary border-3 opacity-80" />
                    </div>
                  </div>
                </div>
                <div className="row ml-1 mr-2">
                  <div className="col-md">
                    <div className="form-group">
                      <label htmlFor="detalleCG">Detalle general del pedido</label>
                      <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutApp>
      <ReusableModal show={showModal} handleClose={handleClose} />
    </>
  )
}