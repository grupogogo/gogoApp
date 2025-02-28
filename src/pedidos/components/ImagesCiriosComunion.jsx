import { useEffect, useState } from "react";
import { CargaImagesTipo } from '../'
import { useFuntions } from "../../hooks";


export const ImagesCiriosComunion = ({ pedido, setPedido, categoria, setCantidadItems }) => {
  const [talla, setTalla] = useState('t0');
  const [tipoPedido, setTipoPedido] = useState('opSurtido');
  const [genero, setGenero] = useState('0');
  const { buscarPrecio } = useFuntions();

  const handleBlur = (event = 0) => {
    // Eliminar ceros a la izquierda cuando el campo pierde el foco
    return (event.target.value).replace(/^0+/, '');
  };

  const seleccionaGenero = ({ target }) => {
    setGenero(target.value);
    setTalla('t0')
  }
  const cargarTipoForm = ({ target }) => {
    setTipoPedido(target.value);
  }
  const cargarTalla = ({ target }) => {
    setTalla(target.value)
  }
  const onInputChangeCont = ({ target }, gen) => {
    const { name, value } = target;
    console.log(value)
    // Validaciones iniciales
    if (value === '' || isNaN(Number(value))) return;
    if (value < 0) return;

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
        <div className="col-md-6">
          <div className="card-body form-group">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text" id="icono-select">
                  <i className="fas fa-sliders"></i>
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
            <div className="col-md-6 card-body">
              {/* GÉNERO */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check card">
                    <input className="form-check form-check-inline" defaultChecked type="radio" name="inlineRadioOptions" id="inlineRadio1" value="0" onClick={seleccionaGenero} />
                    <label className="form-check-label" htmlFor="inlineRadio1">
                      <i className="fa-solid fa-child fa-2x mr-1"></i>
                      Niño
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check card">
                    <input className="form-check form-check-inline" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="1" onClick={seleccionaGenero} />
                    <label className="form-check-label" htmlFor="inlineRadio2">
                      <i className="fa-solid fa-child fa-2x mr-1"></i>
                      Niña
                    </label>
                  </div>
                </div>
              </div>
            </div>
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
