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
    console.log(categoria)
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
      <div className="row">
        {/* TIPO PEDIDO DETALLADO - SURTIDO */}
        <div className="col-md-3">
          <div className="form-group">
            <div className="input-group mb-2 mt-2">
              <div className="input-group-prepend">
                <span className="input-group-text" id="icono-select">
                  <i className="fas fa-chevron-down"></i>
                </span>
              </div>
              <select id="inputPedido" className="form-control form-control-sm" aria-describedby="icono-select" onChange={cargarTipoForm}>
                <option value="opSurtido">Surtido</option>
                <option value="opDetallado">Detallado</option>
              </select>
            </div>
            {/* TALLA */}
            {(tipoPedido === 'opDetallado' && categoria === 'kcg') && (
              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="icono-select">
                    <i className="fas fa-hand"></i>
                  </span>
                </div>
                <select
                  id="inputTalla"
                  className="form-control form-control-sm"
                  aria-describedby="icono-select"
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
          </div>
        </div>

        {tipoPedido === 'opDetallado' ? (
          <>
            {/* DETALLADO */}
            <div className="col"></div>
            {/* CONTENEDOR */}
            {categoria !== 'kce' && (
              <div className="col-md-3 m-2 border p-3 rounded shadow">
                <div className="d-flex gap-2">
                  {/* BOTÓN NIÑO */}
                  <button
                    type="button"
                    className={`d-flex flex-column align-items-center justify-content-center ${genero === '0' ? 'btn btn-primary text-white' : 'btn btn-outline-primary'
                      }`}
                    style={{ flex: 1, minHeight: 84 }}
                    onClick={() => handleGenero('0')}
                    aria-pressed={genero === '0'}
                  >
                    <i className="fa-solid fa-child fa-2x mb-1"></i>
                    <span className="fw-bold">Niño</span>
                  </button>

                  {/* BOTÓN NIÑA */}
                  <button
                    type="button"
                    className={`d-flex flex-column align-items-center justify-content-center ${genero === '1' ? 'btn btn-danger text-white' : 'btn btn-outline-danger'
                      }`}
                    style={{ flex: 1, minHeight: 84 }}
                    onClick={() => handleGenero('1')}
                    aria-pressed={genero === '1'}
                  >
                    <i className="fa-solid fa-child-dress fa-2x mb-1"></i>
                    <span className="fw-bold">Niña</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* SURTIDO */}
            <div className="col-lg-12">
              <div className="col-md-6">
                <div className="input-group has-validation mb-2">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Cantidad niño</span>
                  </div>
                  <input
                    type="number"
                    className="form-control"
                    name="inputSurtidoNino"
                    value={pedido.find(item => item.nombreInput === 'inputSurtidoNino')?.cantidad || '0'} // Busca el objeto correspondiente
                    onChange={(event) => onInputChangeCont(event, '0')}
                    onFocus={(e) => e.target.select()}
                  /* onBlur={handleBlur()} */
                  />

                </div>
                <div className="input-group has-validation">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Cantidad niña</span>
                  </div>
                  <input
                    type="number"
                    className="form-control"
                    name="inputSurtidoNina"
                    value={pedido.find(item => item.nombreInput === 'inputSurtidoNina')?.cantidad || '0'}
                    onChange={(event) => onInputChangeCont(event, '1')}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DETALLADO - PEDIDO POR TALLA */}
      <div className="row card-body">
        {tipoPedido === 'opDetallado' && (
          <>
            <div className="row">
              <CargaImagesTipo onInputChangeCont={onInputChangeCont} pedido={pedido} talla={talla} genero={genero} categoria={categoria} />
            </div>
          </>
        )}
      </div>
    </>

  );
}
