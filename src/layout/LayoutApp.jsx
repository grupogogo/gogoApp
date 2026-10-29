import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "react-datepicker/dist/react-datepicker.css";
import { useAuthStore } from "../hooks";

export const LayoutApp = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || !user.rol) return null;

  const isPlanta = user.rol === 'planta';

  return (
    <div className="d-flex w-100" style={{ minHeight: "100vh", maxWidth: "100vw" }}>
      <Sidebar />
      <div 
        className="layout-wrapper flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: isPlanta ? "0px" : "80px",
          width: isPlanta ? "100%" : "calc(100% - 80px)",
          maxWidth: isPlanta ? "100%" : "calc(100% - 80px)",
          minWidth: 0,
          transition: "margin-left 0.3s ease, width 0.3s ease, max-width 0.3s ease"
        }}
      >
        <Navbar />
        <main
          className="flex-grow-1 p-2 p-md-3 main-content w-100"
          style={{
            minWidth: 0,
            maxWidth: "100%"
          }}
        >
          <div className="container-fluid px-1 px-sm-2 px-md-3" style={{ minWidth: 0, maxWidth: "100%" }}>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};
