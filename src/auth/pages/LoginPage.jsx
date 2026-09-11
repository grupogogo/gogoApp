import { useState } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useForm } from '../../hooks/useForm';
import { useClientesStore } from '../../hooks';
import Swal from 'sweetalert2';
import { FuturisticBackground } from '../components/FuturisticBackground';
import './LoginPage.css';

const loginFormFields = {
  loginEmail: '',
  loginPassword: '',
};

const registerFormFields = {
  registerName: '',
  registerEmail: '',
  registerPassword: '',
  registerPassword2: '',
  telefono: '',
  numIdentificacion: '',
};

export const LoginPage = () => {
  const { errorMessage, startRegister, startLogin } = useAuthStore();
  const { limpiarClienteActivo } = useClientesStore();

  const { loginEmail, loginPassword, onInputChange: onLoginInputChange } = useForm(loginFormFields);
  const {
    telefono,
    numIdentificacion,
    registerEmail,
    registerName,
    registerPassword2,
    registerPassword,
    onInputChange: onRegisterInputChange,
  } = useForm(registerFormFields);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPassword2, setShowRegisterPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginSubmit = async (event) => {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, ingrese su correo y contraseña para acceder al sistema.',
        icon: 'warning',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await startLogin({ email: loginEmail, password: loginPassword });
      limpiarClienteActivo();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: errorMessage || error?.message || 'Credenciales no válidas. Verifique sus datos.',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerSubmit = async (event) => {
    event.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, complete los campos obligatorios.',
        icon: 'warning',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7',
      });
      return;
    }

    if (registerPassword !== registerPassword2) {
      Swal.fire({
        title: 'Contraseñas no coinciden',
        text: 'Asegúrese de escribir exactamente la misma contraseña en ambos campos.',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await startRegister({
        email: registerEmail,
        password: registerPassword,
        name: registerName,
        telefono: telefono,
        numIdentificacion: numIdentificacion,
      });

      Swal.fire({
        title: 'Registro Exitoso',
        text: 'La cuenta corporativa ha sido creada satisfactoriamente.',
        icon: 'success',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#10b981',
      });
      setIsLoginMode(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: errorMessage || error?.message || 'No se pudo completar el registro.',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="futuristic-login-viewport">
      {/* Fondo interactivo Canvas + Efectos de Luz */}
      <FuturisticBackground />

      <div className="login-content-wrapper">
        <div className="futuristic-glass-card">
          {/* Header del Negocio */}
          <div className="card-brand-header">
            <div className="brand-logo-container">
              <div className="brand-logo-halo" />
              <img
                src="/images/logos/LOGO GOGO BLANCO.webp"
                alt="Logo Grupo Gogo"
                className="brand-logo-img"
              />
            </div>

            <div className="brand-titles">
              <h1 className="brand-name">
                GRUPO <span className="brand-accent">GOGO</span>
              </h1>
              <p className="brand-tagline">SISTEMA COMERCIAL & GESTIÓN</p>
            </div>

            {/* Badges de Estado y Pilares del Negocio */}
            <div className="brand-meta-pills">
              <span className="system-status-pill">
                <span className="live-dot" /> SISTEMA ONLINE
              </span>
              <span className="business-pill">
                <i className="fa fa-shield-alt me-1" /> ACCESO SEGURO
              </span>
            </div>
          </div>

          {/* Segmented Switch Futurista */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`tab-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => setIsLoginMode(true)}
            >
              <i className="fa fa-sign-in-alt me-2" />
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`tab-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => setIsLoginMode(false)}
            >
              <i className="fa fa-user-plus me-2" />
              Crear Cuenta
            </button>
          </div>

          {/* FORMULARIO DE INGRESO */}
          {isLoginMode && (
            <form onSubmit={loginSubmit} className="futuristic-form animate-fade-in" noValidate>
              <div className="cyber-field-group">
                <label className="cyber-label">
                  <i className="fa fa-envelope label-icon" /> Correo Electrónico
                </label>
                <div className="cyber-input-wrapper">
                  <input
                    type="email"
                    className="cyber-input"
                    placeholder="ejemplo@grupogogo.com"
                    value={loginEmail}
                    name="loginEmail"
                    onChange={onLoginInputChange}
                    autoComplete="username"
                    required
                  />
                  <span className="input-focus-border" />
                </div>
              </div>

              <div className="cyber-field-group">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="cyber-label mb-0">
                    <i className="fa fa-lock label-icon" /> Contraseña
                  </label>
                </div>
                <div className="cyber-input-wrapper">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="cyber-input has-action-btn"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    name="loginPassword"
                    onChange={onLoginInputChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex="-1"
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    <i className={`fa ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                  <span className="input-focus-border" />
                </div>
              </div>

              <button
                type="submit"
                className="cyber-submit-btn"
                disabled={isSubmitting}
              >
                <span className="btn-light-sweep" />
                <span className="btn-content">
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <span>ACCEDER AL SISTEMA</span>
                      <i className="fa fa-arrow-right ms-2 btn-arrow-icon" />
                    </>
                  )}
                </span>
              </button>

              <div className="form-footer-meta">
                <span className="footer-tag">
                  <i className="fa fa-boxes-stacked me-1" /> Pedidos • Cirios • Ceremonial • Distribución
                </span>
              </div>
            </form>
          )}

          {/* FORMULARIO DE REGISTRO */}
          {!isLoginMode && (
            <form onSubmit={registerSubmit} className="futuristic-form animate-fade-in" noValidate>
              <div className="cyber-field-group">
                <label className="cyber-label">
                  <i className="fa fa-user label-icon" /> Nombre Completo
                </label>
                <div className="cyber-input-wrapper">
                  <input
                    type="text"
                    className="cyber-input"
                    placeholder="Ej. Juan Pérez"
                    name="registerName"
                    value={registerName}
                    onChange={onRegisterInputChange}
                    required
                  />
                  <span className="input-focus-border" />
                </div>
              </div>

              <div className="cyber-field-group">
                <label className="cyber-label">
                  <i className="fa fa-envelope label-icon" /> Correo Electrónico
                </label>
                <div className="cyber-input-wrapper">
                  <input
                    type="email"
                    className="cyber-input"
                    placeholder="correo@empresa.com"
                    name="registerEmail"
                    value={registerEmail}
                    onChange={onRegisterInputChange}
                    required
                  />
                  <span className="input-focus-border" />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div className="cyber-field-group">
                    <label className="cyber-label">
                      <i className="fa fa-lock label-icon" /> Contraseña
                    </label>
                    <div className="cyber-input-wrapper">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        className="cyber-input has-action-btn"
                        placeholder="••••••••"
                        name="registerPassword"
                        value={registerPassword}
                        onChange={onRegisterInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        tabIndex="-1"
                      >
                        <i className={`fa ${showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                      </button>
                      <span className="input-focus-border" />
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="cyber-field-group">
                    <label className="cyber-label">
                      <i className="fa fa-shield-alt label-icon" /> Confirmar
                    </label>
                    <div className="cyber-input-wrapper">
                      <input
                        type={showRegisterPassword2 ? 'text' : 'password'}
                        className="cyber-input has-action-btn"
                        placeholder="••••••••"
                        name="registerPassword2"
                        value={registerPassword2}
                        onChange={onRegisterInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegisterPassword2(!showRegisterPassword2)}
                        tabIndex="-1"
                      >
                        <i className={`fa ${showRegisterPassword2 ? 'fa-eye-slash' : 'fa-eye'}`} />
                      </button>
                      <span className="input-focus-border" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div className="cyber-field-group">
                    <label className="cyber-label">
                      <i className="fa fa-phone label-icon" /> Teléfono
                    </label>
                    <div className="cyber-input-wrapper">
                      <input
                        type="tel"
                        className="cyber-input"
                        placeholder="300 000 0000"
                        name="telefono"
                        value={telefono}
                        onChange={onRegisterInputChange}
                      />
                      <span className="input-focus-border" />
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="cyber-field-group">
                    <label className="cyber-label">
                      <i className="fa fa-id-card label-icon" /> Identificación / Cédula
                    </label>
                    <div className="cyber-input-wrapper">
                      <input
                        type="text"
                        className="cyber-input"
                        placeholder="Número de ID"
                        name="numIdentificacion"
                        value={numIdentificacion}
                        onChange={onRegisterInputChange}
                      />
                      <span className="input-focus-border" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="cyber-submit-btn"
                disabled={isSubmitting}
              >
                <span className="btn-light-sweep" />
                <span className="btn-content">
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <span>REGISTRAR USUARIO</span>
                      <i className="fa fa-check-circle ms-2 btn-arrow-icon" />
                    </>
                  )}
                </span>
              </button>
            </form>
          )}

          {/* Pie de tarjeta con información corporativa */}
          <div className="card-footer-branding">
            <span>Grupo Gogo &copy; {new Date().getFullYear()} • Plataforma Tecnológica</span>
          </div>
        </div>
      </div>
    </div>
  );
};
