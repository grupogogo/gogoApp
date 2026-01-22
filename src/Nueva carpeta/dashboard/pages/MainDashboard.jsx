import { LayoutApp } from "../../layout/LayoutApp";
import { useAuthStore, useForm } from "../../hooks";
import { Ventas } from "../components/Ventas";
import { useState } from "react";

export const MainDashboard = () => {
  const { user } = useAuthStore();

  const { onInputChange } = useForm();
  const [datosUsuario, setDatosUsuario] = useState((user.rol !== 'vendedor') ? true : false);

  const selTipoCliente = (event) => {
    setDatosUsuario(event.target.checked);
    onInputChange(event);
  };

  const anioActual = new Date().getFullYear();

  return (
    <LayoutApp>
      <div className="m-3 ">
        <div className="row mb-3 card shadow p-3 bg-body rounded">
          <div className="col-md-6">
            {(user.rol === 'superAdmin' || user.rol === 'admin') && (
              <>
                <div
                  className="d-flex align-items-center  justify-content-middle"
                  alt="Click para ver los datos del usuario logueado"
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckClienteDistribuidor"
                    name="distribuidor"
                    checked={datosUsuario}
                    onChange={selTipoCliente}
                  />

                  <span className="fs-5 ms-2">
                    Datos {datosUsuario ? `globales ${anioActual}` : user.name}
                  </span>
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckClienteDistribuidor"
                  >
                  </label>
                </div>
              </>
            )}
            {(user.rol === 'vendedor') && (
              <>
                Estadisticas del distribuidor {user.name}
              </>
            )}
          </div>
        </div>
        <Ventas datosUsuario={datosUsuario} />
      </div>
    </LayoutApp>
  );
};
