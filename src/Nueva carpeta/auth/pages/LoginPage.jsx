import { useEffect, useState } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useForm } from '../../hooks/useForm';
import './LoginPage.css';
import Swal from 'sweetalert2';
import { Col, Row } from 'react-bootstrap';
import { useClientesStore } from '../../hooks';

const loginFormFields = {
  loginEmail: '',
  loginPassword: '',
}

const registerFormFields = {
  registerName: '',
  registerEmail: '',
  registerPassword: '',
  registerPassword2: '',
  telefono: '',
  numIdentificacion: '',
}

export const LoginPage = () => {

  const { errorMessage, startRegister } = useAuthStore();

  const { loginEmail, loginPassword, onInputChange: onLoginInputChange } = useForm(loginFormFields);
  const { telefono, numIdentificacion, registerEmail, registerName, registerPassword2, registerPassword, onInputChange: onRegisterInputChange } = useForm(registerFormFields);
  const { startLogin } = useAuthStore();
  const { limpiarClienteActivo } = useClientesStore();
  const [changeWindow, setChangeWindow] = useState(true)

  const loginSubmit = async (event) => {
    event.preventDefault();
    if (loginEmail === '' || loginPassword === '') {
      Swal.fire({
        title: "Llene los campos solicitados",
        text: errorMessage,
        icon: "error"
      })
      return;
    } else {
      try {
        await startLogin({ email: loginEmail, password: loginPassword });
        limpiarClienteActivo(); // Limpiar si el login es exitoso
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      }
    }
  }

  const registerSubmit = async (event) => {
    event.preventDefault();
    if (registerPassword !== registerPassword2) {
      Swal.fire({
        title: "Contraseña incorrecta",
        text: errorMessage,
        icon: "error"
      })
      return;
    } else {
      try {
        await
          startRegister({
            email: registerEmail,
            password: registerPassword,
            name: registerName,
            telefono: telefono,
            numIdentificacion: numIdentificacion,
          });
        Swal.fire({
          title: "Guardado satisfactoriamente",
          icon: "success",
          draggable: true
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      }
    }
  }



  return (
    <div className="container login-container">
      <div className="row">
        {(changeWindow) && (
          <div className="col-md-6 login-form-1">
            <h3>Ingresar</h3>
            <form onSubmit={loginSubmit}>
              <div className="form-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Correo"
                  value={loginEmail}
                  name='loginEmail'
                  onChange={onLoginInputChange}
                />
              </div>
              <div className="form-group mb-2">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  value={loginPassword}
                  name='loginPassword'
                  onChange={onLoginInputChange}
                />
              </div>
              <div className="form-group mb-2d-grid">
                <input
                  type="submit"
                  className="btnSubmit"
                  value="Login"

                />
              </div>
              <div className='text-end'>
                <a
                  href="#"
                  onClick={() => setChangeWindow(!changeWindow)}
                  className="text-decoration-underline">Registrarse</a>
              </div>
            </form>
          </div>
        )}

        {(!changeWindow) && (
          <div className="col-xs-12 col-md-6 login-form-2">
            <h3>Registro</h3>
            <form onSubmit={registerSubmit}>
              <div className="form-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  name='registerName'
                  value={registerName}
                  onChange={onRegisterInputChange}
                />
              </div>
              <div className="form-group mb-2">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Correo"
                  name='registerEmail'
                  value={registerEmail}
                  onChange={onRegisterInputChange}
                />
              </div>
              <div className="form-group mb-2">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  name='registerPassword'
                  value={registerPassword}
                  onChange={onRegisterInputChange}
                />
              </div>
              <div className="form-group mb-2">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repita la contraseña"
                  name='registerPassword2'
                  value={registerPassword2}
                  onChange={onRegisterInputChange}
                />
              </div>

              <Row>
                <Col className='col-md-6'>
                  <div className="form-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Teléfono"
                      name='telefono'
                      value={telefono}
                      onChange={onRegisterInputChange}
                    />
                  </div>
                </Col>
                <Col className='col-md-6'>
                  <div className="form-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Número de identificación"
                      name='numIdentificacion'
                      value={numIdentificacion}
                      onChange={onRegisterInputChange}
                    />
                  </div>
                </Col>
              </Row>
              <div className="form-group mb-2">
                <input
                  type="submit"
                  className="btnSubmit"
                  value="Crear cuenta" />
              </div>
              <div className='text-end'>
                <a href="#"
                  onClick={() => setChangeWindow(!changeWindow)}
                  className="text-decoration-underline text-light">Inicio de sesión</a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
