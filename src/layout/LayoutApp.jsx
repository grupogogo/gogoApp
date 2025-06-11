import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "react-datepicker/dist/react-datepicker.css";
import { useAuthStore } from "../hooks";

export const LayoutApp = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || !user.rol) return null;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />
        <main
          className="flex-grow-1 p-3 main-content"
          style={{
            marginLeft: user.rol === 'planta' ? "0px" : "80px",
            transition: "margin-left 0.3s ease",
            overflowX: "hidden" // <- Esto evita que el contenido se desborde en X
          }}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
