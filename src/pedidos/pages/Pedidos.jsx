import { useEffect, useState } from "react";
import { LayoutApp } from "../../layout/LayoutApp"
import { KitComuPeque, KitBautizo, CirioBautizo, CirioComunion, Guantes, EstadisticasPedidos, KitComungrande, OtrosProductos, ListaPedidos } from "../";
import { useClientesStore, useForm, useFuntions, usePedidosStore } from "../../hooks";
import { ReusableModal } from "../../modals/ReusableModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ClienteLoadInput } from "../components/forms";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
import { format } from "date-fns"; // Funciones para formato y parseo
import { Col, Row } from "react-bootstrap";


export const Pedidos = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const { clienteActivo, setClienteActivo, limpiarClienteActivo } = useClientesStore();
  const [pedidoGeneral, setPedidoGeneral] = useState([]);
  const { detalle = '', costoEnvio = 0, tipoDespacho = 'punto', formaPago = 'credito', handleClose, handleShow, showModal, onInputChange } = useForm();
  const { comenzarGuardarPedido } = usePedidosStore();
  const navegar = useNavigate();
  const [total, setTotal] = useState(0);
  const [detallesPorCategoria, setDetallesPorCategoria] = useState([]);
  const { formatearPrecio } = useFuntions();
  const [selAnioPedido, setSelFechaPedido] = useState('2025');
  const [resetearPedido, setResetearPedido] = useState(0); //Uso para resetear todas lac categorias del pedido general

  useEffect(() => {
    const nuevoAnio = parseInt(selAnioPedido, 10);

    // Asumiendo que tienes acceso a la fecha actual desde otro estado
    const fecha = new Date(); // fechaActual contiene día y mes correctos

    const nuevaFecha = (selAnioPedido === '2025')
      ? new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes(), fecha.getSeconds())
      : new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), 0, 0, 0);

    setFechaActual(nuevaFecha);    // actualiza la fecha completa
  }, [selAnioPedido])

  const limpiarPedido = () => {

    handleShow();
    limpiarClienteActivo();
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
  useEffect(() => {
    setClienteActivo([]);
  }, [])

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
      // activar reseteo para hijos incrementando el contador
      setResetearPedido(prev => prev + 1);
      setPedidoGeneral([]);
      setDetallesPorCategoria([]);
      setTimeout(() => {
        if (selAnioPedido === '2025') {
          navegar('/listaPedidos')
          setClienteActivo([]);
        } else {
        }
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
      <LayoutApp>
        {(clienteActivo.cliente_id) && (
          <>
            <EstadisticasPedidos />
          </>
        )}
        <div className="card">
          <div className="card shadow p-3">
            {/* Card Header Crear Pedido */}
            <div className="row align-items-center rounded">
              <div className="col-lg-9 text-align-middle">
                <div>
                  <h6 className="fw-semibold text-primary">CREAR PEDIDO {selAnioPedido !== '2025' ? 'ANTIGUO' : ''} </h6>
                  <div className="align-items-center">
                    <div className="input-group form-select-sm">
                      <select
                        className="form-select form-select-sm fs-6 fw-bold text-danger border-danger"
                        title="Filtro por año"
                        style={{ maxWidth: 'fit-content' }}
                        value={selAnioPedido} // solo el año
                        onChange={e => {
                          setSelFechaPedido(e.target.value); // actualiza el año como string                                       
                        }}
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                        <option value="2018">2018</option>
                        <option value="2017">2017</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 text-end align-items-center">
                <button className="btn btn-outline-primary btn-sm btn-icon-split shadow" onClick={limpiarPedido}>
                  <span>
                    <i className="fa fa-user-plus fa-lg"></i>
                  </span>
                  <span className="text"> Crear cliente</span>
                </button>
              </div>
            </div>
            <hr />
            <div className="card p-3 shadow">
              <Row>
                <Col md={6} className="mt-2">
                  <Row className="mb-3">
                    <Col md={8}>
                      {/* informacion del pedido */}
                      <span className="fw-medium fs-4 text-secondary">Información del pedido</span>
                    </Col>
                    <Col md={4} className="text-end">
                      {/* DataPciker */}
                      <DatePicker
                        className="form-control text-center"
                        selected={fechaActual}
                        dateFormat="PP HH:mm" // Formato de fecha y hora
                        locale="es" // Idioma español
                        onChange={(date) => setFechaActual(date)}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      {/* Tipo de Despacho */}
                      <div className="form-group">
                        <label htmlFor="inputDespacho" className="mb-2">Tipo de despacho</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-shipping-fast"></i>
                          </span>
                          <select
                            id="inputDespacho"
                            className="form-control"
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
                    </Col>
                    <Col md={4}>
                      {/* Forma de Pago */}

                      <div className="form-group">
                        <label htmlFor="inputFormaPago" className="mb-2">Forma de pago</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-sack-dollar"></i>
                          </span>
                          <select
                            id="inputFormaPago"
                            className="form-control"
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
                    </Col>
                    <Col md={4}>
                      {(formaPago === "alCobro") && (
                        <div className="form-group">
                          <label className="form-label" htmlFor="inputCostoEnvio">Costo del despacho</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fas fa-dollar-sign"></i>
                            </span>
                            <input
                              id="inputCostoEnvio"
                              type="number"
                              className="form-control"
                              onChange={onInputChange}
                              value={parseInt(costoEnvio) || 0}
                              name="costoEnvio"
                              placeholder="$"
                            />
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                  <hr />
                  <Row className="mt-3">
                    <Col>
                      <div className="row ml-1 mr-2">
                        <div className="col-md">
                          <div className="form-group">
                            <label htmlFor="detalleCG">Detalle general del pedido</label>
                            <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col md={6} className="border d-flex flex-column rounded-3" style={{ minHeight: "250px" }}>
                  <Row className="align-items-end mt-2 ">
                    <Col md={12}>
                      {(!clienteActivo.cliente_id) && (
                        <ClienteLoadInput />
                      )}
                    </Col>
                  </Row>
                  <Row>
                    {/* Información Cliente */}
                    {(clienteActivo.nombre) && (
                      <>
                        <Col md={12}>
                          {/* Nombre del Cliente */}
                          <div className="d-flex align-items-center mb-3 justify-content-between">
                            <h4 className="fw-bold text-secondary mb-0">{clienteActivo.nombre || "Nombre no disponible"}</h4>
                            <button
                              className="btn btn-danger btn-xs rounded-5 p-1 ms-2"
                              style={{ fontSize: "0.9rem", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                              onClick={limpiarClienteActivo}
                              title="Quitar cliente"
                            >
                              <i className="fas fa-close"></i>
                            </button>
                          </div>
                        </Col>
                        <hr />
                        <Col md={6}>
                          <Row>
                            <Col md={12} className="justify-content-between">
                              <span>Dirección: </span>
                              {clienteActivo.direccion || "Sin dirección"}
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <span>Teléfono: </span>
                              {clienteActivo.telefono || "Sin teléfono"}
                            </Col>
                          </Row>
                        </Col>
                        <Col md={6}>
                          <Row>
                            <Col md={12}>
                              <span>Ciudad: </span>
                              {clienteActivo.ciudad || "Sin ciudad"}
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <span>NIT/CC: </span>
                              {clienteActivo.nitCC || "Sin NIT/CC"}

                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <span className="fw-semibold">
                                {clienteActivo.distribuidor ? "Distribuidor" : "Cliente casual"}
                              </span>
                            </Col>
                          </Row>
                        </Col>
                      </>
                    )}
                  </Row>
                  <Row className="mt-3 mt-auto pb-2">
                    <hr />
                    <Col md={6}>
                      <span className="text-info fw-bold"> TOTAL PEDIDO: {formatearPrecio(total)} </span>
                    </Col>
                    <Col md={6} className="text-end">
                      {/* Enviar Pedido */}

                      <button className="btn btn-outline-success btn-sm btn-icon-split shadow mb-2"
                        onClick={guardarPedidoGeneral}>
                        <span>
                          <i className="fas fa-save fa-lg"></i>
                        </span>
                        <span className="text"> Enviar pedido</span>
                      </button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            {/* Cargar Pedido */}
            <div className="row">
              <div className="card-body row align-items-center">
                {/* Accordion Pedido */}
                <div className="col-lg-12">
                  <div className="accordion" id="accordionExample">
                    {(clienteActivo.cliente_id) && (
                      <>
                        <KitComungrande agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />

                        <KitComuPeque agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />

                        <KitBautizo agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />

                        <CirioBautizo agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />

                        <CirioComunion agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />

                        <Guantes agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />

                        <OtrosProductos agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutApp>
      {/* <ListaPedidos /> */}
      <ReusableModal show={showModal} handleClose={handleClose} />
    </>
  )
}