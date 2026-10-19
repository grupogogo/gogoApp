import { useEffect, useState, useMemo } from "react";
import { LayoutApp } from "../../layout/LayoutApp"
import { KitComuPeque, KitBautizo, CirioBautizo, CirioComunion, CirioConfirmacion, Guantes, KitComungrande, OtrosProductos, CardEstadisticasCliente } from "../";
import { useClientesStore, useForm, useFuntions, usePedidosStore } from "../../hooks";
import { ReusableModal } from "../../modals/ReusableModal";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { ClienteLoadInput } from "../components/forms";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
import { format } from "date-fns";
import { Col, Row } from "react-bootstrap";
import { KitComunionECO } from "../components/KitComunionECO";


export const Pedidos = () => {
  const navegar = useNavigate();
  const location = useLocation();
  const pedidoCopiado = location.state?.pedidoCopiado;

  const [fechaActual, setFechaActual] = useState(new Date());
  const { clienteActivo, setClienteActivo, limpiarClienteActivo } = useClientesStore();
  const [pedidoGeneral, setPedidoGeneral] = useState(() => {
    if (pedidoCopiado?.listadoPedido) {
      return JSON.parse(JSON.stringify(pedidoCopiado.listadoPedido));
    }
    return {};
  });

  const initialFormVal = useMemo(() => {
    if (pedidoCopiado?.info) {
      return {
        detalle: pedidoCopiado.info.detalleGeneral || '',
        costoEnvio: Number(pedidoCopiado.info.costoEnvio) || 0,
        tipoDespacho: pedidoCopiado.info.tipoDespacho || 'punto',
        formaPago: pedidoCopiado.info.formaPago || 'credito'
      };
    }
    return {
      detalle: '',
      costoEnvio: 0,
      tipoDespacho: 'punto',
      formaPago: 'credito'
    };
  }, [pedidoCopiado]);

  const { detalle = '', costoEnvio = 0, tipoDespacho = 'punto', formaPago = 'credito', handleClose, handleShow, showModal, onInputChange, setFormState } = useForm(initialFormVal);
  const { comenzarGuardarPedido, pedidos, pedidosActivo, startLoadingPedidos, getPedidosCliente } = usePedidosStore();
  const [total, setTotal] = useState(0);
  const [detallesPorCategoria, setDetallesPorCategoria] = useState([]);
  const { formatearPrecio } = useFuntions();
  const [selAnioPedido, setSelFechaPedido] = useState(new Date().getFullYear());
  const [resetearPedido, setResetearPedido] = useState(0);

  useEffect(() => {
    if (!pedidos || pedidos.length === 0) {
      startLoadingPedidos();
    }
  }, []);

  useEffect(() => {
    if (pedidoCopiado?.info) {
      setFormState(prev => ({
        ...prev,
        detalle: pedidoCopiado.info.detalleGeneral || '',
        costoEnvio: Number(pedidoCopiado.info.costoEnvio) || 0,
        tipoDespacho: pedidoCopiado.info.tipoDespacho || 'punto',
        formaPago: pedidoCopiado.info.formaPago || 'credito'
      }));
    }
    if (pedidoCopiado?.cliente) {
      setClienteActivo(pedidoCopiado.cliente);
      if (pedidoCopiado.cliente.cliente_id) {
        getPedidosCliente(pedidoCopiado.cliente.cliente_id);
      }
    }
    if (pedidoCopiado?.listadoPedido) {
      setPedidoGeneral(JSON.parse(JSON.stringify(pedidoCopiado.listadoPedido)));
    }
  }, [pedidoCopiado]);

  useEffect(() => {
    const nuevoAnio = parseInt(selAnioPedido, 10);
    const fecha = new Date();

    const nuevaFecha = (selAnioPedido === new Date().getFullYear())
      ? new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes(), fecha.getSeconds())
      : new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), 0, 0, 0);

    setFechaActual(nuevaFecha);
  }, [selAnioPedido])

  const limpiarPedido = () => {
    handleShow();
    limpiarClienteActivo();
    setResetearPedido(prev => prev + 1);
    setPedidoGeneral({});
    setDetallesPorCategoria([]);
    setTotal(0);
  }

  const handleCambiarCliente = () => {
    limpiarClienteActivo();
    setResetearPedido(prev => prev + 1);
    setPedidoGeneral({});
    setDetallesPorCategoria([]);
    setTotal(0);
    setFormState(prev => ({
      ...prev,
      detalle: '',
      costoEnvio: 0
    }));
  };
  const formattedDate = format(fechaActual, "MMMM d, yyyy HH:mm", { locale: es });

  const actualizarPedidoPorCategoria = (categoria, pedido, detalle = '') => {
    setPedidoGeneral(prevState => {
      const nuevoEstado = { ...prevState };

      if (Object.keys(pedido).length === 0) {
        delete nuevoEstado[categoria];
      } else {
        nuevoEstado[categoria] = {
          pedido,
          detalleGeneral: detalle
        };
      }
      return nuevoEstado;
    });
  };

  const guardarPedidoGeneral = async () => {
    if (!clienteActivo.cliente_id) {
      Swal.fire({
        title: "Selecciona un cliente",
        text: 'No has seleccionado un cliente para generar el pedido',
        icon: "warning"
      });
      return;
    }
    if (pedidoGeneral.length <= 0 || Object.keys(pedidoGeneral).length === 0) {
      Swal.fire({
        title: "Selecciona productos",
        text: 'Debes agregar al menos un producto al pedido',
        icon: "warning"
      });
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

    const resultado = await comenzarGuardarPedido(nuevoPedido);
    if (resultado) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Pedido Creado con Éxito!",
        html: `
          <div style="text-align: center; font-size: 13.5px; color: #475569;">
            <p style="margin: 0 0 8px 0;">Se registró el pedido correctamente para <strong style="color: #0284c7;">${clienteActivo.nombre}</strong></p>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; margin: 8px auto 0 auto; display: inline-block; text-align: left;">
              <div style="font-size: 12px; color: #64748b;">Ciudad: <strong style="color: #0f172a;">${clienteActivo.ciudad || 'No especificada'}</strong></div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Despacho: <strong style="color: #0f172a;">${tipoDespacho}</strong></div>
              <div style="font-size: 13px; font-weight: 800; color: #16a34a; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
                Total: ${formatearPrecio(total + (Number(costoEnvio) || 0))}
              </div>
            </div>
            <div style="margin-top: 10px; font-size: 11.5px; color: #94a3b8;">
              Redirigiendo a la lista de pedidos...
            </div>
          </div>
        `,
        showConfirmButton: false,
        timer: 2000
      });
      setResetearPedido(prev => prev + 1);
      setPedidoGeneral([]);
      setDetallesPorCategoria([]);
      setTimeout(() => {
        if (selAnioPedido === new Date().getFullYear()) {
          navegar('/listaPedidos');
          setClienteActivo([]);
        }
      }, 2000);
    }
  }

  const calcularTotales = () => {
    if (!pedidoGeneral || typeof pedidoGeneral !== "object") {
      return;
    }
    let totalGeneral = 0;
    const detalles = [];

    Object.entries(pedidoGeneral).forEach(([categoria, { pedido }]) => {
      if (!Array.isArray(pedido)) return;

      const totalCategoria = pedido.reduce((sum, item) => {
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
    calcularTotales();
  }, [pedidoGeneral]);

  const categoriasConProductos = Object.keys(pedidoGeneral).length;

  return (
    <>
      <LayoutApp>
        <div className="container-fluid px-0 pb-4">
          {/* Cabecera Principal */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4 d-flex align-items-center justify-content-center shadow-xs" style={{ width: 52, height: 52 }}>
                <i className="fa-solid fa-cart-plus fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-1">
                  Crear Pedido {selAnioPedido !== new Date().getFullYear() ? `(${selAnioPedido})` : ''}
                </h4>
                <p className="text-muted small mb-0">
                  Selecciona o busca un cliente y arma el pedido agregando productos del catálogo
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-2"
                onClick={limpiarPedido}
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Nuevo Cliente</span>
              </button>
            </div>
          </div>

          {/* Estadísticas del Cliente Seleccionado (Cards superiores compactas e informativas) */}
          {clienteActivo?.cliente_id && (
            <CardEstadisticasCliente
              cliente={clienteActivo}
              pedidosActivo={pedidosActivo}
              todosPedidos={pedidos}
            />
          )}

          {/* Banner de Pedido Copiado */}
          {pedidoCopiado && (
            <div className="alert alert-success border-0 rounded-4 shadow-sm mb-4 p-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ backgroundColor: '#ecfdf5', borderLeft: '5px solid #10b981' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-success text-white p-2 d-flex align-items-center justify-content-center shadow-xs" style={{ width: 42, height: 42 }}>
                  <i className="fa-solid fa-copy fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-success-emphasis mb-0">
                    Copia cargada del Pedido #{pedidoCopiado.pedidoOriginalId?.slice(-6).toUpperCase()}
                  </h6>
                  <span className="small text-secondary">
                    Se cargaron los productos con las <strong>tarifas vigentes de {clienteActivo?.nombre || 'este cliente'}</strong> y la <strong>fecha actual de hoy</strong>. Revisa los datos o haz clic directamente en "Guardar y Enviar Pedido".
                  </span>
                </div>
              </div>
              <span className="badge bg-success text-white rounded-pill px-3 py-2 fw-semibold shadow-xs">
                <i className="fa-solid fa-check me-1"></i> Listo para guardar
              </span>
            </div>
          )}

          {/* Tarjeta de Configuración y Cliente */}
          <div className="card border border-light-subtle shadow-sm rounded-4 p-3 p-md-4 bg-white mb-4">
            <Row className="g-4">
              {/* Columna Izquierda: Información de entrega y pago */}
              <Col xs={12} lg={6} className="border-end-lg">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-sliders text-primary"></i>
                    <h6 className="fw-bold text-dark mb-0">Detalles de Entrega y Pago</h6>
                  </div>
                  <div className="w-100 w-sm-auto" style={{ maxWidth: '200px' }}>
                    <div className="input-group input-group-sm">
                      <DatePicker
                        className="form-control form-control-sm text-center fw-medium shadow-none"
                        selected={fechaActual}
                        dateFormat="PP HH:mm"
                        locale="es"
                        onChange={(date) => setFechaActual(date)}
                      />
                      <span className="input-group-text bg-light text-muted">
                        <i className="fa-regular fa-calendar"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <label className="form-label small fw-semibold text-muted mb-1">
                      <i className="fa-solid fa-truck-fast text-secondary me-1"></i> Tipo de despacho
                    </label>
                    <select
                      className="form-select shadow-none"
                      onChange={onInputChange}
                      name="tipoDespacho"
                      value={tipoDespacho}
                    >
                      <option value="punto">Entrega en punto</option>
                      <option value="envio">Envío nacional</option>
                      <option value="urbano">Domicilio urbano</option>
                      <option value="recogida">Recogida en taller</option>
                    </select>
                  </Col>

                  <Col xs={12} sm={6}>
                    <label className="form-label small fw-semibold text-muted mb-1">
                      <i className="fa-solid fa-money-bill-wave text-secondary me-1"></i> Forma de pago
                    </label>
                    <select
                      className="form-select shadow-none"
                      onChange={onInputChange}
                      value={formaPago}
                      name="formaPago"
                    >
                      <option value="credito">Crédito</option>
                      <option value="pagado">Pagado</option>
                      <option value="alCobro">Al cobro</option>
                      <option value="pCasa">Pago contraentrega</option>
                    </select>
                  </Col>

                  {formaPago === "alCobro" && (
                    <Col xs={12}>
                      <label className="form-label small fw-semibold text-muted mb-1">
                        <i className="fa-solid fa-dollar-sign text-secondary me-1"></i> Costo del despacho
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted fw-bold">$</span>
                        <input
                          type="number"
                          className="form-control shadow-none"
                          onChange={onInputChange}
                          value={parseInt(costoEnvio) || 0}
                          name="costoEnvio"
                          placeholder="Valor de flete o despacho"
                        />
                      </div>
                    </Col>
                  )}
                </Row>

                <div className="mb-0">
                  <label className="form-label small fw-semibold text-muted mb-1">
                    <i className="fa-regular fa-comment-dots text-secondary me-1"></i> Observaciones / Detalle general
                  </label>
                  <textarea
                    className="form-control shadow-none"
                    rows={2}
                    placeholder="Instrucciones especiales de empaque, transporte o notas del pedido..."
                    name="detalle"
                    value={detalle}
                    onChange={onInputChange}
                  />
                </div>
              </Col>

              {/* Columna Derecha: Cliente Activo y Resumen del Total */}
              <Col xs={12} lg={6} className="d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-user-tag text-primary"></i>
                      <h6 className="fw-bold text-dark mb-0">Cliente de la Orden</h6>
                    </div>
                    {clienteActivo?.cliente_id && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.72rem' }}
                        onClick={handleCambiarCliente}
                        title="Quitar cliente seleccionado y reiniciar cantidades de productos"
                      >
                        <i className="fa-solid fa-xmark"></i>
                        <span>Cambiar cliente</span>
                      </button>
                    )}
                  </div>

                  {!clienteActivo?.cliente_id ? (
                    <div className="p-3 bg-light rounded-3 border border-dashed mb-3">
                      <div className="mb-2">
                        <span className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: '0.5px' }}>
                          <i className="fa-solid fa-magnifying-glass text-primary me-1"></i> Buscar y Cargar Cliente
                        </span>
                      </div>
                      <ClienteLoadInput />
                      <small className="text-muted d-block mt-2" style={{ fontSize: '0.76rem' }}>
                        <i className="fa-solid fa-circle-info me-1 text-primary"></i>
                        Al seleccionar el cliente se cargarán automáticamente sus tarifas de precios y su historial de compras.
                      </small>
                    </div>
                  ) : (
                    <div className="card border border-light-subtle rounded-3 p-3 bg-light mb-3 shadow-xs">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <div>
                            <h5 className="fw-bold text-dark mb-0">{clienteActivo.nombre}</h5>
                            <small className="text-muted">{clienteActivo.ciudad || "Ciudad no especificada"}</small>
                          </div>
                        </div>
                        <span className={`badge rounded-pill px-2 py-1 ${clienteActivo.distribuidor ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ fontSize: '0.72rem' }}>
                          {clienteActivo.distribuidor ? "Distribuidor" : "Cliente casual"}
                        </span>
                      </div>

                      <div className="row g-2 pt-2 border-top small text-secondary">
                        <div className="col-12 col-sm-6">
                          <i className="fa-solid fa-location-dot me-1 text-muted"></i>
                          <span>{clienteActivo.direccion || "Sin dirección"}</span>
                        </div>
                        <div className="col-12 col-sm-6">
                          <i className="fa-solid fa-phone me-1 text-muted"></i>
                          <span>{clienteActivo.telefono || "Sin teléfono"}</span>
                        </div>
                        <div className="col-12 col-sm-6">
                          <i className="fa-solid fa-id-card me-1 text-muted"></i>
                          <span>NIT/CC: {clienteActivo.nitCC || "Sin documento"}</span>
                        </div>
                        {clienteActivo.detalle && (
                          <div className="col-12 col-sm-6 text-truncate" title={clienteActivo.detalle}>
                            <i className="fa-regular fa-note-sticky me-1 text-muted"></i>
                            <span>{clienteActivo.detalle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Banner de Total y Guardar */}
                <div className="card border-0 bg-primary bg-opacity-10 rounded-3 p-3 mt-3">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
                    <div>
                      <span className="small fw-bold text-primary text-uppercase d-flex align-items-center gap-1">
                        <i className="fa-solid fa-calculator"></i> Total a Facturar
                      </span>
                      <small className="text-muted">
                        {categoriasConProductos > 0 ? `${categoriasConProductos} categorías con ítems agregados` : 'Ningún producto agregado aún'}
                      </small>
                    </div>
                    <div className="text-sm-end">
                      <span className="display-6 fs-3 fw-bold text-primary">
                        ${formatearPrecio(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success rounded-pill w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={guardarPedidoGeneral}
                    disabled={!clienteActivo?.cliente_id || total <= 0}
                  >
                    <i className="fa-solid fa-paper-plane fa-lg"></i>
                    <span>Guardar y Enviar Pedido</span>
                  </button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Sección de Catálogo de Productos */}
          {!clienteActivo?.cliente_id ? (
            <div className="card border border-light-subtle shadow-sm rounded-4 p-5 text-center bg-light my-3">
              <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                <i className="fa-solid fa-arrow-up fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">Selecciona un cliente para comenzar</h5>
              <p className="text-muted small mb-0" style={{ maxWidth: 460, margin: '0 auto' }}>
                Para armar el pedido con la lista de precios correspondiente, busca y selecciona un cliente en el recuadro superior o crea uno nuevo.
              </p>
            </div>
          ) : (
            <div className="card border border-light-subtle shadow-sm rounded-4 p-3 p-md-4 bg-white">
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <i className="fa-solid fa-boxes-stacked"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Catálogo de Productos</h5>
                    <small className="text-muted">Añade cantidades para cada ítem del pedido</small>
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                  Tarifas aplicadas de {clienteActivo.nombre}
                </span>
              </div>

              <div className="accordion" id="accordionExample">
                <KitComungrande agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['KCG']} />
                <KitComuPeque agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['KCP']} />
                <KitComunionECO agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['KCE']} />
                <KitBautizo agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['KB']} />
                <CirioBautizo agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['CB']} />
                <CirioComunion agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['CC']} />
                <CirioConfirmacion agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['CCON']} />
                <Guantes agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['GUANTES']} />
                <OtrosProductos agregarPedidoGeneral={actualizarPedidoPorCategoria} resetearPedido={resetearPedido} initialItems={pedidoCopiado?.listadoPedido?.['OTR']} />
              </div>
            </div>
          )}

          {/* Barra Flotante Inferior de Envío para Móviles */}
          {clienteActivo?.cliente_id && total > 0 && (
            <div
              className="d-lg-none position-fixed bottom-0 start-0 end-0 border-top shadow-lg p-2.5 px-3 d-flex align-items-center justify-content-between"
              style={{ zIndex: 1040, backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(8px)' }}
            >
              <div>
                <small className="text-muted d-block fw-semibold" style={{ fontSize: '0.7rem' }}>Total Factura</small>
                <span className="fw-bolder text-primary fs-5">${formatearPrecio(total)}</span>
              </div>
              <button
                type="button"
                className="btn btn-success rounded-pill px-3 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-2"
                onClick={guardarPedidoGeneral}
                style={{ fontSize: '0.86rem' }}
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Enviar Pedido</span>
              </button>
            </div>
          )}
        </div>
      </LayoutApp>
      <ReusableModal show={showModal} handleClose={handleClose} />
    </>
  );
};
