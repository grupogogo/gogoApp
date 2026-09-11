import { LayoutApp } from "../../layout/LayoutApp";
import { useAuthStore, useForm } from "../../hooks";
import { Ventas } from "../components/Ventas";
import { WidgetTareasPendientes } from "../components/WidgetTareasPendientes";
import { useState } from "react";

export const MainDashboard = () => {
  const { user } = useAuthStore();
  const { onInputChange } = useForm();
  const esKarol = user?.name?.toLowerCase().includes('karol') || user?.email?.toLowerCase().includes('karol') || user?.rol === 'vendedor';
  const [datosUsuario, setDatosUsuario] = useState(!esKarol);

  const selTipoCliente = (event) => {
    if (esKarol) return;
    setDatosUsuario(event.target.checked);
    onInputChange(event);
  };

  const anioActual = new Date().getFullYear();

  return (
    <LayoutApp>
      <div className="container-fluid px-2 px-md-3 py-1">
        {/* Barra de Filtros y Estado del Dashboard */}
        <div className="card border border-light-subtle shadow-sm rounded-4 mb-3 bg-white">
          <div className="card-body py-2 px-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="p-2 bg-primary-subtle text-primary rounded-3 shadow-xs">
                <i className="fas fa-chart-pie"></i>
              </span>
              <div>
                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  Panel de Rendimiento Comercial
                </h6>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Métricas de facturación, pedidos y distribución {anioActual}
                </small>
              </div>
            </div>

            {/* Switch de Filtro Global / Usuario */}
            {(!esKarol && (user.rol === 'superAdmin' || user.rol === 'admin')) ? (
              <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 border border-light-subtle shadow-xs">
                <div className="form-check form-switch mb-0 d-flex align-items-center gap-2 cursor-pointer">
                  <input
                    className="form-check-input my-0 cursor-pointer"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckClienteDistribuidor"
                    checked={datosUsuario}
                    onChange={selTipoCliente}
                    style={{ width: '2.4rem', height: '1.25rem' }}
                  />
                  <label
                    className="form-check-label mb-0 text-dark fw-semibold small cursor-pointer"
                    htmlFor="flexSwitchCheckClienteDistribuidor"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {datosUsuario ? (
                      <span className="d-flex align-items-center gap-1 text-primary">
                        <i className="fas fa-globe"></i> Datos Globales ({anioActual})
                      </span>
                    ) : (
                      <span className="d-flex align-items-center gap-1 text-warning-emphasis">
                        <i className="fas fa-user"></i> Solo Mis Ventas
                      </span>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div className="badge bg-light text-secondary border px-3 py-2 rounded-pill small">
                <i className="fas fa-chart-line me-1 text-primary"></i> Mis estadísticas de venta {esKarol ? '(Karol Gómez)' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Widget de Tareas Pendientes del Usuario */}
        <WidgetTareasPendientes />

        <Ventas datosUsuario={esKarol ? false : datosUsuario} />
      </div>
    </LayoutApp>
  );
};
