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
          <div className="col-md-12">
            <div
              className="d-flex align-item-center"
              alt="Click para ver los datos del usuario logueado"
            >
              <span className="me-2 fs-5">
                Datos {datosUsuario ? `globales ${anioActual}` : user.name}
              </span>
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckClienteDistribuidor"
                name="distribuidor"
                checked={datosUsuario}
                onChange={selTipoCliente}
              />
              <label
                className="form-check-label"
                htmlFor="flexSwitchCheckClienteDistribuidor"
              ></label>
            </div>
          </div>
        </div>

        <hr className="border border-primary border-3 opacity-80 mt-0" />

        <Ventas datosUsuario={datosUsuario} />
      </div>
    </LayoutApp>
  );
};
