import { LayoutApp } from "../../layout/LayoutApp";
import { useAuthStore, useForm } from "../../hooks";
import { Ventas } from "../components/Ventas";
import { useState } from "react";

export const MainDashboard = () => {
  const { user } = useAuthStore();
  const { onInputChange } = useForm();
  const [datosUsuario, setDatosUsuario] = useState(true);

  const selTipoCliente = (event) => {
    setDatosUsuario(event.target.checked);
    onInputChange(event);
  };

  const anioActual = new Date().getFullYear();

  return (
    <LayoutApp>
      <div className="m-3">
        <div className="row mb-3">
          <div className="col-md-6 border">
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
          </div>
        </div>
        <hr className="border border-primary border-3 opacity-80 mt-0" />
        <Ventas datosUsuario={datosUsuario} />
      </div>
    </LayoutApp>
  );
};
