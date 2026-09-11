import { useEffect, useState } from "react";
import { CargaImagesTipo } from '../'
import { useClientesStore, useFuntions } from "../../hooks";
import Swal from "sweetalert2";
import { max } from "date-fns";


export const ImagesCiriosComunion = ({ pedido, setPedido, categoria, setCantidadItems }) => {
  const [talla, setTalla] = useState('t0');
  const [tipoPedido, setTipoPedido] = useState('opSurtido');
  const [genero, setGenero] = useState('0');
  const { buscarPrecio, buscarNombre, capitalize } = useFuntions();
  const { clienteActivo } = useClientesStore();

  const handleBlur = (event = 0) => {
    // Eliminar ceros a la izquierda cuando el campo pierde el foco
    return (event.target.value).replace(/^0+/, '');
  };

  const handleGenero = (value) => {
    setGenero(value);
    setTalla('t0')
  };
  const cargarTipoForm = ({ target }) => {
    setTipoPedido(target.value);
  }
  const cargarTalla = ({ target }) => {
    setTalla(target.value)
  }

  const verificarPrecio = () => {
    switch (categoria) {
      case 'kcg':
        if (clienteActivo.precios.precioKits.kcg !== null && clienteActivo.precios.precioKits.kcg !== 0) {
          return true
        } else {
          return false;
        }
      case 'kcp':
        if (clienteActivo.precios.precioKits.kcp !== null && clienteActivo.precios.precioKits.kcp !== 0) {
          return true
        } else {
          return false;
        }
      case 'kce':
        if (clienteActivo.precios.precioKits.kce !== null && clienteActivo.precios.precioKits.kce !== 0) {
          return true
        } else {
          return false;
        }
      case 'kb':
        if (clienteActivo.precios.precioKits.kb !== null && clienteActivo.precios.precioKits.kb !== 0) {
          return true
        } else {
          return false;
        }
      case 'cc':
        if (clienteActivo.precios.precioCirios.cc !== null && clienteActivo.precios.precioCirios.cc !== 0) {
          return true
        } else {
          return false;
        }
      case 'cb':
        if (clienteActivo.precios.precioCirios.cb !== null && clienteActivo.precios.precioCirios.cb !== 0) {
          return true
        } else {
          return false;
        }

      default:
        break;
    }
  }

  const onInputChangeCont = ({ target }, gen) => {
    const { name, value } = target;
    // Validaciones iniciales
    if (value === '' || isNaN(Number(value))) return;
    if (value < 0) return;

    const ban = verificarPrecio()
    console.log('ban', ban)
    if (!ban) {
      Swal.fire({
        icon: "error",
        title: 'Agregue primero el precio de ' + capitalize(buscarNombre(categoria.toUpperCase())) + ' para el cliente ' + clienteActivo.nombre,
        text: "Alto está mal!",
      });
      return;
    }

    setPedido(prevState => {
      // Clonamos el estado actual
      const nuevoEstado = [...prevState];
      const index = nuevoEstado.findIndex(item => item.nombreInput === name); // Cambia 'nombreInput' según tu clave identificadora

      if (value !== '0') {
        const nuevoItem = {
          nombreInput: name, // Usar el nombre del input como identificador
          cantidad: value,
          talla: (name === 'inputSurtidoNino' || name === 'inputSurtidoNina') ? 't0' : talla, // Asignar 't0' según la lógica
          genero: (name === 'inputSurtidoNino' || name === 'inputSurtidoNina') ? gen : genero,
          precioUnitario: buscarPrecio(categoria),
        };

        if (index !== -1) {
          // Si existe, actualizamos el objeto existente
          nuevoEstado[index] = nuevoItem;
        } else {
          // Si no existe, agregamos un nuevo objeto
          nuevoEstado.push(nuevoItem);
        }
      } else {
        // Eliminar el objeto si el valor es '0'
        if (index !== -1) {
          // Si existe, eliminamos
          nuevoEstado.splice(index, 1);
        }
      }

      return nuevoEstado; // Retornamos el nuevo estado como un array
    });
  };

  useEffect(() => {
    setCantidadItems(Object.values(pedido).reduce((acc, item) => acc + parseInt(item.cantidad), 0));
  }, [pedido]); // Esto se ejecuta cada vez que `pedidoKCG` cambie

  return (
    <>
      <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
        {/* BARRA SUPERIOR DE MODO Y CONTROLES */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3">
          {/* SEGMENTED CONTROL: SURTIDO VS DETALLADO */}
          <div className="btn-group p-1 bg-light rounded-pill border border-light-subtle" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                tipoPedido === 'opSurtido'
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-light text-secondary border-0'
              }`}
              onClick={() => setTipoPedido('opSurtido')}
            >
              <i className="fa-solid fa-layer-group me-1"></i>
              Surtido
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                tipoPedido === 'opDetallado'
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-light text-secondary border-0'
              }`}
              onClick={() => setTipoPedido('opDetallado')}
            >
              <i className="fa-solid fa-table-cells-large me-1"></i>
              Detallado
            </button>
          </div>

          {/* CONTROLES CONDICIONALES EN MODO DETALLADO */}
          {tipoPedido === 'opDetallado' && (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* SELECTOR DE TALLA SI ES KCG */}
              {categoria === 'kcg' && (
                <div className="input-group input-group-sm" style={{ width: 170 }}>
                  <span className="input-group-text bg-light text-secondary border-light-subtle">
                    <i className="fa-solid fa-ruler-horizontal"></i>
                  </span>
                  <select
                    id="inputTalla"
                    className="form-select form-select-sm shadow-none border-light-subtle"
                    onChange={cargarTalla}
                    value={talla}
                  >
                    {genero === '0' ? (
                      <>
                        <option value="t0">Talla surtida</option>
                        <option value="t6">Talla 6</option>
                        <option value="t7">Talla 7</option>
                        <option value="t8">Talla 8</option>
                        <option value="t9">Talla 9</option>
                        <option value="t10">Talla 10</option>
                      </>
                    ) : (
                      <>
                        <option value="t0">Talla surtida</option>
                        <option value="t7">Talla 7</option>
                        <option value="t8">Talla 8</option>
                        <option value="t9">Talla 9</option>
                        <option value="t10">Talla 10</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* BOTONES GÉNERO NIÑO / NIÑA */}
              {categoria !== 'kce' && (
                <div className="btn-group p-1 bg-light rounded-pill border border-light-subtle" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                      genero === '0'
                        ? 'btn-primary text-white shadow-xs'
                        : 'btn-light text-secondary border-0'
                    }`}
                    onClick={() => handleGenero('0')}
                  >
                    <i className="fa-solid fa-child me-1"></i>
                    Niño
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                      genero === '1'
                        ? 'btn-danger text-white shadow-xs'
                        : 'btn-light text-secondary border-0'
                    }`}
                    onClick={() => handleGenero('1')}
                  >
                    <i className="fa-solid fa-child-dress me-1"></i>
                    Niña
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTENIDO SEGÚN EL MODO SELECCIONADO */}
        {tipoPedido === 'opSurtido' ? (
          <div className="row g-3">
            {/* SURTIDO NIÑO */}
            <div className="col-12 col-sm-6">
              <div className="p-3 rounded-4 border border-primary-subtle bg-primary bg-opacity-10 d-flex flex-column gap-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                      <i className="fa-solid fa-child"></i>
                    </div>
                    <span className="fw-bold text-primary">Surtido Niño</span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                    Talla surtida
                  </span>
                </div>
                <div className="input-group mt-1">
                  <span className="input-group-text bg-white text-muted border-primary-subtle">
                    Cant.
                  </span>
                  <input
                    type="number"
                    className="form-control form-control-lg text-center fw-bold shadow-none border-primary-subtle"
                    name="inputSurtidoNino"
                    value={pedido.find(item => item.nombreInput === 'inputSurtidoNino')?.cantidad || '0'}
                    onChange={(event) => onInputChangeCont(event, '0')}
                    onFocus={(e) => e.target.select()}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* SURTIDO NIÑA */}
            <div className="col-12 col-sm-6">
              <div className="p-3 rounded-4 border border-danger-subtle bg-danger bg-opacity-10 d-flex flex-column gap-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 rounded-circle bg-danger text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                      <i className="fa-solid fa-child-dress"></i>
                    </div>
                    <span className="fw-bold text-danger">Surtido Niña</span>
                  </div>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">
                    Talla surtida
                  </span>
                </div>
                <div className="input-group mt-1">
                  <span className="input-group-text bg-white text-muted border-danger-subtle">
                    Cant.
                  </span>
                  <input
                    type="number"
                    className="form-control form-control-lg text-center fw-bold shadow-none border-danger-subtle"
                    name="inputSurtidoNina"
                    value={pedido.find(item => item.nombreInput === 'inputSurtidoNina')?.cantidad || '0'}
                    onChange={(event) => onInputChangeCont(event, '1')}
                    onFocus={(e) => e.target.select()}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO DETALLADO - CARGA DE IMÁGENES */
          <div className="pt-2">
            <CargaImagesTipo
              onInputChangeCont={onInputChangeCont}
              pedido={pedido}
              talla={talla}
              genero={genero}
              categoria={categoria}
            />
          </div>
        )}
      </div>
    </>
  );
};

