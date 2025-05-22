import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "react-datepicker/dist/react-datepicker.css";

export const LayoutApp = ({ children }) => {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar/>
        <main className="flex-grow-1 p-3 " style={{ marginLeft: "80px", transition: "margin-left 0.3s ease" }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
