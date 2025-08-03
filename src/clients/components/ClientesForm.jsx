import { useEffect, useState } from "react"
import { useForm } from "../../hooks/"
import { useClientesStore } from "../../hooks";


export const ClientesForm = ({ setCliente, cliente }) => {
  const { clienteActivo } = useClientesStore();
  const [checkPrecios, setCheckPrecios] = useState(false);
  const [clienteTipo, setClienteTipo] = useState(true);

  const {
    nombre,
    email,
    nitCC,
    telefono,
    direccion,
    ciudad,
    detalle,
    distribuidor,
    precios: {
      precioKits: { kcg = 0, kcp = 0, kb = 0 } = {},
      precioCirios: { cc = 0, cb = 0 } = {},
      precioGuantes: { gb = 0, gn = 0, gm = 0 } = {}
    } = {},
    onInputChange,
    formState
  } = useForm(clienteActivo || {});

  const cargarPrecios = (event) => {
    setCheckPrecios(event.target.checked);
  }
  const selTipoCliente = (event) => {
    setClienteTipo(event.target.checked);
    onInputChange(event);
  }
  const handleChange = (event) => {
    onInputChange(event);
  }

  useEffect(() => {
    setCliente(formState);
  }, [formState]);

  return (
    <>
      <div className="container card">
        <div className="row m-2">
          <div className="col-md-12 text-right">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckClienteDistribuidor" name="distribuidor" value={!clienteTipo} onChange={selTipoCliente} checked={clienteTipo} />
              <label className="form-check-label" htmlFor="flexSwitchCheckClienteDistribuidor">
                <span>Cliente distribuidor</span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <div className="row">
            <div className="col-md-8">
              <label htmlFor="iName" className="form-label">Razón social / Nombre</label>
              <div className="input-group mb-1">
                <span className="input-group-text" id="icono-select">
                  <i className="fas fa-building-user"></i>
                </span>
                <input type="text" className="form-control" id="iName" name="nombre" value={nombre || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="col-md-4">
              <div className="">
                <label htmlFor="iNit" className="form-label">Nit | CC</label>
                <div className="input-group mb-1">
                  <span className="input-group-text" id="icono-select">
                    <i className="fas fa-sliders"></i>
                  </span>
                  <input type="email" className="form-control" id="iNit" name="nitCC" value={nitCC || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="">
                <label htmlFor="iMail" className="form-label">Correo</label>
                <div className="input-group mb-1">
                  <span className="input-group-text" id="basic-addon1">@</span>
                  <input type="email" className="form-control" id="imail" name="email" value={email || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="">
                <label htmlFor="iphone" className="form-label">Teléfono</label>
                <div className="input-group mb-1">
                  <span className="input-group-text" id="icono-select">
                    <i className="fas fa-mobile-retro"></i>
                  </span>
                  <input type="email" className="form-control" id="lblPhone" name="telefono" value={telefono || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <label htmlFor="iAddress" className="form-label">Dirección e indicaciones de despacho</label>
              <div className="input-group mb-1">
                <span className="input-group-text" id="icono-select">
                  <i className="fas fa-location-dot"></i>
                </span>
                <input type="email" className="form-control" id="iAddress" name="direccion" value={direccion || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="col-md-4">
              <label htmlFor="iCountry" className="form-label">Ciudad</label>
              <div className="input-group mb-1">
                <span className="input-group-text" id="icono-select">
                  <i className="fas fa-flag"></i>
                </span>
                <input type="email" className="form-control" id="iCountry" name="ciudad" value={ciudad || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="">
                <label htmlFor="aInfoAdd" className="form-label">Información adicional</label>
                <textarea className="form-control" id="aInfoAdd" name="detalle" value={detalle || ''} onChange={handleChange} rows="1"></textarea>
              </div>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-12 text-right">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheck" onChange={cargarPrecios} />
                    <label className="form-check-label" htmlFor="flexSwitchCheck">
                      <span>Agregar precios</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          {(checkPrecios) && (
            <>
              <div className="shadow p-3 mb-2 bg-body-tertiary rounded">
                <div className="row">
                  <div className="badge text-bg-primary text-wrap mb-3">
                    KITS
                  </div>
                  <div className="col-md-4">
                    <div className="input-group" title="Kit primera comunión grande">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">KC-G: $</span>
                      <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="kcg" value={kcg || 0} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group" title="Kit primera comunión pequeño">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">KC-P: $</span>
                      <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="kcp" value={kcp || 0} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group" title="Kit de bautizo">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">KB: $</span>
                      <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="kb" value={kb || 0} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="shadow p-3 mb-2 bg-body-tertiary rounded">
                <div className="row">
                  <div className="badge text-bg-primary text-wrap mb-3">
                    CIRIOS
                  </div>
                  <div className="col-md-4">
                    <div className="input-group " title="Cirio de comunión">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">CC: $</span>
                      <input type="text" className="form-control" pattern="[0-9]*" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="cc" value={cc || 0} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group " title="Cirio de bautizo">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">CB: $</span>
                      <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="cb" value={cb || 0} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="shadow p-3 mb-2 bg-body-tertiary rounded">
                <div className="row">
                  <div className="badge text-bg-primary text-wrap mb-3">
                    GUANTES POR DOCENA
                  </div>
                  <div className="col-md-4">
                    <div className="input-group " title="Guantes blancos">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">BLANCOS: $</span>
                      <input type="text" className="form-control" pattern="[0-9]*" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="gb" value={gb || 0} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group " title="Guantes negros">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">NEGROS: $</span>
                      <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="gn" value={gn || 0} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group " title="Guantes de miton">
                      <span className="input-group-text fw-semibold" id="inputGroup-sizing-default">MITON: $</span>
                      <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" name="gm" value={gm || 0} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

