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
import { grid } from 'ldrs'
import { Gastos } from "../gastos/pages/Gastos";
import { C } from "@table-library/react-table-library/Cell-a4350b14";
import { CuentasXCobrar } from "../cxc/pages/CuentasXCobrar";
import { OldOrders } from "../pedidos/pages/OldOrders";
import { ListOldOrders } from "../pedidos/pages/ListOldOrders";
grid.register()

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
        <div className="container login-container">
          <div className="">
            <l-quantum
              size="660"
              speed="1.5"
              color="blue"
            ></l-quantum>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
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
                  <Route path="/pedidos" element={<Pedidos />} />
                  <Route path="/pedidos/old" element={<OldOrders />} />
                  <Route path="/pedidos/listOldOrders" element={<ListOldOrders />} />
                  <Route path="/gastos/*" element={<Gastos />} />
                  <Route path="/listaPedidos/*" element={<ListaPedidos />} />0
                  <Route path="/budget/*" element={<Budget />} />
                  <Route path="/clientes/*" element={<Clientes />} />
                  <Route path="/CuentasXCobrar/*" element={<CuentasXCobrar />} />
                  <Route path="/*" element={<Navigate to={"/"} />}> </Route>
                </>
              )}
              {(user.rol === 'vendedor') && (
                <>
                  <Route path="/*" element={<MainDashboard />} />
                  <Route path="/calendar/*" element={<CalendarPage />} />
                  <Route path="/pedidos" element={<Pedidos />} />                  
                  <Route path="/listaPedidos/*" element={<ListaPedidos />} />0
                  <Route path="/budget/*" element={<Budget />} />
                  <Route path="/clientes/*" element={<Clientes />} />
                  <Route path="/CuentasXCobrar/*" element={<CuentasXCobrar />} />
                  <Route path="/*" element={<Navigate to={"/"} />}> </Route>
                </>
              )}
              {(user.rol === 'planta' || user.rol === '') && (
                <>
                  <Route path="/listaPedidos/*" element={<ListaPedidos />} />
                  <Route path="/*" element={<ListaPedidos />} />
                </>
              )}
            </>
          )}
        <Route path="/*" element={<Navigate to="/auth/login" />} />
      </Routes>
    </>
  )
}