import { useEffect, useState } from "react";
import { useForm } from "../../hooks/";
import { useClientesStore } from "../../hooks";

export const ClientesForm = ({ setCliente, cliente }) => {
  const { clienteActivo } = useClientesStore();

  // Si el cliente tiene precios configurados previamente, desplegar la sección por defecto
  const tienePreciosPrevios = Boolean(
    clienteActivo?.precios &&
    (clienteActivo.precios.precioKits?.kcg ||
     clienteActivo.precios.precioKits?.kcp ||
     clienteActivo.precios.precioKits?.kb ||
     clienteActivo.precios.precioKits?.kce ||
     clienteActivo.precios.precioCirios?.cc ||
     clienteActivo.precios.precioCirios?.ccon ||
     clienteActivo.precios.precioCirios?.cb ||
     clienteActivo.precios.precioGuantes?.gb ||
     clienteActivo.precios.precioGuantes?.gn ||
     clienteActivo.precios.precioGuantes?.gm)
  );

  const [checkPrecios, setCheckPrecios] = useState(tienePreciosPrevios);
  const [clienteTipo, setClienteTipo] = useState(clienteActivo?.distribuidor !== undefined ? clienteActivo.distribuidor : true);

  const {
    nombre = '',
    email = '',
    nitCC = '',
    telefono = '',
    direccion = '',
    ciudad = '',
    detalle = '',
    distribuidor = true,
    precios: {
      precioKits: { kcg = 0, kcp = 0, kb = 0, kce = 0 } = {},
      precioCirios: { cc = 0, cb = 0, ccon = 0 } = {},
      precioGuantes: { gb = 0, gn = 0, gm = 0 } = {}
    } = {},
    onInputChange,
    formState
  } = useForm(clienteActivo || {
    distribuidor: true,
    precios: {
      precioKits: { kcg: 0, kcp: 0, kb: 0, kce: 0 },
      precioCirios: { cc: 0, cb: 0, ccon: 0 },
      precioGuantes: { gb: 0, gn: 0, gm: 0 }
    }
  });

  const handleTipoClienteSelect = (esDistribuidor) => {
    setClienteTipo(esDistribuidor);
    onInputChange({
      target: {
        name: 'distribuidor',
        value: esDistribuidor
      }
    });
  };

  const handleChange = (event) => {
    onInputChange(event);
  };

  useEffect(() => {
    // Sincronizar formState asegurando que distribuidor y la estructura de precios estén completos
    setCliente({
      ...formState,
      distribuidor: clienteTipo,
      precios: {
        ...(formState.precios?._id && { _id: formState.precios._id }),
        ...(formState.precios?.Precios_id && { Precios_id: formState.precios.Precios_id }),
        precioKits: {
          kcg: Number(formState.precios?.precioKits?.kcg) || 0,
          kcp: Number(formState.precios?.precioKits?.kcp) || 0,
          kb: Number(formState.precios?.precioKits?.kb) || 0,
          kce: Number(formState.precios?.precioKits?.kce) || 0,
        },
        precioCirios: {
          cc: Number(formState.precios?.precioCirios?.cc) || 0,
          ccon: Number(formState.precios?.precioCirios?.ccon) || 0,
          cb: Number(formState.precios?.precioCirios?.cb) || 0,
        },
        precioGuantes: {
          gb: Number(formState.precios?.precioGuantes?.gb) || 0,
          gn: Number(formState.precios?.precioGuantes?.gn) || 0,
          gm: Number(formState.precios?.precioGuantes?.gm) || 0,
        }
      }
    });
  }, [formState, clienteTipo]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* SELECTOR DE TIPO DE CLIENTE (DISTRIBUIDOR VS UNITARIO) */}
      <div>
        <label className="form-label small fw-semibold text-muted mb-2">
          Perfil del Cliente
        </label>
        <div className="row g-2">
          <div className="col-12 col-sm-6">
            <div
              className={`p-3 rounded-4 border transition-all cursor-pointer d-flex align-items-center gap-3 ${
                clienteTipo
                  ? 'border-primary bg-primary bg-opacity-10 shadow-xs'
                  : 'border-light-subtle bg-light bg-opacity-50 text-muted'
              }`}
              onClick={() => handleTipoClienteSelect(true)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className={`p-3 rounded-circle d-flex align-items-center justify-content-center ${
                  clienteTipo ? 'bg-primary text-white shadow-xs' : 'bg-white text-secondary border'
                }`}
                style={{ width: 44, height: 44 }}
              >
                <i className="fa-solid fa-store"></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-between">
                  <span className={`fw-bold ${clienteTipo ? 'text-primary' : 'text-dark'}`}>
                    Distribuidor
                  </span>
                  {clienteTipo && (
                    <i className="fa-solid fa-circle-check text-primary"></i>
                  )}
                </div>
                <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                  Tarifas mayoristas por volumen
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6">
            <div
              className={`p-3 rounded-4 border transition-all cursor-pointer d-flex align-items-center gap-3 ${
                !clienteTipo
                  ? 'border-primary bg-primary bg-opacity-10 shadow-xs'
                  : 'border-light-subtle bg-light bg-opacity-50 text-muted'
              }`}
              onClick={() => handleTipoClienteSelect(false)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className={`p-3 rounded-circle d-flex align-items-center justify-content-center ${
                  !clienteTipo ? 'bg-primary text-white shadow-xs' : 'bg-white text-secondary border'
                }`}
                style={{ width: 44, height: 44 }}
              >
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-between">
                  <span className={`fw-bold ${!clienteTipo ? 'text-primary' : 'text-dark'}`}>
                    Unitario / Estándar
                  </span>
                  {!clienteTipo && (
                    <i className="fa-solid fa-circle-check text-primary"></i>
                  )}
                </div>
                <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                  Tarifas estándar y venta directa
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATOS GENERALES Y DE CONTACTO */}
      <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white">
        <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
          <div className="p-2 rounded-circle bg-light text-primary d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
            <i className="fa-solid fa-address-card small"></i>
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-0">Información General y Despacho</h6>
            <small className="text-muted">Datos necesarios para emisión y entregas</small>
          </div>
        </div>

        <div className="row g-3">
          {/* NOMBRE / RAZÓN SOCIAL */}
          <div className="col-12 col-md-8">
            <label htmlFor="iName" className="form-label small fw-semibold text-muted mb-1">
              Razón social / Nombre del cliente <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-light-subtle">
                <i className="fa-solid fa-building-user"></i>
              </span>
              <input
                type="text"
                className="form-control shadow-none border-light-subtle"
                id="iName"
                name="nombre"
                placeholder="Ej: Distribuidora Los Ángeles SAS"
                value={nombre || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* NIT / CC */}
          <div className="col-12 col-md-4">
            <label htmlFor="iNit" className="form-label small fw-semibold text-muted mb-1">
              NIT / Cédula
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-light-subtle">
                <i className="fa-solid fa-id-card"></i>
              </span>
              <input
                type="text"
                className="form-control shadow-none border-light-subtle"
                id="iNit"
                name="nitCC"
                placeholder="Ej: 900.123.456-7"
                value={nitCC || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* CIUDAD */}
          <div className="col-12 col-md-4">
            <label htmlFor="iCountry" className="form-label small fw-semibold text-muted mb-1">
              Ciudad / Municipio <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-light-subtle">
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <input
                type="text"
                className="form-control shadow-none border-light-subtle"
                id="iCountry"
                name="ciudad"
                placeholder="Ej: Bogotá D.C."
                value={ciudad || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* TELÉFONO */}
          <div className="col-12 col-md-4">
            <label htmlFor="iphone" className="form-label small fw-semibold text-muted mb-1">
              Teléfono / Celular
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-light-subtle">
                <i className="fa-solid fa-phone"></i>
              </span>
              <input
                type="tel"
                className="form-control shadow-none border-light-subtle"
                id="iphone"
                name="telefono"
                placeholder="Ej: 310 123 4567"
                value={telefono || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* CORREO */}
          <div className="col-12 col-md-4">
            <label htmlFor="imail" className="form-label small fw-semibold text-muted mb-1">
              Correo Electrónico
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-light-subtle">
                @
              </span>
              <input
                type="email"
                className="form-control shadow-none border-light-subtle"
                id="imail"
                name="email"
                placeholder="cliente@correo.com"
                value={email || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="col-12">
            <label htmlFor="iAddress" className="form-label small fw-semibold text-muted mb-1">
              Dirección e indicaciones de despacho
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-light-subtle">
                <i className="fa-solid fa-map-pin"></i>
              </span>
              <input
                type="text"
                className="form-control shadow-none border-light-subtle"
                id="iAddress"
                name="direccion"
                placeholder="Ej: Cra 15 # 45-20 Local 102 - Entregar en portería"
                value={direccion || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* DETALLE / NOTAS */}
          <div className="col-12">
            <label htmlFor="aInfoAdd" className="form-label small fw-semibold text-muted mb-1">
              Información Adicional / Notas internas (opcional)
            </label>
            <textarea
              className="form-control shadow-none border-light-subtle"
              id="aInfoAdd"
              name="detalle"
              value={detalle || ''}
              onChange={handleChange}
              rows="2"
              placeholder="Horarios de recepción, notas sobre facturación o preferencias..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE TARIFAS Y PRECIOS PERSONALIZADOS */}
      <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <i className="fa-solid fa-tags small"></i>
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-0">Tarifas y Precios Personalizados</h6>
              <small className="text-muted">Asigna precios especiales ($ COP) para este cliente</small>
            </div>
          </div>

          <div className="form-check form-switch m-0">
            <input
              className="form-check-input shadow-none cursor-pointer"
              type="checkbox"
              role="switch"
              id="flexSwitchCheckPrecios"
              checked={checkPrecios}
              onChange={(e) => setCheckPrecios(e.target.checked)}
              style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
            />
          </div>
        </div>

        {checkPrecios && (
          <div className="pt-3 mt-3 border-top d-flex flex-column gap-3">
            {/* PRECIOS KITS */}
            <div className="p-3 rounded-4 bg-light border border-light-subtle">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary text-white rounded-pill px-2 py-1 small">
                  <i className="fa-solid fa-boxes-packing me-1"></i> Kits
                </span>
                <small className="text-muted">Tarifas por unidad de kit</small>
              </div>

              <div className="row g-2">
                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted mb-1">KC-G (Grande)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="kcg"
                      value={kcg || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted mb-1">KC-P (Pequeño)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="kcp"
                      value={kcp || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted mb-1">KB (Bautizo)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="kb"
                      value={kb || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted mb-1">KC-E (Económico)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="kce"
                      value={kce || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PRECIOS CIRIOS */}
            <div className="p-3 rounded-4 bg-light border border-light-subtle">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-warning text-dark rounded-pill px-2 py-1 small">
                  <i className="fa-solid fa-fire-flame-curved me-1"></i> Cirios
                </span>
                <small className="text-muted">Tarifas por unidad de cirio</small>
              </div>

              <div className="row g-2">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">CC (Cirio Comunión)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="cc"
                      value={cc || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">CCON (Cirio Confirmación)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="ccon"
                      value={ccon || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">CB (Cirio Bautizo)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="cb"
                      value={cb || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PRECIOS GUANTES */}
            <div className="p-3 rounded-4 bg-light border border-light-subtle">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success text-white rounded-pill px-2 py-1 small">
                  <i className="fa-solid fa-hand me-1"></i> Guantes
                </span>
                <small className="text-muted">Tarifas por docena / par</small>
              </div>

              <div className="row g-2">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">Guantes Blancos</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="gb"
                      value={gb || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">Guantes Negros</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="gn"
                      value={gn || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">Guantes Mitón</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">$</span>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end fw-bold shadow-none"
                      name="gm"
                      value={gm || 0}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


