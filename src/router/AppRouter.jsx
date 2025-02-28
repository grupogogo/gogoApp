import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "../auth"
import { CalendarPage } from "../calendar";
import { MainDashboard } from "../dashboard/pages/MainDashboard";
import { Pedidos } from "../pedidos/pages/Pedidos";
import { Budget } from "../budget/pages/budget";
import { Clientes } from "../clients/pages/Clientes";
import { useAuthStore } from "../hooks";
import { useEffect } from "react";
import { ListaPedidos } from "../pedidos/pages/ListaPedidos";

export const AppRouter = () => {
  const { status, checkAuthToken } = useAuthStore();
  const { user } = useAuthStore();
  useEffect(() => {
    checkAuthToken();
  }, [])

  if (status === 'checking') {
    //&& (user.rol === 'superAdmin' || user.rol === 'admin')
    return (
      <>
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </>
    )
  }

  return (
    <Routes>
      {(status === 'not-authenticated')
        ? (
          <>
            <Route path="/auth/*" element={<LoginPage />} />
            <Route path="/*" element={<LoginPage />} />
          </>
        )
        : (
          <>
            {(user.rol === 'superAdmin' || user.rol === 'admin') && (

              <>
                <Route path="/*" element={<MainDashboard />} />
                <Route path="/calendar/*" element={<CalendarPage />} />
                <Route path="/pedidos/*" element={<Pedidos />} />
                <Route path="/listaPedidos/*" element={<ListaPedidos />} />
                <Route path="/budget/*" element={<Budget />} />
                <Route path="/clientes/*" element={<Clientes />} />
                <Route path="/*" element={<Navigate to={"/"} />}> </Route>
              </>
            )}
            {(user.rol === 'planta' || user.rol === '') && (
            <Route path="/listaPedidos/*" element={<ListaPedidos />} />
            )}
          </>
        )}
      <Route path="/*" element={<Navigate to="/auth/login" />} />
    </Routes>
  )
}
